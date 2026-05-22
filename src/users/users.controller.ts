import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @Roles('ADMINISTRADOR' as any, 'SUPERVISOR' as any)
  @ApiOperation({ summary: 'Listar usuarios' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.users.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario' })
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Post()
  @Roles('ADMINISTRADOR' as any)
  @ApiOperation({ summary: 'Crear usuario' })
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Put(':id')
  @Roles('ADMINISTRADOR' as any)
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMINISTRADOR' as any)
  @ApiOperation({ summary: 'Activar/desactivar usuario' })
  toggleActive(@Param('id') id: string) {
    return this.users.toggleActive(id);
  }
}
