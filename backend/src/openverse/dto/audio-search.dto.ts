import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum AudioLicense {
  BY = 'by',
  BY_SA = 'by-sa',
  BY_NC = 'by-nc',
  BY_ND = 'by-nd',
  BY_NC_SA = 'by-nc-sa',
  BY_NC_ND = 'by-nc-nd',
  PDM = 'pdm',
  CC0 = 'cc0',
}

export class AudioSearchDto {
  @ApiProperty({
    description: 'Search query for audio',
    example: 'piano',
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
    enum: AudioLicense,
    enumName: 'AudioLicense',
    required: false,
  })
  @IsOptional()
  @IsEnum(AudioLicense)
  license?: AudioLicense;

  @ApiProperty({
    description: 'Filter by audio source',
    example: 'jamendo',
    required: false,
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({
    description: 'Filter by audio creator',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  creator?: string;

  @ApiProperty({
    description: 'Filter by audio genre',
    example: 'classical',
    required: false,
  })
  @IsOptional()
  @IsString()
  genres?: string;

  @ApiProperty({
    description: 'Filter by duration',
    example: '0-300',
    required: false,
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({
    description: 'Filter by tags',
    example: 'music,instrumental',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;
}
