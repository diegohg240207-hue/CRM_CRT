import { Module } from '@nestjs/common';
import { CreditosController } from './creditos.controller';
import { CreditosService } from './creditos.service';
import { ScoringModule } from '../scoring/scoring.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [ScoringModule, AuditModule],
  controllers: [CreditosController],
  providers: [CreditosService],
})
export class CreditosModule {}
