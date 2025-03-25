import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OpenverseService } from './services/openverse.service';
import { ImageSearchDto } from './dto/image-search.dto';
import { AudioSearchDto } from './dto/audio-search.dto';

@ApiTags('openverse')
@Controller('openverse')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OpenverseController {
  constructor(private readonly openverseService: OpenverseService) {}

  @Get('images')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search for images in Openverse' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of images',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchImages(@Query() searchDto: ImageSearchDto) {
    return this.openverseService.searchImages(searchDto);
  }

  @Get('images/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a specific image by ID' })
  @ApiParam({
    name: 'id',
    description: 'Image ID',
    example: '0dbc5647-8551-4e94-a123-58e8e0255349',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a single image',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getImage(@Param('id') id: string) {
    return this.openverseService.getImage(id);
  }

  @Get('audio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search for audio in Openverse' })
  @ApiResponse({
    status: 200,
    description: 'Returns a paginated list of audio files',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchAudio(@Query() searchDto: AudioSearchDto) {
    return this.openverseService.searchAudio(searchDto);
  }

  @Get('audio/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a specific audio file by ID' })
  @ApiParam({
    name: 'id',
    description: 'Audio ID',
    example: '4fe9f628-5712-49dd-a3c7-89f1f04a3ce7',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a single audio file',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Audio not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAudio(@Param('id') id: string) {
    return this.openverseService.getAudio(id);
  }
}
