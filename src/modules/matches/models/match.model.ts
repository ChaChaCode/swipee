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
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
