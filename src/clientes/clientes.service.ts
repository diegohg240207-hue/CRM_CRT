import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto, UpdateClienteDto, AumentarLineaDto } from './dto/cliente.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  /** Folio único garantizado: C-YYYYMMDD-XXXXXX (6 hex chars de UUID v4 = ~16.7M combinaciones/día) */
  private generateFolio(): string {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const unique = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
    return `C-${ymd}-${unique}`;
  }

  async findAll(filters: { sucursalId?: string; estatus?: string; riesgo?: string; q?: string; page?: number; limit?: number } = {}) {
    const { sucursalId, estatus, riesgo, q, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = { activo: true }; // FIX: excluir clientes desactivados (soft delete)
    if (sucursalId) where.sucursalId = sucursalId;
    if (estatus) where.estatus = estatus;
    if (riesgo) where.riesgo = riesgo;
    if (q) where.nombre = { contains: q, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        include: {
          sucursal: { select: { id: true, nombre: true } },
          lineaCredito: true,
        },
        orderBy: { nombre: 'asc' },
      }),
      this.prisma.cliente.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const c = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        sucursal: true,
        lineaCredito: { include: { historial: { take: 10, orderBy: { fecha: 'desc' } } } },
        creditos: { take: 5, orderBy: { createdAt: 'desc' } },
        cobranza: { take: 3, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!c) throw new NotFoundException('Cliente no encontrado');
    return c;
  }

  async create(dto: CreateClienteDto, usuarioId: string) {
    const { lineaCredito: lineaAprobada, ...clienteData } = dto;
    const scoreBuro = dto.scoreBuro ?? 0;
    const lineaInicial = lineaAprobada ?? 0;
    const cliente = await this.prisma.cliente.create({
      data: {
        folio: this.generateFolio(),
        ...clienteData as any,
        scoreInterno: this.calcularScoreInterno(scoreBuro),
        riesgo: this.determinarRiesgo(scoreBuro),
        lineaCredito: {
          create: {
            lineaAprobada: lineaInicial,
            lineaUsada: 0,
            lineaDisponible: lineaInicial,
          },
        },
      },
      include: { lineaCredito: true, sucursal: { select: { nombre: true } } },
    });
    await this.audit.log({ accion: 'CREATE', entidad: 'Cliente', entidadId: cliente.id, usuarioId });
    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto, usuarioId: string) {
    await this.findOne(id);
    const updated = await this.prisma.cliente.update({ where: { id }, data: dto as any });
    await this.audit.log({ accion: 'UPDATE', entidad: 'Cliente', entidadId: id, usuarioId, datos: dto });
    return updated;
  }

  async toggleActive(id: string, usuarioId: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id }, select: { activo: true, nombre: true } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    const updated = await this.prisma.cliente.update({
      where: { id },
      data: { activo: !cliente.activo },
      select: { id: true, nombre: true, activo: true },
    });
    await this.audit.log({ accion: updated.activo ? 'ACTIVAR' : 'DESACTIVAR', entidad: 'Cliente', entidadId: id, usuarioId });
    return updated;
  }

  async aumentarLinea(id: string, dto: AumentarLineaDto, usuarioId: string) {
    const cliente = await this.findOne(id);
    const lineaActual = (cliente as any).lineaCredito;
    if (!lineaActual) throw new NotFoundException('Línea de crédito no encontrada');

    await this.prisma.historialLinea.create({
      data: {
        lineaCreditoId: lineaActual.id,
        montoAnterior: lineaActual.lineaAprobada,
        montoNuevo: dto.montoNuevo,
        motivo: dto.motivo,
      },
    });

    const updated = await this.prisma.lineaCredito.update({
      where: { id: lineaActual.id },
      data: {
        lineaAprobada: dto.montoNuevo,
        lineaDisponible: dto.montoNuevo - lineaActual.lineaUsada,
        ultimoAumento: new Date(),
        elegibleAumento: false,
      },
    });

    await this.audit.log({ accion: 'AUMENTAR_LINEA', entidad: 'Cliente', entidadId: id, usuarioId, datos: dto });
    return updated;
  }

  private calcularScoreInterno(scoreBuro: number): number {
    if (scoreBuro >= 750) return 85;
    if (scoreBuro >= 700) return 70;
    if (scoreBuro >= 600) return 55;
    if (scoreBuro >= 500) return 40;
    return 20;
  }

  private determinarRiesgo(scoreBuro: number): string {
    if (scoreBuro >= 700) return 'BAJO';
    if (scoreBuro >= 550) return 'MEDIO';
    return 'ALTO';
  }
}
