import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/** Convierte errores Prisma conocidos en respuestas HTTP legibles (evita 500 crípticos) */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error en base de datos';

    switch (exception.code) {
      case 'P2002': // Unique constraint failed
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un registro con esos datos (campo duplicado)';
        break;
      case 'P2003': // FK constraint failed
        status = HttpStatus.BAD_REQUEST;
        message = 'El registro relacionado no existe. Verifica sucursal, cliente o ejecutivo.';
        break;
      case 'P2025': // Record not found (update/delete)
        status = HttpStatus.NOT_FOUND;
        message = 'Registro no encontrado';
        break;
      case 'P2014': // Required relation violated
        status = HttpStatus.BAD_REQUEST;
        message = 'Relación requerida faltante';
        break;
    }

    res.status(status).json({ statusCode: status, message, error: exception.code });
  }
}
