import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.module';
import { profiles, interests } from '../../database/schema';
import { OnboardingStatus } from './models/onboarding.model';

@Injectable()
export class OnboardingService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async getProfile(userId: string) {
    const result = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }

  async setName(userId: string, name: string) {
    const result = await this.db
      .update(profiles)
      .set({ name, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async setBio(userId: string, bio: string) {
    const result = await this.db
      .update(profiles)
      .set({ bio, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async setAge(userId: string, age: number) {
    const result = await this.db
      .update(profiles)
      .set({ age, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async setGender(userId: string, gender: 'male' | 'female' | 'other') {
    const result = await this.db
      .update(profiles)
      .set({ gender, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async setLookingFor(userId: string, lookingFor: 'male' | 'female' | 'both') {
    const result = await this.db
      .update(profiles)
      .set({ lookingFor, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async setInterests(userId: string, interestIds: string[]) {
    const result = await this.db
      .update(profiles)
      .set({ interests: interestIds, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async setPhotos(userId: string, photoUrls: string[]) {
    const result = await this.db
      .update(profiles)
      .set({ photos: photoUrls, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async setLocation(
    userId: string,
    location: { city?: string; latitude?: string; longitude?: string },
  ) {
    const result = await this.db
      .update(profiles)
      .set({ ...location, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async completeOnboarding(userId: string) {
    const result = await this.db
      .update(profiles)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async getOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
    const profile = await this.getProfile(userId);
    if (!profile) return null;

    const photos = (profile.photos as string[]) || [];
    const interestsList = (profile.interests as string[]) || [];

    const hasName = !!profile.name;
    const hasBio = !!profile.bio;
    const hasAge = !!profile.age;
    const hasGender = !!profile.gender;
    const hasLookingFor = !!profile.lookingFor;
    const hasInterests = interestsList.length > 0;
    const hasPhotos = photos.length >= 2;
    const hasLocation = !!(profile.city || (profile.latitude && profile.longitude));

    const isComplete =
      hasName &&
      hasAge &&
      hasGender &&
      hasLookingFor &&
      hasPhotos &&
      hasLocation;

    return {
      hasName,
      hasBio,
      hasAge,
      hasGender,
      hasLookingFor,
      hasInterests,
      hasPhotos,
      hasLocation,
      isComplete,
      photosCount: photos.length,
      interestsCount: interestsList.length,
    };
  }

  async getAllInterests() {
    return this.db.select().from(interests).where(eq(interests.isActive, true));
  }
}
