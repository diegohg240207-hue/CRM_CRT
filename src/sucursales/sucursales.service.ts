import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SucursalesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.sucursal.findMany({ where: { activa: true }, orderBy: { nombre: 'asc' } });
  }

  async findOne(id: string) {
    const s = await this.prisma.sucursal.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Sucursal no encontrada');
    return s;
  }

  create(data: any) {
    return this.prisma.sucursal.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.sucursal.update({ where: { id }, data });
  }
}
