import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto, UpdateSucursalDto } from './dto/sucursal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('sucursales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sucursales')
export class SucursalesController {
  constructor(private svc: SucursalesService) {}

  /** GET /sucursales — todos los roles autenticados pueden listar (para dropdowns).
   *  Admin puede pasar ?includeInactive=true para ver todas */
  @Get()
  @ApiOperation({ summary: 'Listar sucursales' })
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.svc.findAll(includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Post()
  @Roles('ADMINISTRADOR' as any)
  @ApiOperation({ summary: 'Crear sucursal (solo Administrador)' })
  create(@Body() dto: CreateSucursalDto, @CurrentUser('id') adminId: string) {
    return this.svc.create(dto, adminId);
  }

  @Put(':id')
  @Roles('ADMINISTRADOR' as any, 'SUPERVISOR' as any)
  @ApiOperation({ summary: 'Editar sucursal (Administrador y Supervisor)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSucursalDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.svc.update(id, dto, adminId);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMINISTRADOR' as any)
  @ApiOperation({ summary: 'Activar/desactivar sucursal (solo Administrador)' })
  toggleActiva(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.svc.toggleActiva(id, adminId);
  }
}
