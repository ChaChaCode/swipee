import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  telegramId: number;

  @Field({ nullable: true })
  username?: string;

  @Field()
  firstName: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  languageCode?: string;

  @Field()
  isPremium: boolean;

  @Field()
  isActive: boolean;

  @Field()
  lastActiveAt: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
