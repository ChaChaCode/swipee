import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BadRequestException } from '@nestjs/common';
import { ProfileModel } from './models/profile.model';
import { ProfilesService } from './profiles.service';
import { UpdateProfileInput } from './dto/update-profile.input';

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
    @Args('input') input: UpdateProfileInput,
  ) {
    console.log('updateProfile input:', JSON.stringify(input, null, 2));

    const profile = await this.profilesService.findOrCreate(userId);

    // После онбординга нельзя менять пол
    if (profile.onboardingCompleted && input.gender !== undefined) {
      throw new BadRequestException('Cannot change gender after onboarding');
    }

    const result = await this.profilesService.update(profile.id, input);
    console.log('updateProfile result:', JSON.stringify(result, null, 2));
    return result;
  }
}
