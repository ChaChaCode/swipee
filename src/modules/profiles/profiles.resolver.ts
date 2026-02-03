import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { BadRequestException } from '@nestjs/common';
import { ProfileModel, Gender, LookingFor, Purpose } from './models/profile.model';
import { ProfilesService } from './profiles.service';

@Resolver(() => ProfileModel)
export class ProfilesResolver {
  constructor(private profilesService: ProfilesService) {}

  @Query(() => ProfileModel, { nullable: true })
  async profile(@Args('id', { type: () => ID }) id: string) {
    return this.profilesService.findById(id);
  }

  @Query(() => ProfileModel, { nullable: true })
  async profileByUserId(@Args('userId', { type: () => ID }) userId: string) {
    return this.profilesService.findByUserId(userId);
  }

  @Mutation(() => ProfileModel)
  async updateProfile(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('name', { type: () => String, nullable: true }) name?: string,
    @Args('bio', { type: () => String, nullable: true }) bio?: string,
    @Args('birthDate', { type: () => Date, nullable: true }) birthDate?: Date,
    @Args('gender', { type: () => Gender, nullable: true }) gender?: Gender,
    @Args('lookingFor', { type: () => LookingFor, nullable: true }) lookingFor?: LookingFor,
    @Args('purpose', { type: () => Purpose, nullable: true }) purpose?: Purpose,
    @Args('city', { type: () => String, nullable: true }) city?: string,
    @Args('latitude', { type: () => String, nullable: true }) latitude?: string,
    @Args('longitude', { type: () => String, nullable: true }) longitude?: string,
    @Args('photos', { type: () => [String], nullable: true }) photos?: string[],
    @Args('interests', { type: () => [String], nullable: true }) interests?: string[],
    @Args('minAge', { type: () => Int, nullable: true }) minAge?: number,
    @Args('maxAge', { type: () => Int, nullable: true }) maxAge?: number,
    @Args('maxDistance', { type: () => Int, nullable: true }) maxDistance?: number,
    @Args('isVisible', { type: () => Boolean, nullable: true }) isVisible?: boolean,
    @Args('onboardingCompleted', { type: () => Boolean, nullable: true }) onboardingCompleted?: boolean,
  ) {
    const profile = await this.profilesService.findOrCreate(userId);

    // После онбординга нельзя менять пол
    if (profile.onboardingCompleted && gender !== undefined) {
      throw new BadRequestException('Cannot change gender after onboarding');
    }

    // Собираем только переданные поля
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (birthDate !== undefined) updateData.birthDate = birthDate;
    if (gender !== undefined) updateData.gender = gender;
    if (lookingFor !== undefined) updateData.lookingFor = lookingFor;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (city !== undefined) updateData.city = city;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (photos !== undefined) updateData.photos = photos;
    if (interests !== undefined) updateData.interests = interests;
    if (minAge !== undefined) updateData.minAge = minAge;
    if (maxAge !== undefined) updateData.maxAge = maxAge;
    if (maxDistance !== undefined) updateData.maxDistance = maxDistance;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = onboardingCompleted;

    return this.profilesService.update(profile.id, updateData);
  }
}
