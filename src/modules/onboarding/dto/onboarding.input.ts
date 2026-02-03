import { Field, InputType, Int } from '@nestjs/graphql';
import { Gender, LookingFor } from '../models/onboarding.model';

@InputType()
export class SetNameInput {
  @Field()
  name: string;
}

@InputType()
export class SetBioInput {
  @Field()
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
}

@InputType()
export class SetAgeInput {
  @Field(() => Int)
  age: number;
}

@InputType()
export class CompleteOnboardingInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => Int)
  age: number;

  @Field(() => Gender)
  gender: Gender;

  @Field(() => LookingFor)
  lookingFor: LookingFor;

  @Field(() => [String])
  interestIds: string[];

  @Field(() => [String])
  photoUrls: string[];

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  latitude?: string;

  @Field({ nullable: true })
  longitude?: string;
}
