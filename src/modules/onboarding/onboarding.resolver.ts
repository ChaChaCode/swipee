import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { OnboardingService } from './onboarding.service';
import {
  OnboardingProfile,
  OnboardingStatus,
  InterestModel,
  Gender,
  LookingFor,
} from './models/onboarding.model';
import { toPhotoModels } from '../profiles/models/photo.model';
import {
  SetNameInput,
  SetBioInput,
  SetGenderInput,
  SetLookingForInput,
  SetInterestsInput,
  SetPhotosInput,
  SetLocationInput,
  SetAgeInput,
  CompleteOnboardingInput,
} from './dto/onboarding.input';

@Resolver()
export class OnboardingResolver {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Query(() => OnboardingProfile, { nullable: true })
  async onboardingProfile(
    @Args('userId') userId: string,
  ): Promise<OnboardingProfile | null> {
    const profile = await this.onboardingService.getProfile(userId);
    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.name ?? undefined,
      bio: profile.bio ?? undefined,
      age: profile.age ?? undefined,
      gender: profile.gender as Gender | undefined,
      lookingFor: profile.lookingFor as LookingFor | undefined,
      photos: toPhotoModels(profile.photos as string[]),
      interests: (profile.interests as string[]) || [],
      city: profile.city ?? undefined,
      latitude: profile.latitude ?? undefined,
      longitude: profile.longitude ?? undefined,
      anyLocation: profile.anyLocation ?? undefined,
      onboardingCompleted: profile.onboardingCompleted ?? false,
    };
  }

  @Query(() => OnboardingStatus, { nullable: true })
  async onboardingStatus(
    @Args('userId') userId: string,
  ): Promise<OnboardingStatus | null> {
    return this.onboardingService.getOnboardingStatus(userId);
  }

  @Query(() => [InterestModel])
  async interests(): Promise<InterestModel[]> {
    const result = await this.onboardingService.getAllInterests();
    return result.map((i) => ({
      id: i.id,
      name: i.name,
      emoji: i.emoji ?? undefined,
      category: i.category ?? undefined,
    }));
  }

  @Mutation(() => OnboardingProfile)
  async setName(
    @Args('userId') userId: string,
    @Args('input') input: SetNameInput,
  ): Promise<OnboardingProfile> {
    const profile = await this.onboardingService.setName(userId, input.name);
    return this.mapToOnboardingProfile(profile);
  }

  @Mutation(() => OnboardingProfile)
  async setBio(
    @Args('userId') userId: string,
    @Args('input') input: SetBioInput,
  ): Promise<OnboardingProfile> {
    const profile = await this.onboardingService.setBio(userId, input.bio);
    return this.mapToOnboardingProfile(profile);
  }

  @Mutation(() => OnboardingProfile)
  async setAge(
    @Args('userId') userId: string,
    @Args('input') input: SetAgeInput,
  ): Promise<OnboardingProfile> {
    const profile = await this.onboardingService.setAge(userId, input.age);
    return this.mapToOnboardingProfile(profile);
  }

  @Mutation(() => OnboardingProfile)
  async setGender(
    @Args('userId') userId: string,
    @Args('input') input: SetGenderInput,
  ): Promise<OnboardingProfile> {
    const profile = await this.onboardingService.setGender(
      userId,
      input.gender.toLowerCase() as 'male' | 'female' | 'other',
    );
    return this.mapToOnboardingProfile(profile);
  }

  @Mutation(() => OnboardingProfile)
  async setLookingFor(
    @Args('userId') userId: string,
    @Args('input') input: SetLookingForInput,
  ): Promise<OnboardingProfile> {
    const profile = await this.onboardingService.setLookingFor(
      userId,
      input.lookingFor.toLowerCase() as 'male' | 'female' | 'both',
    );
    return this.mapToOnboardingProfile(profile);
  }

  @Mutation(() => OnboardingProfile)
  async setInterests(
    @Args('userId') userId: string,
    @Args('input') input: SetInterestsInput,
  ): Promise<OnboardingProfile> {
    const profile = await this.onboardingService.setInterests(
      userId,
      input.interestIds,
    );
    return this.mapToOnboardingProfile(profile);
  }

  @Mutation(() => OnboardingProfile)
  async setPhotos(
    @Args('userId') userId: string,
    @Args('input') input: SetPhotosInput,
  ): Promise<OnboardingProfile> {
    const profile = await this.onboardingService.setPhotos(
      userId,
      input.photoUrls,
    );
    return this.mapToOnboardingProfile(profile);
  }

  @Mutation(() => OnboardingProfile)
  async setLocation(
    @Args('userId') userId: string,
    @Args('input') input: SetLocationInput,
  ): Promise<OnboardingProfile> {
    const profile = await this.onboardingService.setLocation(userId, {
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude,
      anyLocation: input.anyLocation,
    });
    return this.mapToOnboardingProfile(profile);
  }

  @Mutation(() => OnboardingProfile)
  async completeOnboarding(
    @Args('userId') userId: string,
    @Args('input') input: CompleteOnboardingInput,
  ): Promise<OnboardingProfile> {
    // Set all fields at once
    await this.onboardingService.setName(userId, input.name);
    if (input.bio) {
      await this.onboardingService.setBio(userId, input.bio);
    }
    await this.onboardingService.setAge(userId, input.age);
    await this.onboardingService.setGender(
      userId,
      input.gender.toLowerCase() as 'male' | 'female' | 'other',
    );
    await this.onboardingService.setLookingFor(
      userId,
      input.lookingFor.toLowerCase() as 'male' | 'female' | 'both',
    );
    await this.onboardingService.setInterests(userId, input.interestIds);
    await this.onboardingService.setPhotos(userId, input.photoUrls);
    if (input.city || input.latitude || input.longitude || input.anyLocation) {
      await this.onboardingService.setLocation(userId, {
        city: input.city,
        latitude: input.latitude,
        longitude: input.longitude,
        anyLocation: input.anyLocation,
      });
    }

    const profile = await this.onboardingService.completeOnboarding(userId);
    return this.mapToOnboardingProfile(profile);
  }

  private mapToOnboardingProfile(profile: any): OnboardingProfile {
    return {
      id: profile.id,
      name: profile.name ?? undefined,
      bio: profile.bio ?? undefined,
      age: profile.age ?? undefined,
      gender: profile.gender as Gender | undefined,
      lookingFor: profile.lookingFor as LookingFor | undefined,
      photos: toPhotoModels(profile.photos as string[]),
      interests: (profile.interests as string[]) || [],
      city: profile.city ?? undefined,
      latitude: profile.latitude ?? undefined,
      longitude: profile.longitude ?? undefined,
      anyLocation: profile.anyLocation ?? undefined,
      onboardingCompleted: profile.onboardingCompleted ?? false,
    };
  }
}
