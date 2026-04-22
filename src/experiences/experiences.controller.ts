import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@ApiTags('experiences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('experiences')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear experiencia AR' })
  create(@Request() req, @Body() dto: CreateExperienceDto) {
    return this.experiencesService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar experiencias del usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Request() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.experiencesService.findAll(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de experiencia' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.experiencesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar experiencia' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.experiencesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar experiencia (soft delete)' })
  remove(@Request() req, @Param('id') id: string) {
    return this.experiencesService.remove(id, req.user.id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Estadísticas de vistas' })
  getStats(@Request() req, @Param('id') id: string) {
    return this.experiencesService.getStats(id, req.user.id);
  }
}
