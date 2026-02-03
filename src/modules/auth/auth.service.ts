import { Injectable } from '@nestjs/common';
import { TelegramService, TelegramInitData } from './telegram.service';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';

export interface AuthResult {
  user: {
    id: string;
    telegramId: number;
    username: string | null;
    firstName: string;
    lastName: string | null;
    languageCode: string | null;
    isPremium: boolean | null;
    isActive: boolean | null;
    createdAt: Date;
    updatedAt: Date;
  };
  profile: {
    id: string;
    bio: string | null;
    photos: string[];
    interests: string[];
  } | null;
  isNewUser: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private telegramService: TelegramService,
    private usersService: UsersService,
    private profilesService: ProfilesService,
  ) {}

  async authenticateWithInitData(initData: string): Promise<AuthResult> {
    // Validate and parse initData
    const telegramData = this.telegramService.validateInitData(initData);

    return this.processAuth(telegramData);
  }

  async authenticateUnsafe(initData: string): Promise<AuthResult | null> {
    // Parse without validation (for development)
    const telegramData = this.telegramService.parseInitDataUnsafe(initData);

    if (!telegramData) return null;

    return this.processAuth(telegramData);
  }

  private async processAuth(telegramData: TelegramInitData): Promise<AuthResult> {
    const { user: tgUser } = telegramData;

    // Check if user exists
    const existingUser = await this.usersService.findByTelegramId(tgUser.id);
    const isNewUser = !existingUser;

    // Create or update user
    const user = await this.usersService.findOrCreate({
      telegramId: tgUser.id,
      username: tgUser.username,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name,
      languageCode: tgUser.language_code,
      isPremium: tgUser.is_premium,
    });

    if (!user) {
      throw new Error('Failed to create user');
    }

    // Get or create profile
    let profile = await this.profilesService.findByUserId(user.id);

    if (!profile) {
      profile = await this.profilesService.create(user.id);
    }

    return {
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        languageCode: user.languageCode,
        isPremium: user.isPremium,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: profile
        ? {
            id: profile.id,
            bio: profile.bio,
            photos: (profile.photos as string[]) || [],
            interests: (profile.interests as string[]) || [],
          }
        : null,
      isNewUser,
    };
  }
}
