import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({
    description: 'The MongoDB ObjectId',
    example: '60d21b4667d0d8992e610c85',
  })
  _id: Types.ObjectId;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @Prop({ required: true })
  lastName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({
    description: 'The hashed password',
    example: '$2b$10$XIMIy1BsYSqtUbQKJDVQwOfhBGJO3JbDeZJ9P/Hf1MxQt6s0q0vOa',
  })
  @Prop({ required: true })
  password: string;

  @ApiProperty({
    description: 'When the user was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'When the user was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
