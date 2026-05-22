import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private audit: AuditService,
  ) {}

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
      include: { sucursal: true },
    });

    if (!user || !user.activo) throw new UnauthorizedException('Credenciales inválidas');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Credenciales inválidas');

    await this.prisma.usuario.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.rol);

    await this.prisma.session.create({
      data: {
        usuarioId: user.id,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: ip,
        userAgent,
      },
    });

    await this.audit.log({
      accion: 'LOGIN',
      entidad: 'Session',
      usuarioId: user.id,
      ipAddress: ip,
    });

    const { passwordHash, ...userSafe } = user;
    return { user: userSafe, ...tokens };
  }

  async refresh(dto: RefreshTokenDto) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: dto.refreshToken },
      include: { usuario: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sesión expirada');
    }

    if (!session.usuario.activo) throw new UnauthorizedException();

    const tokens = await this.generateTokens(
      session.usuario.id,
      session.usuario.email,
      session.usuario.rol,
    );

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.session.deleteMany({ where: { refreshToken } });
    } else {
      await this.prisma.session.deleteMany({ where: { usuarioId: userId } });
    }
    await this.audit.log({ accion: 'LOGOUT', entidad: 'Session', usuarioId: userId });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { sucursal: true },
    });
    const { passwordHash, ...safe } = user;
    return safe;
  }

  private async generateTokens(userId: string, email: string, rol: string) {
    const payload = { sub: userId, email, rol };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION || '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
