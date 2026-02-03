import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';

@ObjectType()
export class MessageModel {
  @Field(() => ID)
  id: string;

  @Field()
  matchId: string;

  @Field()
  senderId: string;

  @Field(() => UserModel, { nullable: true })
  sender?: UserModel;

  @Field()
  content: string;

  @Field()
  isRead: boolean;

  @Field()
  createdAt: Date;
}
