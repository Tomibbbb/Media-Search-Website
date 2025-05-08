import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { User } from '../users/schemas/user.schema';
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
    const token = this.jwtService.sign(payload);

    try {
      await this.emailService.sendRegistrationEmail(user.email, user.firstName);
    } catch (_error) {
      this.logger.error(`Error sending registration email`);
    }

    const userObj = user.toObject();
    const { password: _pw, ...userWithoutPassword } = userObj;

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

      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user._id.toString(), email: user.email };
      const token = this.jwtService.sign(payload);

      const userObj = user.toObject();
      const { password: _pw, ...userWithoutPassword } = userObj;

      return {
        user: userWithoutPassword,
        token,
      };
    } catch (_error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      
      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      return decoded;
    } catch (_error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
  
  async googleLogin(user: Record<string, any>): Promise<{ user: Partial<User>; token: string }> {
    if (!user) {
      throw new UnauthorizedException('Google authentication failed: No user data');
    }
    
    const userId = user.userId || user._id;
    const email = user.email;
    const firstName = user.firstName || 'Google';
    const lastName = user.lastName || 'User';
    
    if (!userId || !email) {
      throw new UnauthorizedException('Google authentication failed: Missing user data');
    }
    
    const payload = { 
      sub: userId.toString(), 
      email: email
    };
    
    const token = this.jwtService.sign(payload);
    
    return {
      user: {
        _id: userId,
        firstName,
        lastName,
        email,
      },
      token,
    };
  }
  
  getFrontendUrl(): string {
    return this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
  }
}
