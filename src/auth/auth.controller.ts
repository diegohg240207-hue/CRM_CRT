import {
  Controller, Post, Body, Get, UseGuards,
  Req, HttpCode, Res, UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // ── Cookie helper ────────────────────────────────────────────────────────
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = process.env.NODE_ENV === 'production';
    const base = {
      httpOnly: true,                                    // Never accessible to JavaScript
      secure: isProd,                                    // HTTPS only in production
      sameSite: isProd ? ('none' as const) : ('lax' as const), // cross-domain in prod, lax in dev
    };

    // Access token — sent to all API routes
    res.cookie('access_token', accessToken, {
      ...base,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Refresh token — restricted to /api/v1/auth/* routes only
    res.cookie('refresh_token', refreshToken, {
      ...base,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
    });
  }

  private clearAuthCookies(res: Response): void {
    const isProd = process.env.NODE_ENV === 'production';
    const base = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ('none' as const) : ('lax' as const),
    };
    res.clearCookie('access_token', base);
    res.clearCookie('refresh_token', { ...base, path: '/api/v1/auth' });
  }

  // ── Login ────────────────────────────────────────────────────────────────
  // Strict brute-force: 5 attempts per 5 minutes per IP
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto, req.ip, req.headers['user-agent']);
    // Set tokens as httpOnly cookies — never exposed to JavaScript
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    // Return only user data — tokens stay in cookies
    const { accessToken, refreshToken, ...safeResult } = result;
    return safeResult;
  }

  // ── Refresh ──────────────────────────────────────────────────────────────
  // Token comes from httpOnly cookie — not from request body
  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Renovar token de sesión' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req as any).cookies?.['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('No hay sesión activa');
    const tokens = await this.auth.refresh({ refreshToken });
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Sesión renovada' };
  }

  // ── Logout ───────────────────────────────────────────────────────────────
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req as any).cookies?.['refresh_token'];
    await this.auth.logout(userId, refreshToken);
    this.clearAuthCookies(res);
    return { message: 'Sesión cerrada' };
  }

  // ── Profile ──────────────────────────────────────────────────────────────
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  profile(@CurrentUser('id') userId: string) {
    return this.auth.getProfile(userId);
  }
}
