import { Controller, Post, Body, Get, UseGuards, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // Strict brute-force protection: 5 attempts per 5 minutes per IP
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión' })
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.auth.login(dto, req.ip, req.headers['user-agent']);
  }

  // Refresh: 10 per minute
  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Renovar token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Cerrar sesión' })
  logout(@CurrentUser('id') userId: string, @Body() body: { refreshToken?: string }) {
    return this.auth.logout(userId, body?.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  profile(@CurrentUser('id') userId: string) {
    return this.auth.getProfile(userId);
  }
}
