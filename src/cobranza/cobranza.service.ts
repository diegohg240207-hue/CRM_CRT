import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarAccionDto, UpdateCobranzaDto } from './dto/cobranza.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CobranzaService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async findAll(filters: { riesgo?: string; estatus?: string; ejecutivoId?: string; page?: number; limit?: number } = {}) {
    const { riesgo, estatus, ejecutivoId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (riesgo) where.riesgo = riesgo;
    if (estatus) where.estatus = estatus;
    if (ejecutivoId) where.ejecutivoId = ejecutivoId;

    const [data, total] = await Promise.all([
      this.prisma.cobranza.findMany({
        where,
        skip,
        take: limit,
        include: {
          cliente: { select: { id: true, nombre: true, telefono: true } },
          ejecutivo: { select: { id: true, nombre: true } },
          acciones: { take: 1, orderBy: { createdAt: 'desc' } },
        },
        orderBy: { diasVencido: 'desc' },
      }),
      this.prisma.cobranza.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const c = await this.prisma.cobranza.findUnique({
      where: { id },
      include: {
        cliente: true,
        ejecutivo: { select: { nombre: true } },
        credito: { select: { folio: true, monto: true, plazoMeses: true } },
        acciones: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!c) throw new NotFoundException('Registro de cobranza no encontrado');
    return c;
  }

  async registrarAccion(id: string, dto: RegistrarAccionDto, usuarioId: string) {
    await this.findOne(id);

    const accion = await this.prisma.accionCobranza.create({
      data: {
        cobranzaId: id,
        tipo: dto.tipo as any,
        descripcion: dto.descripcion,
        resultado: dto.resultado,
      },
    });

    await this.prisma.cobranza.update({
      where: { id },
      data: {
        ultimaAccion: `${dto.tipo}: ${dto.descripcion || ''}`,
        fechaUltAccion: new Date(),
        estatus: 'EN_GESTION',
      },
    });

    await this.audit.log({ accion: `ACCION_${dto.tipo}`, entidad: 'Cobranza', entidadId: id, usuarioId });
    return accion;
  }

  async getKpis() {
    const now = new Date();
    const startWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [total, moraTemprana, mora30, cobradoHoy] = await Promise.all([
      this.prisma.cobranza.aggregate({
        where: { estatus: { not: 'PAGADO' } },
        _sum: { montoAdeudado: true },
      }),
      this.prisma.cobranza.count({ where: { diasVencido: { gte: 1, lt: 30 } } }),
      this.prisma.cobranza.count({ where: { diasVencido: { gte: 30 } } }),
      this.prisma.pago.aggregate({
        where: { fechaPago: { gte: new Date(now.setHours(0, 0, 0, 0)) } },
        _sum: { monto: true },
      }),
    ]);

    return {
      porCobrarSemana: total._sum.montoAdeudado || 0,
      moraTemprana,
      mora30dias: mora30,
      cobradoHoy: cobradoHoy._sum.monto || 0,
    };
  }

  async getTimelinePagos() {
    const proximos = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const fechaStr = fecha.toISOString().split('T')[0];
      const count = await this.prisma.cobranza.count({
        where: {
          fechaProxPago: {
            gte: new Date(fechaStr),
            lt: new Date(new Date(fechaStr).getTime() + 86400000),
          },
        },
      });
      const agg = await this.prisma.cobranza.aggregate({
        where: {
          fechaProxPago: {
            gte: new Date(fechaStr),
            lt: new Date(new Date(fechaStr).getTime() + 86400000),
          },
        },
        _sum: { montoAdeudado: true },
      });
      proximos.push({ fecha: fechaStr, pagos: count, monto: agg._sum.montoAdeudado || 0 });
    }
    return proximos;
  }
}
