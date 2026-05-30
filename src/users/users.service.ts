import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(page = 1, limit = 50, includeInactive = false) {
    const skip = (page - 1) * limit;
    const where = includeInactive ? {} : { activo: true };
    const [data, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true, nombre: true, email: true, rol: true,
          activo: true, sucursal: { select: { id: true, nombre: true } },
          createdAt: true, lastLogin: true,
        },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.usuario.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true, nombre: true, email: true, rol: true,
        activo: true, sucursal: { select: { id: true, nombre: true } },
        createdAt: true, lastLogin: true,
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CreateUserDto, adminId?: string) {
    const exists = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email ya registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { password, ...data } = dto;

    const user = await this.prisma.usuario.create({
      data: { ...data, passwordHash },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true },
    });
    await this.audit.log({ accion: 'CREAR_USUARIO', entidad: 'Usuario', entidadId: user.id, usuarioId: adminId, datos: { rol: dto.rol } });
    return user;
  }

  async update(id: string, dto: UpdateUserDto, adminId?: string) {
    await this.findOne(id);
    const user = await this.prisma.usuario.update({
      where: { id },
      data: dto,
      select: { id: true, nombre: true, email: true, rol: true, activo: true, sucursal: { select: { id: true, nombre: true } } },
    });
    await this.audit.log({ accion: 'EDITAR_USUARIO', entidad: 'Usuario', entidadId: id, usuarioId: adminId, datos: { campos: Object.keys(dto) } });
    return user;
  }

  async toggleActive(id: string, adminId?: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, activo: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: { activo: !user.activo },
      select: { id: true, nombre: true, activo: true },
    });
    await this.audit.log({
      accion: updated.activo ? 'ACTIVAR_USUARIO' : 'DESACTIVAR_USUARIO',
      entidad: 'Usuario', entidadId: id, usuarioId: adminId,
      datos: { activo: updated.activo },
    });
    return updated;
  }
}
