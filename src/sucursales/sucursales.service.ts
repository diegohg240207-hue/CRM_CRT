import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateSucursalDto, UpdateSucursalDto } from './dto/sucursal.dto';

@Injectable()
export class SucursalesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  /** Listar sucursales. Sin includeInactive = solo activas (para dropdowns).
   *  includeInactive=true = todas (para Admin) */
  findAll(includeInactive = false) {
    return this.prisma.sucursal.findMany({
      where: includeInactive ? undefined : { activa: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const s = await this.prisma.sucursal.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Sucursal no encontrada');
    return s;
  }

  async create(dto: CreateSucursalDto, adminId?: string) {
    const sucursal = await this.prisma.sucursal.create({
      data: {
        nombre: dto.nombre,
        region:   dto.region   || 'Jalisco',
        direccion: dto.direccion,
        telefono:  dto.telefono,
      },
    });
    await this.audit.log({ accion: 'CREAR_SUCURSAL', entidad: 'Sucursal', entidadId: sucursal.id, usuarioId: adminId, datos: { nombre: sucursal.nombre } });
    return sucursal;
  }

  async update(id: string, dto: UpdateSucursalDto, adminId?: string) {
    await this.findOne(id);
    const updated = await this.prisma.sucursal.update({ where: { id }, data: dto });
    await this.audit.log({ accion: 'EDITAR_SUCURSAL', entidad: 'Sucursal', entidadId: id, usuarioId: adminId, datos: { campos: Object.keys(dto) } });
    return updated;
  }

  async toggleActiva(id: string, adminId?: string) {
    const s = await this.findOne(id);
    const updated = await this.prisma.sucursal.update({
      where: { id },
      data: { activa: !s.activa },
      select: { id: true, nombre: true, activa: true },
    });
    await this.audit.log({
      accion: updated.activa ? 'ACTIVAR_SUCURSAL' : 'DESACTIVAR_SUCURSAL',
      entidad: 'Sucursal', entidadId: id, usuarioId: adminId,
      datos: { activa: updated.activa },
    });
    return updated;
  }
}
