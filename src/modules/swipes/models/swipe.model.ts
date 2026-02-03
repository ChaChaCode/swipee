import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { UserModel } from '../../users/models/user.model';

export enum SwipeType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  SUPER = 'super',
}

registerEnumType(SwipeType, { name: 'SwipeType' });

@ObjectType()
export class SwipeModel {
  @Field(() => ID)
  id: string;

  @Field()
  swiperId: string;

  @Field(() => UserModel, { nullable: true })
  swiper?: UserModel;

  @Field()
  swipedId: string;

  @Field(() => UserModel, { nullable: true })
  swiped?: UserModel;

  @Field(() => SwipeType)
  type: SwipeType;

  @Field()
  createdAt: Date;
}
