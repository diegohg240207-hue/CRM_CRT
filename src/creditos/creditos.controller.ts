import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { CreditosService } from './creditos.service';
import { CreateCreditoDto, UpdateCreditoDto } from './dto/credito.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('creditos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('creditos')
export class CreditosController {
  constructor(private svc: CreditosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar solicitudes de crédito' })
  findAll(
    @Query('estatus') estatus?: string,
    @Query('ejecutivoId') ejecutivoId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.svc.findAll({ estatus, ejecutivoId, page: +page, limit: +limit });
  }

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs de créditos del mes' })
  getKpis() { return this.svc.getKpis(); }

  @Get('export')
  @ApiOperation({ summary: 'Exportar cartera de créditos en CSV' })
  async exportCsv(
    @Query('estatus') estatus: string,
    @Res() res: Response,
  ) {
    const { data } = await this.svc.findAll({ estatus, page: 1, limit: 5000 });
    const headers = ['Folio', 'Cliente', 'Ejecutivo', 'Monto', 'Plazo', 'Mensualidad', 'Score', 'Riesgo', 'Estatus', 'Fecha'];
    const rows = data.map((c: any) => [
      c.folio,
      c.cliente?.nombre || '',
      c.ejecutivo?.nombre || '',
      c.monto,
      c.plazoMeses,
      Number(c.mensualidad).toFixed(2),
      c.scoreFinal,
      c.riesgo,
      c.estatus,
      c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-MX') : '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="creditos_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send('﻿' + csv); // BOM para Excel
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Crear solicitud de crédito con scoring automático' })
  create(@Body() dto: CreateCreditoDto, @CurrentUser('id') userId: string) {
    return this.svc.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCreditoDto, @CurrentUser('id') userId: string) {
    return this.svc.update(id, dto, userId);
  }
}
