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

// B-3: Campos PII/sensibles que nunca deben persistirse en audit logs.
// Se comparan en minúsculas para insensibilidad a mayúsculas.
const PII_BLOCKLIST = new Set([
  'telefono', 'tel',
  'email', 'correo',
  'nombre',
  'salario', 'salariomensual',
  'scoreburo', 'score_buro',
  'capacidadpago',
  'rfc', 'curp',
  'domicilio', 'direccion', 'calle',
  'password', 'contrasena', 'contrasenas',
  'token', 'refreshtoken', 'accesstoken',
  'notas',
]);

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Elimina campos PII/sensibles del objeto datos antes de persistir.
   * Sólo opera en objetos planos (primer nivel) — no recursivo a propósito.
   */
  private sanitizeDatos(datos: any): any {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return datos;
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(datos)) {
      if (!PII_BLOCKLIST.has(key.toLowerCase())) {
        sanitized[key] = value;
      }
    }
    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
  }

  async log(params: AuditParams) {
    return this.prisma.auditLog.create({
      data: {
        accion: params.accion,
        entidad: params.entidad,
        usuarioId: params.usuarioId,
        entidadId: params.entidadId,
        datos: params.datos ? this.sanitizeDatos(params.datos) : undefined,
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
