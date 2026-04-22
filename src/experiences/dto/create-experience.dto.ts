import { IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExperienceDto {
  @ApiProperty({ example: 'Silla de Oficina Premium' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ['SPATIAL', 'MARKER_BASED'], default: 'SPATIAL' })
  @IsEnum(['SPATIAL', 'MARKER_BASED'])
  @IsOptional()
  type?: 'SPATIAL' | 'MARKER_BASED' = 'SPATIAL';

  @ApiPropertyOptional({ example: 'https://tienda.com/producto/silla' })
  @IsUrl()
  @IsOptional()
  productUrl?: string;
}
