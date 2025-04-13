import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from '../users/dto/login-user.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let emailService: EmailService;

  const mockUser = {
    _id: 'user-id',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword',
    toObject: () => ({
      _id: 'user-id',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'hashedPassword',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'john.doe@example.com' }),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendRegistrationEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              return 'some-value';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    it('should register a new user and return user data with token', async () => {
      // Mock user creation
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);

      // Call the register method
      const result = await service.register(createUserDto);

      // Verify user creation was called
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);

      // Verify JWT token was generated
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id.toString(),
        email: mockUser.email,
      });

      // Verify email was sent
      expect(emailService.sendRegistrationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
      );

      // Verify response structure
      expect(result).toEqual({
        user: {
          _id: 'user-id',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        token: 'test-token',
      });
    });

    it('should handle email service errors gracefully', async () => {
      // Mock user creation
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);

      // Mock email service failure
      (emailService.sendRegistrationEmail as jest.Mock).mockRejectedValue(
        new Error('Email sending failed'),
      );

      // Call the register method - should not throw
      const result = await service.register(createUserDto);

      // Verify response is still correct despite email failure
      expect(result).toEqual({
        user: {
          _id: 'user-id',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        token: 'test-token',
      });
    });
  });

  describe('login', () => {
    const loginUserDto: LoginUserDto = {
      email: 'john.doe@example.com',
      password: 'password123',
    };

    it('should return user data and token when credentials are valid', async () => {
      // Mock user retrieval
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock password comparison
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Call the login method
      const result = await service.login(loginUserDto);

      // Verify credentials were checked
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginUserDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginUserDto.password,
        mockUser.password,
      );

      // Verify JWT token was generated
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id.toString(),
        email: mockUser.email,
      });

      // Verify response structure
      expect(result).toEqual({
        user: {
          _id: 'user-id',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
        token: 'test-token',
      });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Mock user retrieval
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock invalid password
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Verify it throws the expected exception
      await expect(service.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Mock user not found
      (usersService.findByEmail as jest.Mock).mockRejectedValue(
        new Error('User not found'),
      );

      // Verify it throws the expected exception
      await expect(service.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateToken', () => {
    it('should return decoded token payload when token is valid', async () => {
      const result = await service.validateToken('valid-token');
      
      // Verify token was verified
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      
      // Verify result contains the decoded payload
      expect(result).toEqual({ 
        sub: 'user-id', 
        email: 'john.doe@example.com' 
      });
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      // Mock token verification failure
      (jwtService.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      // Verify it throws the expected exception
      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});