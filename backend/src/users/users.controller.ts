import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
    // The user is automatically attached to the request by the JwtAuthGuard
    return req.user;
  }
}
