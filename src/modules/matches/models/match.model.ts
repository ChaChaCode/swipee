import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';

@ObjectType()
export class MatchModel {
  @Field(() => ID)
  id: string;

  @Field()
  user1Id: string;

  @Field(() => UserModel, { nullable: true })
  user1?: UserModel;

  @Field()
  user2Id: string;

  @Field(() => UserModel, { nullable: true })
  user2?: UserModel;

  @Field()
  isActive: boolean;

  @Field()
  user1Notified: boolean;

  @Field()
  user2Notified: boolean;

  @Field({ nullable: true })
  hiddenUntil?: Date;

  @Field({ nullable: true })
  user1TelegramUsername?: string;

  @Field({ nullable: true })
  user2TelegramUsername?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
