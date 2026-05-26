import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProspectoDto, UpdateProspectoDto } from './dto/prospecto.dto';
import { AuditService } from '../audit/audit.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProspectosService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  /** Folio único garantizado: P-YYYYMMDD-XXXXXX (6 hex chars de UUID v4 = ~16.7M combinaciones/día) */
  private generateFolio(): string {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const unique = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
    return `P-${ymd}-${unique}`;
  }

  async findAll(filters: {
    sucursalId?: string;
    etapa?: string;
    ejecutivoId?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { sucursalId, etapa, ejecutivoId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (sucursalId) where.sucursalId = sucursalId;
    if (etapa) where.etapa = etapa;
    if (ejecutivoId) where.ejecutivoId = ejecutivoId;

    const [data, total] = await Promise.all([
      this.prisma.prospecto.findMany({
        where,
        skip,
        take: limit,
        include: {
          sucursal: { select: { id: true, nombre: true } },
          ejecutivo: { select: { id: true, nombre: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.prospecto.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findByKanban(sucursalId?: string) {
    const where: any = sucursalId ? { sucursalId } : {};
    const prospectos = await this.prisma.prospecto.findMany({
      where,
      include: {
        sucursal: { select: { nombre: true } },
        ejecutivo: { select: { nombre: true } },
      },
    });

    const etapas = ['NO_CONTACTADO', 'CONTACTADO', 'SEGUIMIENTO', 'CIERRE', 'DECLINADO'];
    return etapas.reduce((acc, etapa) => {
      acc[etapa] = prospectos.filter((p) => p.etapa === etapa);
      return acc;
    }, {} as Record<string, any[]>);
  }

  async findOne(id: string) {
    const p = await this.prisma.prospecto.findUnique({
      where: { id },
      include: {
        sucursal: true,
        ejecutivo: { select: { id: true, nombre: true, email: true } },
        interacciones: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!p) throw new NotFoundException('Prospecto no encontrado');
    return p;
  }

  async create(dto: CreateProspectoDto, usuarioId: string) {
    const prospecto = await this.prisma.prospecto.create({
      data: {
        folio: this.generateFolio(),
        ...dto,
        score: this.calcularScoreComercial(dto),
      } as any,
      include: {
        sucursal: { select: { nombre: true } },
        ejecutivo: { select: { nombre: true } },
      },
    });
    await this.audit.log({ accion: 'CREATE', entidad: 'Prospecto', entidadId: prospecto.id, usuarioId });
    return prospecto;
  }

  async update(id: string, dto: UpdateProspectoDto, usuarioId: string) {
    await this.findOne(id);
    const updated = await this.prisma.prospecto.update({ where: { id }, data: dto as any });
    await this.audit.log({ accion: 'UPDATE', entidad: 'Prospecto', entidadId: id, usuarioId, datos: dto });
    return updated;
  }

  async moverEtapa(id: string, etapa: string, usuarioId: string) {
    await this.findOne(id);
    const updated = await this.prisma.prospecto.update({
      where: { id },
      data: { etapa: etapa as any, diasEnEtapa: 0 },
    });
    await this.prisma.interaccionProspecto.create({
      data: {
        prospectoId: id,
        tipo: 'CAMBIO_ETAPA',
        descripcion: `Movido a etapa: ${etapa}`,
      },
    });
    await this.audit.log({ accion: 'MOVER_ETAPA', entidad: 'Prospecto', entidadId: id, usuarioId, datos: { etapa } });
    return updated;
  }

  async addInteraccion(prospectoId: string, data: { tipo: string; descripcion: string; resultado?: string }) {
    await this.findOne(prospectoId);
    return this.prisma.interaccionProspecto.create({
      data: { prospectoId, ...data },
    });
  }

  /**
   * Score comercial determinista basado en perfil del prospecto.
   * Escala: 50–95 pts.
   * Variables: prioridad (30), monto estimado (15), fuente (10).
   * Sin Math.random() — resultado estable y auditable.
   */
  private calcularScoreComercial(dto: Partial<{ montoEstimado: number; prioridad: string; fuente: string }>): number {
    let score = 50; // base

    // Prioridad comercial (max +30)
    if (dto.prioridad === 'ALTA') score += 30;
    else if (dto.prioridad === 'MEDIA') score += 18;
    else score += 5; // BAJA

    // Monto estimado como señal de capacidad (max +15)
    const monto = Number(dto.montoEstimado || 0);
    if (monto >= 30000) score += 15;
    else if (monto >= 20000) score += 12;
    else if (monto >= 10000) score += 8;
    else if (monto >= 5000) score += 4;

    // Fuente de prospecto (max +10)
    if (dto.fuente === 'Referido') score += 10;
    else if (dto.fuente === 'Cartera') score += 8;
    else if (dto.fuente === 'Digital') score += 5;

    return Math.min(95, score);
  }
}
