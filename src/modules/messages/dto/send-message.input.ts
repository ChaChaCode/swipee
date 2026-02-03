import { Field, InputType, ID } from '@nestjs/graphql';

@InputType()
export class SendMessageInput {
  @Field(() => ID)
  matchId: string;

  @Field(() => ID)
  senderId: string;

  @Field()
  content: string;
}
