import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // ── Startup Security Assertions ────────────────────────────────────────────
  // Fail fast if critical secrets are missing — prevents insecure fallbacks
  const REQUIRED_ENV = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'];
  const missing = REQUIRED_ENV.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`[SECURITY] FATAL: Missing required environment variables: ${missing.join(', ')}`);
    console.error('[SECURITY] Server startup aborted to prevent insecure operation.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // ── Security Headers (Helmet) ──────────────────────────────────────────────
  app.use(
    helmet({
      // CSP for API responses (restrictive — no browser resources needed)
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          scriptSrc: ["'none'"],
          styleSrc: ["'self'", "'unsafe-inline'"],  // Swagger UI needs this
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      // Don't restrict cross-origin embedding for API responses
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    }),
  );

  // ── Cookie Parser (required for httpOnly cookie auth) ─────────────────────
  app.use(cookieParser());

  // ── Body Size Limits (DoS prevention) ─────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.setGlobalPrefix('api/v1');

  // ── CORS — strict origin whitelist, NO wildcard ────────────────────────────
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_ALT,
    // Add additional trusted origins via env var (comma-separated)
    ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(',').map((o) => o.trim()) : []),
  ].filter((o): o is string => !!o && o.length > 0);

  if (allowedOrigins.length === 0) {
    console.warn('[SECURITY] WARNING: No FRONTEND_URL configured. CORS will block all browser requests.');
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no Origin header) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Silently reject unknown origins (don't expose rejection reason)
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    credentials: true,
    maxAge: 86400, // 24h preflight cache
  });

  // ── Input Validation (global) ──────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: true, // Reject requests with unknown properties
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger ────────────────────────────────────────────────────────────────
  // Disable in production unless explicitly enabled via SWAGGER_ENABLED=true
  const swaggerEnabled = process.env.SWAGGER_ENABLED === 'true' || process.env.NODE_ENV !== 'production';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('CRM Casa Ruiz API')
      .setDescription('API enterprise para CRM, Créditos y Cobranza')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticación')
      .addTag('usuarios', 'Gestión de usuarios')
      .addTag('sucursales', 'Sucursales')
      .addTag('prospectos', 'CRM Prospectos')
      .addTag('clientes', 'Cartera de clientes')
      .addTag('creditos', 'Solicitudes de crédito')
      .addTag('scoring', 'Motor de scoring')
      .addTag('cobranza', 'Gestión de cobranza')
      .addTag('reportes', 'Dashboard ejecutivo')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`[CRM_CRT] Backend running on port ${port}`);
  console.log(`[CRM_CRT] Environment: ${process.env.NODE_ENV || 'development'}`);
  if (swaggerEnabled) console.log(`[CRM_CRT] Swagger: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('FATAL: Bootstrap failed:', err);
  process.exit(1);
});
