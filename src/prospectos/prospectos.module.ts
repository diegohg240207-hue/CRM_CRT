import { Module } from '@nestjs/common';
import { ProspectosController } from './prospectos.controller';
import { ProspectosService } from './prospectos.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [ProspectosController],
  providers: [ProspectosService],
})
export class ProspectosModule {}
