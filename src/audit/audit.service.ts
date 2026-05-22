import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AuditParams {
  accion: string;
  entidad: string;
  usuarioId?: string;
  entidadId?: string;
  datos?: any;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: AuditParams) {
    return this.prisma.auditLog.create({
      data: {
        accion: params.accion,
        entidad: params.entidad,
        usuarioId: params.usuarioId,
        entidadId: params.entidadId,
        datos: params.datos,
        ipAddress: params.ipAddress,
      },
    });
  }

  async findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { usuario: { select: { nombre: true, email: true } } },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { data, total, page, limit };
  }
}
