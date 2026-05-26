import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@casaruiz.mx' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'sucursal-tamazula', required: false })
  @IsOptional()
  @IsString()
  sucursalId?: string;
}

// Used internally by AuthService — refresh token is extracted from httpOnly cookie by the controller
export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
