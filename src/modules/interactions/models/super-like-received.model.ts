import { Field, ObjectType, ID } from '@nestjs/graphql';
import { ProfileModel } from '../../profiles/models/profile.model';

@ObjectType()
export class SuperLikeReceivedModel {
  @Field(() => ID)
  id: string;

  @Field(() => ProfileModel)
  fromUser: ProfileModel;

  @Field()
  message: string;

  @Field()
  isRead: boolean;

  @Field()
  createdAt: Date;
}
