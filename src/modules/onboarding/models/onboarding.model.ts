import { Field, ObjectType, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum LookingFor {
  MALE = 'male',
  FEMALE = 'female',
  BOTH = 'both',
}

registerEnumType(Gender, { name: 'Gender' });
registerEnumType(LookingFor, { name: 'LookingFor' });

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

  @Field(() => [String])
  photos: string[];

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
