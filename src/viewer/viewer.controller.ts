import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
  Headers,
  Ip,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

class RecordViewDto {
  @ApiPropertyOptional({ description: 'Duración en segundos' })
  @IsInt()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;
}

@ApiTags('viewer')
@Controller('v')
export class ViewerController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':hashId')
  @ApiOperation({ summary: 'Obtener experiencia pública para el visor AR' })
  async getExperience(@Param('hashId') hashId: string) {
    const exp = await this.prisma.experience.findUnique({
      where: { hashId },
      include: {
        theme: true,
        annotations: true,
        assets: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!exp || exp.status === ('DELETED' as any)) {
      throw new NotFoundException('Experiencia no encontrada');
    }

    return exp;
  }

  @Post(':hashId/view')
  @ApiOperation({ summary: 'Registrar evento de vista' })
  async recordView(
    @Param('hashId') hashId: string,
    @Body() dto: RecordViewDto,
    @Ip() ip: string,
    @Headers('referer') referer?: string,
  ) {
    const exp = await this.prisma.experience.findUnique({
      where: { hashId },
      select: { id: true, status: true },
    });

    if (!exp || exp.status === ('DELETED' as any)) {
      throw new NotFoundException('Experiencia no encontrada');
    }

    await Promise.all([
      this.prisma.viewEvent.create({
        data: {
          experienceId: exp.id,
          ip,
          country: dto.country,
          city: dto.city,
          duration: dto.duration,
          referer,
        },
      }),
      this.prisma.experience.update({
        where: { id: exp.id },
        data: { viewsCount: { increment: 1 } },
      }),
    ]);

    return { ok: true };
  }
}
