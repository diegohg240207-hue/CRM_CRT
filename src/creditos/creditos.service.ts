import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditoDto, UpdateCreditoDto } from './dto/credito.dto';
import { ScoringService } from '../scoring/scoring.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CreditosService {
  constructor(
    private prisma: PrismaService,
    private scoring: ScoringService,
    private audit: AuditService,
  ) {}

  /** Folio único garantizado: CR-YYYYMMDD-XXXXXX (6 hex chars de UUID v4 = ~16.7M combinaciones/día) */
  private generateFolio(): string {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const unique = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
    return `CR-${ymd}-${unique}`;
  }

  async findAll(filters: { estatus?: string; ejecutivoId?: string; page?: number; limit?: number } = {}) {
    const { estatus, ejecutivoId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (estatus) where.estatus = estatus;
    if (ejecutivoId) where.ejecutivoId = ejecutivoId;

    const [data, total] = await Promise.all([
      this.prisma.credito.findMany({
        where,
        skip,
        take: limit,
        include: {
          cliente: { select: { id: true, nombre: true, folio: true } },
          ejecutivo: { select: { id: true, nombre: true } },
          evaluacion: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.credito.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const c = await this.prisma.credito.findUnique({
      where: { id },
      include: {
        cliente: true,
        ejecutivo: { select: { id: true, nombre: true } },
        evaluacion: true,
        pagos: { take: 10, orderBy: { fechaPago: 'desc' } },
        cobranza: true,
      },
    });
    if (!c) throw new NotFoundException('Crédito no encontrado');
    return c;
  }

  async create(dto: CreateCreditoDto, usuarioId: string) {
    const { scoreBuro, vivienda, salario, capacidadPago, antiguedadLaboral, ...creditoData } = dto;

    const scoringResult = this.scoring.evaluar({ scoreBuro, vivienda, salario, capacidadPago, antiguedadLaboral });

    const mensualidad = this.calcularMensualidad(dto.monto, dto.plazoMeses, dto.tasaInteres);

    const estatus =
      scoringResult.decision === 'APROBADO' ? 'APROBADO' :
      scoringResult.decision === 'REQUIERE_AVAL' ? 'REQUIERE_AVAL' : 'RECHAZADO';

    const credito = await this.prisma.credito.create({
      data: {
        folio: this.generateFolio(),
        clienteId: dto.clienteId,
        ejecutivoId: dto.ejecutivoId,
        monto: dto.monto,
        plazoMeses: dto.plazoMeses,
        mensualidad,
        tasaInteres: dto.tasaInteres,
        scoreFinal: scoringResult.scoreFinal,
        riesgo: scoringResult.riesgo as any,
        estatus: estatus as any,
        requiereAval: scoringResult.decision === 'REQUIERE_AVAL',
        fechaAprobacion: estatus === 'APROBADO' ? new Date() : null,
        evaluacion: {
          create: {
            scoreBuro,
            ptsBuro: scoringResult.ptsBuro,
            vivienda: vivienda as any,
            ptsVivienda: scoringResult.ptsVivienda,
            salario,
            ptsSalario: scoringResult.ptsSalario,
            capacidadPago,
            ptsCapacidad: scoringResult.ptsCapacidad,
            antiguedadLaboral,
            ptsAntiguedad: scoringResult.ptsAntiguedad,
            subtotal: scoringResult.subtotal,
            scoreFinal: scoringResult.scoreFinal,
            decision: scoringResult.decision as any,
            lineaAprobada: scoringResult.lineaAprobada,
            probabilidad: scoringResult.probabilidad,
          },
        },
      },
      include: {
        cliente: { select: { nombre: true } },
        evaluacion: true,
      },
    });

    await this.audit.log({ accion: 'CREATE_CREDITO', entidad: 'Credito', entidadId: credito.id, usuarioId });
    return credito;
  }

  async update(id: string, dto: UpdateCreditoDto, usuarioId: string) {
    await this.findOne(id);
    const updated = await this.prisma.credito.update({ where: { id }, data: dto as any });
    await this.audit.log({ accion: 'UPDATE', entidad: 'Credito', entidadId: id, usuarioId, datos: dto });
    return updated;
  }

  async getKpis() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [aprobados, enRevision, requiereAval, rechazados, total] = await Promise.all([
      this.prisma.credito.count({ where: { estatus: 'APROBADO', createdAt: { gte: startOfMonth } } }),
      this.prisma.credito.count({ where: { estatus: 'EN_REVISION' } }),
      this.prisma.credito.count({ where: { estatus: 'REQUIERE_AVAL' } }),
      this.prisma.credito.count({ where: { estatus: 'RECHAZADO', createdAt: { gte: startOfMonth } } }),
      this.prisma.credito.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    return {
      aprobados,
      tasaAprobacion: total > 0 ? Math.round((aprobados / total) * 100) : 0,
      enRevision,
      requiereAval,
      rechazados,
    };
  }

  private calcularMensualidad(monto: number, plazo: number, tasa: number): number {
    if (tasa === 0) return monto / plazo;
    const tasaMensual = tasa / 100 / 12;
    return (monto * tasaMensual * Math.pow(1 + tasaMensual, plazo)) / (Math.pow(1 + tasaMensual, plazo) - 1);
  }
}
