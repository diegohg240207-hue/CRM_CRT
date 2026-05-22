import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reportes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private svc: ReportesService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'KPIs principales del dashboard' })
  getDashboard() { return this.svc.getDashboard(); }

  @Get('originacion')
  @ApiOperation({ summary: 'Originación últimos 12 meses' })
  getOriginacion() { return this.svc.getOriginacionMensual(); }

  @Get('riesgo')
  @ApiOperation({ summary: 'Distribución de riesgo de cartera' })
  getRiesgo() { return this.svc.getDistribucionRiesgo(); }

  @Get('ejecutivos')
  @ApiOperation({ summary: 'Top ejecutivos por originación' })
  getEjecutivos() { return this.svc.getEjecutivosTop(); }

  @Get('ejecutivo')
  @ApiOperation({ summary: 'Reporte ejecutivo completo' })
  getReporteCompleto() { return this.svc.getReporteEjecutivo(); }
}
