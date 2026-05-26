import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EvaluarScoringDto } from './dto/scoring.dto';

interface ScoringResult {
  scoreBuro: number; ptsBuro: number;
  vivienda: string; ptsVivienda: number;
  salario: number; ptsSalario: number;
  capacidadPago: number; ptsCapacidad: number;
  antiguedadLaboral: number; ptsAntiguedad: number;
  subtotal: number;
  scoreFinal: number;
  riesgo: 'BAJO' | 'MEDIO' | 'ALTO';
  decision: 'APROBADO' | 'REQUIERE_AVAL' | 'RECHAZADO';
  lineaAprobada: number | null;
  probabilidad: number;
}

@Injectable()
export class ScoringService {
  constructor(private prisma: PrismaService) {}

  evaluar(dto: EvaluarScoringDto): ScoringResult {
    // Buró: max 50 pts
    let ptsBuro = 5;
    if (dto.scoreBuro >= 750) ptsBuro = 50;
    else if (dto.scoreBuro >= 700) ptsBuro = 40;
    else if (dto.scoreBuro >= 600) ptsBuro = 30;
    else if (dto.scoreBuro >= 500) ptsBuro = 20;

    // Vivienda: max 30 pts
    const ptsViviendaMap: Record<string, number> = { PROPIA: 30, FAMILIAR: 22, RENTADA: 15 };
    const ptsVivienda = ptsViviendaMap[dto.vivienda] || 15;

    // Salario: max 10 pts
    let ptsSalario = 2;
    if (dto.salario >= 20000) ptsSalario = 10;
    else if (dto.salario >= 17000) ptsSalario = 8;
    else if (dto.salario >= 15000) ptsSalario = 6;
    else if (dto.salario >= 13000) ptsSalario = 4;

    // Capacidad de pago (% deuda/ingreso): max 5 pts
    let ptsCapacidad = 1;
    if (dto.capacidadPago <= 0.10) ptsCapacidad = 5;
    else if (dto.capacidadPago <= 0.15) ptsCapacidad = 4;
    else if (dto.capacidadPago <= 0.20) ptsCapacidad = 3;
    else if (dto.capacidadPago <= 0.25) ptsCapacidad = 2;

    // Antigüedad laboral: max 5 pts
    let ptsAntiguedad = 1;
    if (dto.antiguedadLaboral >= 5) ptsAntiguedad = 5;
    else if (dto.antiguedadLaboral >= 4) ptsAntiguedad = 4;
    else if (dto.antiguedadLaboral >= 3) ptsAntiguedad = 3;
    else if (dto.antiguedadLaboral >= 2) ptsAntiguedad = 2;

    const subtotal = ptsBuro + ptsVivienda + ptsSalario + ptsCapacidad + ptsAntiguedad;
    const scoreFinal = subtotal * 10;

    let decision: 'APROBADO' | 'REQUIERE_AVAL' | 'RECHAZADO';
    let lineaAprobada: number | null;
    let riesgo: 'BAJO' | 'MEDIO' | 'ALTO';

    if (scoreFinal >= 700) {
      decision = 'APROBADO';
      lineaAprobada = 45000;
      riesgo = 'BAJO';
    } else if (scoreFinal >= 650) {
      decision = 'REQUIERE_AVAL';
      lineaAprobada = 15000;
      riesgo = 'MEDIO';
    } else {
      decision = 'RECHAZADO';
      lineaAprobada = null;
      riesgo = 'ALTO';
    }

    const probabilidad = Math.min(98, Math.max(5, Math.round((scoreFinal / 1000) * 100)));

    return {
      scoreBuro: dto.scoreBuro, ptsBuro,
      vivienda: dto.vivienda, ptsVivienda,
      salario: dto.salario, ptsSalario,
      capacidadPago: dto.capacidadPago, ptsCapacidad,
      antiguedadLaboral: dto.antiguedadLaboral, ptsAntiguedad,
      subtotal,
      scoreFinal,
      riesgo,
      decision,
      lineaAprobada,
      probabilidad,
    };
  }

  async getReglas() {
    return {
      buro: [
        { rango: '750+', pts: 50 },
        { rango: '700-749', pts: 40 },
        { rango: '600-699', pts: 30 },
        { rango: '500-599', pts: 20 },
        { rango: '<500', pts: 5 },
      ],
      vivienda: [
        { tipo: 'PROPIA', pts: 30 },
        { tipo: 'FAMILIAR', pts: 22 },
        { tipo: 'RENTADA', pts: 15 },
      ],
      salario: [
        { rango: '+$20k', pts: 10 },
        { rango: '$17k-$19k', pts: 8 },
        { rango: '$15k-$16k', pts: 6 },
        { rango: '$13k-$14k', pts: 4 },
        { rango: '-$12k', pts: 2 },
      ],
      capacidadPago: [
        { porcentaje: '10%', pts: 5 },
        { porcentaje: '15%', pts: 4 },
        { porcentaje: '20%', pts: 3 },
        { porcentaje: '25%', pts: 2 },
        { porcentaje: '30%+', pts: 1 },
      ],
      antiguedad: [
        { anos: '5+', pts: 5 },
        { anos: '4', pts: 4 },
        { anos: '3', pts: 3 },
        { anos: '2', pts: 2 },
        { anos: '1', pts: 1 },
      ],
      decisiones: [
        { score: '≥700 pts', decision: 'APROBADO', linea: '$45,000' },
        { score: '650-699 pts', decision: 'REQUIERE_AVAL', linea: '$15,000' },
        { score: '<650 pts', decision: 'RECHAZADO', linea: null },
      ],
    };
  }

  async getHistorial(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.evaluacionScoring.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          credito: {
            select: { folio: true, cliente: { select: { nombre: true } } },
          },
        },
      }),
      this.prisma.evaluacionScoring.count(),
    ]);
    return { data, total, page, limit };
  }
}
