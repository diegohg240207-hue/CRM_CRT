import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      // Dual extraction: httpOnly cookie first (browser), Bearer token fallback (API/Swagger)
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['access_token'] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      passReqToCallback: false,
      // No fallback: if JWT_SECRET is missing, startup check in main.ts exits the process first
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { sucursal: true },
    });
    if (!user || !user.activo) throw new UnauthorizedException();
    return user;
  }
}
