import { Controller, Get, Post, Delete, UseGuards, Request, Body, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiParam,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { SavedSearch } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile (protected route)' })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or expired token',
  })
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('saved-searches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user saved searches' })
  @ApiOkResponse({
    description: 'Saved searches retrieved successfully',
    type: [SavedSearch],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or expired token',
  })
  async getSavedSearches(@Request() req) {
    return this.usersService.getSavedSearches(req.user._id);
  }

  @Post('saved-searches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a new search' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['type', 'query'],
      properties: {
        type: { type: 'string', enum: ['image', 'audio'], example: 'image' },
        query: { type: 'string', example: 'nature' },
        filters: { 
          type: 'object', 
          example: { license: 'by', category: 'photograph' } 
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'Search saved successfully',
    type: [SavedSearch],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or expired token',
  })
  async addSavedSearch(@Request() req, @Body() savedSearch: SavedSearch) {
    return this.usersService.addSavedSearch(req.user._id, savedSearch);
  }

  @Delete('saved-searches/:index')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a saved search by index' })
  @ApiParam({ name: 'index', type: 'number', description: 'Index of the search to delete' })
  @ApiOkResponse({
    description: 'Search deleted successfully',
    type: [SavedSearch],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or expired token',
  })
  @ApiNotFoundResponse({
    description: 'Saved search not found',
  })
  async deleteSavedSearch(
    @Request() req, 
    @Param('index', ParseIntPipe) index: number
  ) {
    return this.usersService.deleteSavedSearch(req.user._id, index);
  }
}
