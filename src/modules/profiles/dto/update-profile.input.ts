import { Field, InputType, Int } from '@nestjs/graphql';
import { Gender, LookingFor, Purpose } from '../models/profile.model';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => Int, { nullable: true })
  age?: number;

  @Field({ nullable: true })
  birthDate?: Date;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field(() => LookingFor, { nullable: true })
  lookingFor?: LookingFor;

  @Field(() => Purpose, { nullable: true })
  purpose?: Purpose;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  latitude?: string;

  @Field({ nullable: true })
  longitude?: string;

  @Field(() => [String], { nullable: true })
  photos?: string[];

  @Field(() => [String], { nullable: true })
  interests?: string[];

  @Field(() => Int, { nullable: true })
  minAge?: number;

  @Field(() => Int, { nullable: true })
  maxAge?: number;

  @Field(() => Int, { nullable: true })
  maxDistance?: number;
}
