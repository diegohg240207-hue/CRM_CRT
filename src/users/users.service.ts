import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where: { activo: true }, // FIX: excluir usuarios desactivados (soft delete)
        skip,
        take: limit,
        select: { id: true, nombre: true, email: true, rol: true, activo: true, sucursal: true, createdAt: true, lastLogin: true },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.usuario.count({ where: { activo: true } }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, sucursal: true, createdAt: true, lastLogin: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email ya registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const { password, ...data } = dto;

    return this.prisma.usuario.create({
      data: { ...data, passwordHash },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: dto,
      select: { id: true, nombre: true, email: true, rol: true, activo: true, sucursal: true },
    });
  }

  async toggleActive(id: string) {
    const user = await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: !(user as any).activo },
      select: { id: true, nombre: true, activo: true },
    });
  }
}
