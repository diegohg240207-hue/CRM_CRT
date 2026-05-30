import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSucursalDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() region?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() direccion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() telefono?: string;
}

export class UpdateSucursalDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() direccion?: string;
  @IsOptional() @IsString() telefono?: string;
  @IsOptional() @IsBoolean() activa?: boolean;
}
