import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { CreateClienteDto, UpdateClienteDto, AumentarLineaDto } from './dto/cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private svc: ClientesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar cartera de clientes (soporta ?q= búsqueda por nombre)' })
  findAll(
    @Query('sucursalId') sucursalId?: string,
    @Query('estatus') estatus?: string,
    @Query('riesgo') riesgo?: string,
    @Query('q') q?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.svc.findAll({ sucursalId, estatus, riesgo, q, page: +page, limit: +limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Get(':id/linea')
  @ApiOperation({ summary: 'Obtener línea de crédito del cliente' })
  async getLinea(@Param('id') id: string) {
    const cliente = await this.svc.findOne(id);
    return (cliente as any).lineaCredito ?? null;
  }

  @Post()
  @ApiOperation({ summary: 'Dar de alta cliente' })
  create(@Body() dto: CreateClienteDto, @CurrentUser('id') userId: string) {
    return this.svc.create(dto, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClienteDto, @CurrentUser('id') userId: string) {
    return this.svc.update(id, dto, userId);
  }

  @Patch(':id/linea')
  @ApiOperation({ summary: 'Aumentar línea de crédito' })
  aumentarLinea(@Param('id') id: string, @Body() dto: AumentarLineaDto, @CurrentUser('id') userId: string) {
    return this.svc.aumentarLinea(id, dto, userId);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activar / desactivar cliente (soft delete)' })
  toggleActive(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.svc.toggleActive(id, userId);
  }
}
