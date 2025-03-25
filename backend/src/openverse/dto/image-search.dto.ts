import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ImageCategory {
  PHOTOGRAPH = 'photograph',
  ILLUSTRATION = 'illustration',
  DIGITIZED_ARTWORK = 'digitized_artwork',
}

export enum ImageLicense {
  BY = 'by',
  BY_SA = 'by-sa',
  BY_NC = 'by-nc',
  BY_ND = 'by-nd',
  BY_NC_SA = 'by-nc-sa',
  BY_NC_ND = 'by-nc-nd',
  PDM = 'pdm',
  CC0 = 'cc0',
}

export class ImageSearchDto {
  @ApiProperty({
    description: 'Search query for images',
    example: 'mountain',
    required: true,
  })
  @IsString()
  q: string;

  @ApiProperty({
    description: 'The number of results to return per page',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value as string))
  page_size?: number = 20;

  @ApiProperty({
    description: 'The page number to return',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value as string))
  page?: number = 1;

  @ApiProperty({
    description: 'Filter by license type',
    enum: ImageLicense,
    enumName: 'ImageLicense',
    required: false,
  })
  @IsOptional()
  @IsEnum(ImageLicense)
  license?: ImageLicense;

  @ApiProperty({
    description: 'Filter by image category',
    enum: ImageCategory,
    enumName: 'ImageCategory',
    required: false,
  })
  @IsOptional()
  @IsEnum(ImageCategory)
  category?: ImageCategory;

  @ApiProperty({
    description: 'Filter by image source',
    example: 'flickr',
    required: false,
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({
    description: 'Filter by image creator',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  creator?: string;

  @ApiProperty({
    description: 'Filter by tags',
    example: 'nature,landscape',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;
}
