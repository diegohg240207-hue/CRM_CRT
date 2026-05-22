import { IsString, IsNumber, IsEnum, IsOptional, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty() @IsString() telefono: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() email?: string;
  @ApiProperty() @IsString() sucursalId: string;
  @ApiProperty({ enum: ['PROPIA', 'FAMILIAR', 'RENTADA'] }) vivienda: string;
  @ApiProperty() @IsNumber() salarioMensual: number;
  @ApiProperty() @IsNumber() antiguedadLaboral: number;
  @ApiProperty() @IsNumber() scoreBuro: number;
  @ApiProperty() @IsNumber() lineaCredito: number;
}

export class UpdateClienteDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() vivienda?: string;
  @IsOptional() @IsNumber() salarioMensual?: number;
  @IsOptional() @IsNumber() antiguedadLaboral?: number;
  @IsOptional() @IsNumber() scoreBuro?: number;
  @IsOptional() estatus?: string;
}

export class AumentarLineaDto {
  @ApiProperty() @IsNumber() montoNuevo: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() motivo?: string;
}
