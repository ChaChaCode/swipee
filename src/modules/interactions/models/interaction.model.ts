import { Field, ObjectType, ID, registerEnumType, Int } from '@nestjs/graphql';

export enum InteractionType {
  LIKE = 'like',
  SUPER_LIKE = 'super_like',
  SKIP = 'skip',
}

registerEnumType(InteractionType, { name: 'InteractionType' });

@ObjectType()
export class InteractionModel {
  @Field(() => ID)
  id: string;

  @Field()
  fromUserId: string;

  @Field()
  toUserId: string;

  @Field(() => InteractionType)
  type: InteractionType;

  @Field({ nullable: true })
  message?: string;

  @Field()
  isRead: boolean;

  @Field(() => Int)
  likeCount: number;

  @Field()
  createdAt: Date;

  @Field()
  expiresAt: Date;
}
