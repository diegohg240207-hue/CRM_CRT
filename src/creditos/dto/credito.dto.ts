import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCreditoDto {
  @ApiProperty() @IsString() clienteId: string;
  @ApiProperty() @IsString() ejecutivoId: string;
  @ApiProperty() @IsNumber() @Min(1000) monto: number;
  @ApiProperty({ example: 12 }) @IsNumber() @Min(1) @Max(60) plazoMeses: number;
  @ApiProperty() @IsNumber() tasaInteres: number;
  // Scoring data
  @ApiProperty() @IsNumber() scoreBuro: number;
  @ApiProperty() vivienda: string;
  @ApiProperty() @IsNumber() salario: number;
  @ApiProperty() @IsNumber() capacidadPago: number;
  @ApiProperty() @IsNumber() antiguedadLaboral: number;
}

export class UpdateCreditoDto {
  @IsOptional() estatus?: string;
  @IsOptional() @IsString() motivoRechazo?: string;
}
