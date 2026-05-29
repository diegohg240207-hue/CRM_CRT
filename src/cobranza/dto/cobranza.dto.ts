import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarAccionDto {
  @ApiProperty({ enum: ['LLAMADA', 'WHATSAPP', 'EMAIL', 'VISITA', 'ACUERDO_PAGO', 'PROMESA_PAGO'] })
  @IsEnum(['LLAMADA', 'WHATSAPP', 'EMAIL', 'VISITA', 'ACUERDO_PAGO', 'PROMESA_PAGO'])
  tipo: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() resultado?: string;
}

export class UpdateCobranzaDto {
  @IsOptional() estatus?: string;
  @IsOptional() @IsString() ultimaAccion?: string;
}

export class RegistrarPagoDto {
  @ApiProperty({ description: 'Monto del pago' })
  @IsNumber()
  monto: number;

  @ApiProperty({ required: false, description: 'Referencia o número de recibo' })
  @IsOptional()
  @IsString()
  referencia?: string;

  @ApiProperty({ required: false, enum: ['MENSUALIDAD', 'ABONO', 'LIQUIDACION'] })
  @IsOptional()
  @IsString()
  tipo?: string;
}
