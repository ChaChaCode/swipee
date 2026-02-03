import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { ProfileModel } from '../../profiles/models/profile.model';

@ObjectType()
export class LikeReceivedModel {
  @Field(() => ID)
  id: string;

  @Field(() => ProfileModel)
  fromUser: ProfileModel;

  @Field(() => Int)
  likeCount: number;

  @Field()
  createdAt: Date;
}
