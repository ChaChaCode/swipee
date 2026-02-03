import { Field, ObjectType, ID, Int, registerEnumType } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';

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
export class ProfileModel {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => UserModel, { nullable: true })
  user?: UserModel;

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

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  latitude?: string;

  @Field({ nullable: true })
  longitude?: string;

  @Field(() => [String])
  photos: string[];

  @Field(() => [String])
  interests: string[];

  @Field(() => Int)
  minAge: number;

  @Field(() => Int)
  maxAge: number;

  @Field(() => Int)
  maxDistance: number;

  @Field()
  isVisible: boolean;

  @Field()
  onboardingCompleted: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
