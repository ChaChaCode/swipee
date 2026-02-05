import { Injectable } from '@nestjs/common';
import { TelegramService, TelegramInitData } from './telegram.service';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';
import { calculateAge } from '../../common/utils/age.utils';

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
    userId: string;
    name: string | null;
    bio: string | null;
    age: number | null;
    birthDate: Date | null;
    gender: string | null;
    lookingFor: string | null;
    purpose: string | null;
    city: string | null;
    latitude: string | null;
    longitude: string | null;
    photos: string[];
    interests: string[];
    minAge: number;
    maxAge: number;
    maxDistance: number;
    isVisible: boolean;
    onboardingCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
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

  async authenticateTestUser(telegramId: number): Promise<AuthResult | null> {
    // Find existing user by telegramId
    const user = await this.usersService.findByTelegramId(telegramId);

    if (!user) {
      return null;
    }

    // Get profile
    const profile = await this.profilesService.findByUserId(user.id);

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
      profile: profile ? this.mapProfile(profile) : null,
      isNewUser: false,
    };
  }

  private mapProfile(profile: NonNullable<Awaited<ReturnType<typeof this.profilesService.findByUserId>>>) {
    return {
      id: profile.id,
      userId: profile.userId,
      name: profile.name,
      bio: profile.bio,
      age: calculateAge(profile.birthDate),
      birthDate: profile.birthDate,
      gender: profile.gender,
      lookingFor: profile.lookingFor,
      purpose: profile.purpose,
      city: profile.city,
      latitude: profile.latitude,
      longitude: profile.longitude,
      photos: (profile.photos as string[]) || [],
      interests: (profile.interests as string[]) || [],
      minAge: profile.minAge ?? 18,
      maxAge: profile.maxAge ?? 100,
      maxDistance: profile.maxDistance ?? 50,
      isVisible: profile.isVisible ?? true,
      onboardingCompleted: profile.onboardingCompleted ?? false,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
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
      profile: profile ? this.mapProfile(profile) : null,
      isNewUser,
    };
  }
}
