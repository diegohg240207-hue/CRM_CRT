import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SucursalesService } from './sucursales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('sucursales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sucursales')
export class SucursalesController {
  constructor(private svc: SucursalesService) {}

  // GET rutas abiertas a todos los roles autenticados (necesitan sucursales en dropdowns)
  @Get()
  @ApiOperation({ summary: 'Listar sucursales' })
  findAll() { return this.svc.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @Roles('ADMINISTRADOR' as any)
  @ApiOperation({ summary: 'Crear sucursal (solo Administrador)' })
  create(@Body() body: any) { return this.svc.create(body); }

  @Put(':id')
  @Roles('ADMINISTRADOR' as any, 'SUPERVISOR' as any)
  @ApiOperation({ summary: 'Editar sucursal (Administrador y Supervisor)' })
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
}
