import { Field, ObjectType, ID, Int, registerEnumType } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';
import { PhotoModel } from './photo.model';

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

export enum Purpose {
  DATING = 'dating',
  RELATIONSHIP = 'relationship',
  FRIENDSHIP = 'friendship',
  CHATTING = 'chatting',
  ADULT = 'adult',
}

registerEnumType(Gender, { name: 'Gender' });
registerEnumType(LookingFor, { name: 'LookingFor' });
registerEnumType(Purpose, {
  name: 'Purpose',
  description: 'What the user is looking for in the app',
});

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

  @Field(() => Purpose, { nullable: true })
  purpose?: Purpose;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  latitude?: string;

  @Field({ nullable: true })
  longitude?: string;

  @Field({ nullable: true })
  anyLocation?: boolean;

  @Field(() => [PhotoModel])
  photos: PhotoModel[];

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
