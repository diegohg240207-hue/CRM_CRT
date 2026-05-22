import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { EvaluarScoringDto } from './dto/scoring.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('scoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scoring')
export class ScoringController {
  constructor(private svc: ScoringService) {}

  @Post('evaluar')
  @ApiOperation({ summary: 'Evaluar scoring crediticio en tiempo real' })
  evaluar(@Body() dto: EvaluarScoringDto) {
    return this.svc.evaluar(dto);
  }

  @Get('reglas')
  @ApiOperation({ summary: 'Obtener reglas del motor de scoring' })
  getReglas() {
    return this.svc.getReglas();
  }

  @Get('historial')
  @ApiOperation({ summary: 'Historial de evaluaciones' })
  historial(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.svc.getHistorial(+page, +limit);
  }
}
