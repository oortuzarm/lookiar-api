import { Injectable, NotFoundException } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Injectable()
export class ExperiencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateExperienceDto) {
    const hashId = nanoid(10);
    return this.prisma.experience.create({
      data: {
        hashId,
        userId,
        name: dto.name,
        type: dto.type as any,
        productUrl: dto.productUrl,
      },
      include: {
        theme: true,
        _count: { select: { assets: true, annotations: true } },
      },
    });
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.experience.findMany({
        where: { userId, status: { not: 'DELETED' as any } },
        include: {
          theme: true,
          _count: {
            select: { assets: true, annotations: true, viewEvents: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.experience.count({
        where: { userId, status: { not: 'DELETED' as any } },
      }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const exp = await this.prisma.experience.findFirst({
      where: { id, userId, status: { not: 'DELETED' as any } },
      include: {
        theme: true,
        annotations: true,
        assets: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
        },
        _count: { select: { viewEvents: true } },
      },
    });
    if (!exp) throw new NotFoundException('Experiencia no encontrada');
    return exp;
  }

  async update(id: string, userId: string, dto: UpdateExperienceDto) {
    await this.assertOwnership(id, userId);
    return this.prisma.experience.update({
      where: { id },
      data: dto as any,
      include: { theme: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.assertOwnership(id, userId);
    await this.prisma.experience.update({
      where: { id },
      data: { status: 'DELETED' as any },
    });
    return { message: 'Experiencia eliminada' };
  }

  async getStats(id: string, userId: string) {
    await this.assertOwnership(id, userId);

    const [total, byCountry, recent] = await Promise.all([
      this.prisma.viewEvent.count({ where: { experienceId: id } }),
      this.prisma.viewEvent.groupBy({
        by: ['country'],
        where: { experienceId: id, country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
        take: 10,
      }),
      this.prisma.viewEvent.findMany({
        where: { experienceId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          country: true,
          city: true,
          duration: true,
          referer: true,
          createdAt: true,
        },
      }),
    ]);

    return { total, byCountry, recent };
  }

  private async assertOwnership(id: string, userId: string) {
    const exp = await this.prisma.experience.findFirst({
      where: { id, userId, status: { not: 'DELETED' as any } },
    });
    if (!exp) throw new NotFoundException('Experiencia no encontrada');
    return exp;
  }
}
