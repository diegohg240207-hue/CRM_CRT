import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CobranzaService } from './cobranza.service';
import { RegistrarAccionDto, UpdateCobranzaDto } from './dto/cobranza.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('cobranza')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR' as any, 'SUPERVISOR' as any, 'COBRANZA' as any, 'CREDITO' as any)
@Controller('cobranza')
export class CobranzaController {
  constructor(private svc: CobranzaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar cuentas en cobranza' })
  findAll(
    @Query('riesgo') riesgo?: string,
    @Query('estatus') estatus?: string,
    @Query('ejecutivoId') ejecutivoId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.svc.findAll({ riesgo, estatus, ejecutivoId, page: +page, limit: +limit });
  }

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs de cobranza' })
  getKpis() { return this.svc.getKpis(); }

  @Get('timeline')
  @ApiOperation({ summary: 'Timeline próximos 7 días de pagos' })
  getTimeline() { return this.svc.getTimelinePagos(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post(':id/accion')
  @Roles('ADMINISTRADOR' as any, 'SUPERVISOR' as any, 'COBRANZA' as any)
  @ApiOperation({ summary: 'Registrar acción de cobranza (llamada, WhatsApp, etc.)' })
  registrarAccion(
    @Param('id') id: string,
    @Body() dto: RegistrarAccionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.svc.registrarAccion(id, dto, userId);
  }
}
