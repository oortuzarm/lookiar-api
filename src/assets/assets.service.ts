import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

type AssetTypeKey = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'MODEL' | 'MARKER' | 'HDR';

function detectType(mimetype: string): AssetTypeKey {
  if (mimetype.startsWith('image/')) return 'IMAGE';
  if (mimetype.startsWith('video/')) return 'VIDEO';
  if (mimetype.startsWith('audio/')) return 'AUDIO';
  return 'MODEL';
}

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async upload(
    userId: string,
    file: Express.Multer.File,
    experienceId?: string,
    typeOverride?: AssetTypeKey,
  ) {
    const folder = `assets/${userId}`;
    const { key, url } = await this.storage.upload(file, folder);

    const type = typeOverride ?? detectType(file.mimetype);

    return this.prisma.asset.create({
      data: {
        userId,
        experienceId: experienceId || null,
        type: type as any,
        name: file.originalname,
        s3Key: key,
        url,
        size: file.size,
        contentType: file.mimetype,
      },
    });
  }

  async findAll(userId: string, experienceId?: string) {
    return this.prisma.asset.findMany({
      where: {
        userId,
        ...(experienceId ? { experienceId } : {}),
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!asset) throw new NotFoundException('Asset no encontrado');

    await this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Asset eliminado' };
  }
}
