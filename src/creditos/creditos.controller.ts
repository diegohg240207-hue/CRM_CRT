import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
