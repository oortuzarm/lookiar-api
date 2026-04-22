import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssetsService } from './assets.service';

const FIFTY_MB = 50 * 1024 * 1024;

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Subir archivo a S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiQuery({ name: 'experienceId', required: false })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['IMAGE', 'VIDEO', 'AUDIO', 'MODEL', 'MARKER', 'HDR'],
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: FIFTY_MB },
    }),
  )
  upload(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Query('experienceId') experienceId?: string,
    @Query('type') type?: any,
  ) {
    if (!file) throw new BadRequestException('No se proporcionó archivo');
    return this.assetsService.upload(req.user.id, file, experienceId, type);
  }

  @Get()
  @ApiOperation({ summary: 'Listar assets' })
  @ApiQuery({ name: 'experienceId', required: false })
  findAll(@Request() req, @Query('experienceId') experienceId?: string) {
    return this.assetsService.findAll(req.user.id, experienceId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar asset (soft delete)' })
  remove(@Request() req, @Param('id') id: string) {
    return this.assetsService.remove(id, req.user.id);
  }
}
