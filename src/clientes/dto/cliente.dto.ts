import { IsString, IsNumber, IsOptional, IsEmail, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty() @IsString() telefono: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() email?: string;
  @ApiProperty() @IsString() sucursalId: string;
  @ApiProperty({ enum: ['PROPIA', 'FAMILIAR', 'RENTADA'] }) @IsString() @IsIn(['PROPIA', 'FAMILIAR', 'RENTADA']) vivienda: string;
  @ApiProperty() @IsNumber() salarioMensual: number;
  @ApiProperty() @IsNumber() antiguedadLaboral: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() scoreBuro?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() lineaCredito?: number;
}

export class UpdateClienteDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @IsIn(['PROPIA', 'FAMILIAR', 'RENTADA']) vivienda?: string;
  @IsOptional() @IsNumber() salarioMensual?: number;
  @IsOptional() @IsNumber() antiguedadLaboral?: number;
  @IsOptional() @IsNumber() scoreBuro?: number;
  @IsOptional() @IsString() estatus?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}

export class AumentarLineaDto {
  @ApiProperty() @IsNumber() montoNuevo: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() motivo?: string;
}
