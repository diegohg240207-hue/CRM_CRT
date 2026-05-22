import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProspectoDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty() @IsString() telefono: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() email?: string;
  @ApiProperty() @IsString() sucursalId: string;
  @ApiProperty() @IsString() producto: string;
  @ApiProperty() @IsNumber() montoEstimado: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() fuente?: string;
  @ApiProperty() @IsString() ejecutivoId: string;
  @ApiProperty({ enum: ['ALTA', 'MEDIA', 'BAJA'], required: false }) @IsOptional() prioridad?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() etiquetas?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsString() notas?: string;
}

export class UpdateProspectoDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsString() producto?: string;
  @IsOptional() @IsNumber() montoEstimado?: number;
  @IsOptional() etapa?: string;
  @IsOptional() prioridad?: string;
  @IsOptional() @IsString() ejecutivoId?: string;
  @IsOptional() @IsArray() etiquetas?: string[];
  @IsOptional() @IsString() notas?: string;
}

export class MoverEtapaDto {
  @ApiProperty({ enum: ['NO_CONTACTADO', 'CONTACTADO', 'SEGUIMIENTO', 'CIERRE', 'DECLINADO'] })
  @IsEnum(['NO_CONTACTADO', 'CONTACTADO', 'SEGUIMIENTO', 'CIERRE', 'DECLINADO'])
  etapa: string;
}
