import { IsString, IsNumber, IsOptional, IsIn, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Enums espejo del schema Prisma (evita import circular de @prisma/client en DTOs)
const TIPO_VIVIENDA = ['PROPIA', 'FAMILIAR', 'RENTADA'] as const;
const ESTATUS_CREDITO = ['EN_REVISION', 'APROBADO', 'RECHAZADO', 'REQUIERE_AVAL', 'ACTIVO', 'LIQUIDADO'] as const;

export class CreateCreditoDto {
  @ApiProperty() @IsString() clienteId: string;
  @ApiProperty() @IsString() ejecutivoId: string;
  @ApiProperty() @IsNumber() @Min(1000) monto: number;
  @ApiProperty({ example: 12 }) @IsNumber() @Min(1) @Max(60) plazoMeses: number;
  @ApiProperty() @IsNumber() tasaInteres: number;

  // Scoring data
  @ApiProperty() @IsNumber() @Min(0) @Max(999) scoreBuro: number;

  @ApiProperty({ enum: TIPO_VIVIENDA, example: 'PROPIA' })
  @IsIn(TIPO_VIVIENDA)
  vivienda: typeof TIPO_VIVIENDA[number];

  @ApiProperty() @IsNumber() @Min(0) salario: number;
  @ApiProperty() @IsNumber() @Min(0) @Max(100) capacidadPago: number;
  @ApiProperty() @IsNumber() @Min(0) antiguedadLaboral: number;
}

export class UpdateCreditoDto {
  @IsOptional()
  @IsIn(ESTATUS_CREDITO, { message: `estatus debe ser uno de: ${ESTATUS_CREDITO.join(', ')}` })
  estatus?: typeof ESTATUS_CREDITO[number];

  @IsOptional() @IsString() motivoRechazo?: string;
}
