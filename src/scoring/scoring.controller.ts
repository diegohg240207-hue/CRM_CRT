import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { EvaluarScoringDto } from './dto/scoring.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('scoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scoring')
export class ScoringController {
  constructor(private svc: ScoringService) {}

  @Post('evaluar')
  @Roles('ADMINISTRADOR' as any, 'SUPERVISOR' as any, 'CREDITO' as any, 'EJECUTIVO_CRM' as any)
  @ApiOperation({ summary: 'Evaluar scoring crediticio en tiempo real' })
  evaluar(@Body() dto: EvaluarScoringDto, @CurrentUser('id') userId: string) {
    return this.svc.evaluar(dto, userId);
  }

  @Get('reglas')
  @Roles('ADMINISTRADOR' as any, 'SUPERVISOR' as any, 'CREDITO' as any, 'EJECUTIVO_CRM' as any)
  @ApiOperation({ summary: 'Obtener reglas del motor de scoring' })
  getReglas() {
    return this.svc.getReglas();
  }

  @Get('historial')
  @Roles('ADMINISTRADOR' as any, 'SUPERVISOR' as any, 'CREDITO' as any)
  @ApiOperation({ summary: 'Historial de evaluaciones' })
  historial(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.svc.getHistorial(+page, +limit);
  }
}
