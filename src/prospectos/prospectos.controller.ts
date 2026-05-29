import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProspectosService } from './prospectos.service';
import { CreateProspectoDto, UpdateProspectoDto, MoverEtapaDto, CreateInteraccionDto } from './dto/prospecto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('prospectos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR' as any, 'SUPERVISOR' as any, 'EJECUTIVO_CRM' as any, 'CREDITO' as any)
@Controller('prospectos')
export class ProspectosController {
  constructor(private svc: ProspectosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar prospectos con filtros' })
  @ApiQuery({ name: 'sucursalId', required: false })
  @ApiQuery({ name: 'etapa', required: false })
  @ApiQuery({ name: 'ejecutivoId', required: false })
  findAll(
    @Query('sucursalId') sucursalId?: string,
    @Query('etapa') etapa?: string,
    @Query('ejecutivoId') ejecutivoId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.svc.findAll({ sucursalId, etapa, ejecutivoId, page: +page, limit: +limit });
  }

  @Get('kanban')
  @ApiOperation({ summary: 'Vista Kanban por etapas' })
  kanban(@Query('sucursalId') sucursalId?: string) {
    return this.svc.findByKanban(sucursalId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear prospecto' })
  create(@Body() dto: CreateProspectoDto, @CurrentUser('id') userId: string) {
    return this.svc.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar prospecto' })
  update(@Param('id') id: string, @Body() dto: UpdateProspectoDto, @CurrentUser('id') userId: string) {
    return this.svc.update(id, dto, userId);
  }

  @Patch(':id/etapa')
  @ApiOperation({ summary: 'Mover prospecto de etapa (Kanban)' })
  moverEtapa(@Param('id') id: string, @Body() dto: MoverEtapaDto, @CurrentUser('id') userId: string) {
    return this.svc.moverEtapa(id, dto.etapa, userId);
  }

  @Post(':id/interacciones')
  @ApiOperation({ summary: 'Registrar interacción con prospecto' })
  addInteraccion(@Param('id') id: string, @Body() dto: CreateInteraccionDto) {
    return this.svc.addInteraccion(id, dto);
  }
}
