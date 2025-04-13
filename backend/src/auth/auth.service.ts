import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async register(
    createUserDto: CreateUserDto,
  ): Promise<{ user: Partial<User>; token: string }> {
    const user = await this.usersService.create(createUserDto);

    const payload = { sub: user._id.toString(), email: user.email };
    this.logger.debug(
      `Generated JWT payload for user: ${JSON.stringify(payload)}`,
    );

    const token = this.jwtService.sign(payload);
    this.logger.debug(`JWT token generated successfully`);

    try {
      await this.emailService.sendRegistrationEmail(user.email, user.firstName);
    } catch (error) {
      this.logger.error(
        `Error sending registration email: ${error.message}`,
        error.stack,
      );
    }

    const userObj = user.toObject();
    const { password, ...userWithoutPassword } = userObj;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ user: Partial<User>; token: string }> {
    try {
      const user = await this.usersService.findByEmail(loginUserDto.email);
      this.logger.debug(`Found user with email ${loginUserDto.email}`);

      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user ${loginUserDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user._id.toString(), email: user.email };
      const token = this.jwtService.sign(payload);

      try {
        this.jwtService.verify(token);
      } catch (error) {
        this.logger.error(`Token verification failed: ${error.message}`);
        throw new Error(`Failed to verify token: ${error.message}`);
      }

      const userObj = user.toObject();
      const { password, ...userWithoutPassword } = userObj;

      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
