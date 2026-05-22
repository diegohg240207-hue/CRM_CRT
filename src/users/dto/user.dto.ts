import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty({ enum: RolUsuario }) @IsEnum(RolUsuario) rol: RolUsuario;
  @ApiProperty({ required: false }) @IsOptional() @IsString() sucursalId?: string;
}

export class UpdateUserDto {
  @IsOptional() @IsString() nombre?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsEnum(RolUsuario) rol?: RolUsuario;
  @IsOptional() @IsString() sucursalId?: string;
}
