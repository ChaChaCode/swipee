import { Field, InputType, Int } from '@nestjs/graphql';
import { Min, Max, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Gender, LookingFor } from '../models/onboarding.model';

@InputType()
export class SetNameInput {
  @Field()
  @MinLength(1)
  @MaxLength(50)
  name: string;
}

@InputType()
export class SetBioInput {
  @Field()
  @MaxLength(500)
  bio: string;
}

@InputType()
export class SetGenderInput {
  @Field(() => Gender)
  gender: Gender;
}

@InputType()
export class SetLookingForInput {
  @Field(() => LookingFor)
  lookingFor: LookingFor;
}

@InputType()
export class SetInterestsInput {
  @Field(() => [String])
  interestIds: string[];
}

@InputType()
export class SetPhotosInput {
  @Field(() => [String])
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  photoUrls: string[];
}

@InputType()
export class SetLocationInput {
  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  latitude?: string;

  @Field({ nullable: true })
  longitude?: string;

  @Field({ nullable: true })
  anyLocation?: boolean; // true = show profiles from anywhere
}

@InputType()
export class SetAgeInput {
  @Field(() => Int)
  @Min(16)
  @Max(120)
  age: number;
}

@InputType()
export class CompleteOnboardingInput {
  @Field()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @Field({ nullable: true })
  @MaxLength(500)
  bio?: string;

  @Field(() => Int)
  @Min(16)
  @Max(120)
  age: number;

  @Field(() => Gender)
  gender: Gender;

  @Field(() => LookingFor)
  lookingFor: LookingFor;

  @Field(() => [String])
  interestIds: string[];

  @Field(() => [String])
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  photoUrls: string[];

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  latitude?: string;

  @Field({ nullable: true })
  longitude?: string;

  @Field({ nullable: true })
  anyLocation?: boolean; // true = show profiles from anywhere
}
