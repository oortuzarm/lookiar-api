import { IsString, IsEnum, IsOptional, IsUrl, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExperienceDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: ['SPATIAL', 'MARKER_BASED'] })
  @IsEnum(['SPATIAL', 'MARKER_BASED'])
  @IsOptional()
  type?: 'SPATIAL' | 'MARKER_BASED';

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  productUrl?: string;

  @ApiPropertyOptional({ description: 'Definición de escena A-Frame en formato JSON' })
  @IsObject()
  @IsOptional()
  sceneData?: Record<string, any>;
}
