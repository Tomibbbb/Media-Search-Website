import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    description: 'The password for the user account (min 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  readonly password: string;
}
