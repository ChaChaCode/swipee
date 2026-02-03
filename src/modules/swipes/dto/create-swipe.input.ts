import { Field, InputType, ID } from '@nestjs/graphql';
import { SwipeType } from '../models/swipe.model';

@InputType()
export class CreateSwipeInput {
  @Field(() => ID)
  swiperId: string;

  @Field(() => ID)
  swipedId: string;

  @Field(() => SwipeType)
  type: SwipeType;
}
