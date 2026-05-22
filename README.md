# CRM_CRT — Backend Enterprise API

Backend enterprise para el sistema CRM Casa Ruiz. Construido con NestJS, Prisma y PostgreSQL.

## Stack

- **Framework**: NestJS 10 + TypeScript
- **ORM**: Prisma 5 + PostgreSQL
- **Auth**: JWT + Refresh Tokens + RBAC
- **Docs**: Swagger (OpenAPI 3)
- **Infra**: Docker Compose

## Módulos

| Módulo | Descripción |
|--------|-------------|
| Auth | Login, JWT, refresh tokens, logout |
| Usuarios | CRUD + roles + activar/desactivar |
| Sucursales | 4 sucursales |
| Prospectos | CRM Kanban + timeline + interacciones |
| Clientes | Cartera + líneas de crédito |
| Créditos | Solicitudes + aprobación automática |
| Scoring | Motor financiero (5 variables) |
| Cobranza | Cuentas vencidas + acciones |
| Reportes | Dashboard + KPIs ejecutivos |
| Audit | Logs de todas las acciones |

## Setup rápido

```bash
# 1. Clonar e instalar
npm install

# 2. Configurar variables
cp .env.example .env
# Editar DATABASE_URL, JWT_SECRET, etc.

# 3. Base de datos (local con Docker)
docker-compose up -d postgres

# 4. Migraciones + seed
npx prisma migrate dev --name init
npm run prisma:seed

# 5. Levantar
npm run start:dev
```

## Cuentas demo

| Email | Password | Rol |
|-------|----------|-----|
| admin@casaruiz.mx | Admin123! | ADMINISTRADOR |
| supervisor@casaruiz.mx | Admin123! | SUPERVISOR |
| crm1@casaruiz.mx | CRM123! | EJECUTIVO_CRM |
| credito1@casaruiz.mx | Cred123! | CREDITO |
| cobranza1@casaruiz.mx | Cred123! | COBRANZA |

## API Docs

```
http://localhost:3000/api/docs
```

## Deploy

Backend: Railway / Render (Node.js server)
Frontend: Vercel (static)
DB: Supabase PostgreSQL

### Variables de producción

```env
DATABASE_URL=postgresql://...supabase.co:5432/postgres
JWT_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
FRONTEND_URL=https://crm-crt.vercel.app
NODE_ENV=production
```
