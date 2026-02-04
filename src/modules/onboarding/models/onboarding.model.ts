import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { Gender, LookingFor } from '../../profiles/models/profile.model';
import { PhotoModel } from '../../profiles/models/photo.model';
export { Gender, LookingFor };

@ObjectType()
export class InterestModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  emoji?: string;

  @Field({ nullable: true })
  category?: string;
}

@ObjectType()
export class OnboardingProfile {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => Int, { nullable: true })
  age?: number;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field(() => LookingFor, { nullable: true })
  lookingFor?: LookingFor;

  @Field(() => [PhotoModel])
  photos: PhotoModel[];

  @Field(() => [String])
  interests: string[];

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  latitude?: string;

  @Field({ nullable: true })
  longitude?: string;

  @Field()
  onboardingCompleted: boolean;
}

@ObjectType()
export class OnboardingStatus {
  @Field()
  hasName: boolean;

  @Field()
  hasBio: boolean;

  @Field()
  hasAge: boolean;

  @Field()
  hasGender: boolean;

  @Field()
  hasLookingFor: boolean;

  @Field()
  hasInterests: boolean;

  @Field()
  hasPhotos: boolean;

  @Field()
  hasLocation: boolean;

  @Field()
  isComplete: boolean;

  @Field(() => Int)
  photosCount: number;

  @Field(() => Int)
  interestsCount: number;
}
