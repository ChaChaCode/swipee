import { Resolver, Query, Mutation, Args, ID, Int, ResolveField, Parent } from '@nestjs/graphql';
import { BadRequestException } from '@nestjs/common';
import { ProfileModel, Gender, LookingFor, Purpose } from './models/profile.model';
import { PhotoModel, toPhotoModels } from './models/photo.model';
import { ProfilesService } from './profiles.service';

@Resolver(() => ProfileModel)
export class ProfilesResolver {
  constructor(private profilesService: ProfilesService) {}

  @ResolveField(() => [PhotoModel])
  photos(@Parent() profile: { photos: string[] | null }): PhotoModel[] {
    return toPhotoModels(profile.photos);
  }

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
    @Args('anyLocation', { type: () => Boolean, nullable: true }) anyLocation?: boolean,
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
    if (anyLocation === true) {
      // Если выбрано "неважно" - сбрасываем город и координаты
      updateData.city = null;
      updateData.latitude = null;
      updateData.longitude = null;
      updateData.anyLocation = true;
    } else if (anyLocation === false || city !== undefined || latitude !== undefined || longitude !== undefined) {
      // Если указан конкретный город/координаты
      if (city !== undefined) updateData.city = city;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (anyLocation === false) updateData.anyLocation = false;
    }
    if (photos !== undefined) updateData.photos = photos;
    if (interests !== undefined) updateData.interests = interests;
    if (minAge !== undefined) updateData.minAge = minAge;
    if (maxAge !== undefined) updateData.maxAge = maxAge;
    if (maxDistance !== undefined) updateData.maxDistance = maxDistance;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = onboardingCompleted;

    return this.profilesService.update(profile.id, updateData);
  }

  @Mutation(() => Boolean)
  async deleteProfile(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<boolean> {
    const result = await this.profilesService.deleteByUserId(userId);
    return result !== null;
  }

  // === Управление фотографиями ===

  @Mutation(() => ProfileModel)
  async addPhoto(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('photoUrl', { type: () => String }) photoUrl: string,
    @Args('position', { type: () => Int, nullable: true }) position?: number,
  ) {
    const profile = await this.profilesService.findOrCreate(userId);
    const photos = (profile.photos as string[]) || [];

    if (photos.length >= 6) {
      throw new BadRequestException('Maximum 6 photos allowed');
    }

    if (photos.includes(photoUrl)) {
      throw new BadRequestException('Photo already exists');
    }

    // Если позиция не указана или больше длины - добавляем в конец
    const insertPosition = position !== undefined && position >= 0 && position <= photos.length
      ? position
      : photos.length;

    photos.splice(insertPosition, 0, photoUrl);

    return this.profilesService.update(profile.id, { photos });
  }

  @Mutation(() => ProfileModel)
  async removePhoto(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('photoUrl', { type: () => String, nullable: true }) photoUrl?: string,
    @Args('position', { type: () => Int, nullable: true }) position?: number,
  ) {
    const profile = await this.profilesService.findOrCreate(userId);
    const photos = (profile.photos as string[]) || [];

    if (photoUrl) {
      const index = photos.indexOf(photoUrl);
      if (index === -1) {
        throw new BadRequestException('Photo not found');
      }
      photos.splice(index, 1);
    } else if (position !== undefined && position >= 0 && position < photos.length) {
      photos.splice(position, 1);
    } else {
      throw new BadRequestException('Provide either photoUrl or valid position');
    }

    return this.profilesService.update(profile.id, { photos });
  }

  @Mutation(() => ProfileModel)
  async reorderPhotos(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('photoUrls', { type: () => [String] }) photoUrls: string[],
  ) {
    const profile = await this.profilesService.findOrCreate(userId);
    const currentPhotos = (profile.photos as string[]) || [];

    // Проверяем что все URL из нового порядка существуют в текущих фото
    const currentSet = new Set(currentPhotos);
    const newSet = new Set(photoUrls);

    if (photoUrls.length !== currentPhotos.length) {
      throw new BadRequestException('Photo count mismatch');
    }

    for (const url of photoUrls) {
      if (!currentSet.has(url)) {
        throw new BadRequestException(`Photo not found: ${url}`);
      }
    }

    for (const url of currentPhotos) {
      if (!newSet.has(url)) {
        throw new BadRequestException(`Missing photo in new order: ${url}`);
      }
    }

    return this.profilesService.update(profile.id, { photos: photoUrls });
  }

  @Mutation(() => ProfileModel)
  async movePhoto(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('fromPosition', { type: () => Int }) fromPosition: number,
    @Args('toPosition', { type: () => Int }) toPosition: number,
  ) {
    const profile = await this.profilesService.findOrCreate(userId);
    const photos = (profile.photos as string[]) || [];

    if (fromPosition < 0 || fromPosition >= photos.length) {
      throw new BadRequestException('Invalid fromPosition');
    }

    if (toPosition < 0 || toPosition >= photos.length) {
      throw new BadRequestException('Invalid toPosition');
    }

    // Перемещаем фото
    const [photo] = photos.splice(fromPosition, 1);
    photos.splice(toPosition, 0, photo);

    return this.profilesService.update(profile.id, { photos });
  }
}
