import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3000/api/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Record<string, any>,
  ): Promise<Record<string, string>> {
    const emails = Array.isArray(profile.emails) ? profile.emails : [];
    const name = profile.name && typeof profile.name === 'object' ? profile.name : {};
    
    if (emails.length === 0) {
      throw new Error('Google authentication failed: No email provided');
    }
    
    const email = emails[0] && typeof emails[0].value === 'string' ? emails[0].value : '';
    
    const displayName = typeof profile.displayName === 'string' ? profile.displayName : '';
    const displayNameParts = displayName.split(' ');
    const firstNameFromDisplay = displayNameParts.length > 0 ? displayNameParts[0] : '';
    const lastNameFromDisplay = displayNameParts.length > 1 ? displayNameParts.slice(1).join(' ') : '';
    
    const firstName = (name.givenName && typeof name.givenName === 'string') 
      ? name.givenName 
      : (firstNameFromDisplay || 'Google');
      
    const lastName = (name.familyName && typeof name.familyName === 'string')
      ? name.familyName
      : (lastNameFromDisplay || 'User');

    let user;
    try {
      user = await this.usersService.findByEmail(email);
    } catch (_error) {
      const password = this.generateRandomPassword();
      user = await this.usersService.create({
        email,
        firstName,
        lastName,
        password,
      });
    }

    if (!user || !user._id) {
      throw new Error('Failed to retrieve or create user');
    }

    return {
      userId: user._id.toString(),
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
    };
  }

  private generateRandomPassword(): string {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }
}