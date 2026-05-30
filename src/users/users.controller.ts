import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @Roles('ADMINISTRADOR' as any, 'SUPERVISOR' as any)
  @ApiOperation({ summary: 'Listar usuarios. Admin puede pasar ?includeInactive=true' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.users.findAll(+page, +limit, includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Post()
  @Roles('ADMINISTRADOR' as any)
  @ApiOperation({ summary: 'Crear usuario (solo Administrador)' })
  create(@Body() dto: CreateUserDto, @CurrentUser('id') adminId: string) {
    return this.users.create(dto, adminId);
  }

  @Put(':id')
  @Roles('ADMINISTRADOR' as any)
  @ApiOperation({ summary: 'Actualizar usuario (solo Administrador)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.users.update(id, dto, adminId);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMINISTRADOR' as any)
  @ApiOperation({ summary: 'Activar/desactivar usuario (solo Administrador)' })
  toggleActive(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.users.toggleActive(id, adminId);
  }
}
