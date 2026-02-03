import { InputType, Field, ID } from '@nestjs/graphql';
import { InteractionType } from '../models/interaction.model';

@InputType()
export class CreateInteractionInput {
  @Field(() => ID)
  fromUserId: string;

  @Field(() => ID)
  toUserId: string;

  @Field(() => InteractionType)
  type: InteractionType;

  @Field({ nullable: true })
  message?: string;
}
