import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      prospectos,
      creditosAprobados,
      carteraTotal,
      cobranzaActiva,
    ] = await Promise.all([
      this.prisma.prospecto.count({ where: { etapa: { not: 'DECLINADO' } } }),
      this.prisma.credito.count({ where: { estatus: 'APROBADO', createdAt: { gte: startOfMonth } } }),
      this.prisma.lineaCredito.aggregate({ _sum: { lineaUsada: true } }),
      this.prisma.cobranza.count({ where: { estatus: { not: 'PAGADO' }, diasVencido: { gte: 30 } } }),
    ]);

    const totalCreditos = await this.prisma.credito.count({ where: { createdAt: { gte: startOfMonth } } });
    const carteraTotalLineas = await this.prisma.lineaCredito.aggregate({ _sum: { lineaAprobada: true } });
    const usada = Number(carteraTotal._sum.lineaUsada || 0);
    const aprobada = Number(carteraTotalLineas._sum.lineaAprobada || 1);
    const mora = totalCreditos > 0 ? ((cobranzaActiva / totalCreditos) * 100).toFixed(1) : '0.0';

    return {
      prospectos_activos: prospectos,
      creditos_aprobados: creditosAprobados,
      tasa_aprobacion: totalCreditos > 0 ? Math.round((creditosAprobados / totalCreditos) * 100) : 0,
      cartera_dispuesta: usada,
      mora_30_dias: parseFloat(mora),
    };
  }

  async getOriginacionMensual() {
    const meses = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
      const count = await this.prisma.credito.count({
        where: { estatus: 'APROBADO', createdAt: { gte: inicio, lte: fin } },
      });
      const agg = await this.prisma.credito.aggregate({
        where: { estatus: 'APROBADO', createdAt: { gte: inicio, lte: fin } },
        _sum: { monto: true },
      });
      meses.push({
        mes: fecha.toLocaleString('es-MX', { month: 'short', year: 'numeric' }),
        creditos: count,
        monto: Number(agg._sum.monto || 0),
      });
    }
    return meses;
  }

  async getDistribucionRiesgo() {
    const [bajo, medio, alto] = await Promise.all([
      this.prisma.credito.count({ where: { riesgo: 'BAJO', estatus: { not: 'RECHAZADO' } } }),
      this.prisma.credito.count({ where: { riesgo: 'MEDIO', estatus: { not: 'RECHAZADO' } } }),
      this.prisma.credito.count({ where: { riesgo: 'ALTO', estatus: { not: 'RECHAZADO' } } }),
    ]);
    const total = bajo + medio + alto || 1;
    return [
      { riesgo: 'Bajo', count: bajo, porcentaje: Math.round((bajo / total) * 100) },
      { riesgo: 'Medio', count: medio, porcentaje: Math.round((medio / total) * 100) },
      { riesgo: 'Alto', count: alto, porcentaje: Math.round((alto / total) * 100) },
    ];
  }

  async getEjecutivosTop() {
    const result = await this.prisma.credito.groupBy({
      by: ['ejecutivoId'],
      where: { estatus: 'APROBADO' },
      _count: { id: true },
      _sum: { monto: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const detalle = await Promise.all(
      result.map(async (r) => {
        const user = await this.prisma.usuario.findUnique({
          where: { id: r.ejecutivoId },
          select: { nombre: true },
        });
        return {
          ejecutivo: user?.nombre || 'N/A',
          creditos: r._count.id,
          monto: Number(r._sum.monto || 0),
        };
      }),
    );
    return detalle;
  }

  async getReporteEjecutivo() {
    const [dashboard, originacion, riesgo, topEjecutivos] = await Promise.all([
      this.getDashboard(),
      this.getOriginacionMensual(),
      this.getDistribucionRiesgo(),
      this.getEjecutivosTop(),
    ]);
    return { dashboard, originacion, riesgo, topEjecutivos };
  }
}
