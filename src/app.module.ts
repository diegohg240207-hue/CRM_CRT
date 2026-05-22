import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { ProspectosModule } from './prospectos/prospectos.module';
import { ClientesModule } from './clientes/clientes.module';
import { CreditosModule } from './creditos/creditos.module';
import { ScoringModule } from './scoring/scoring.module';
import { CobranzaModule } from './cobranza/cobranza.module';
import { ReportesModule } from './reportes/reportes.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60000'),
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    SucursalesModule,
    ProspectosModule,
    ClientesModule,
    CreditosModule,
    ScoringModule,
    CobranzaModule,
    ReportesModule,
    AuditModule,
  ],
})
export class AppModule {}
