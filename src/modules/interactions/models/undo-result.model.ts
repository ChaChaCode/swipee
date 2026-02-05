import { Field, ObjectType, Int } from '@nestjs/graphql';
import { DiscoveryProfile } from '../../discovery/models/discovery.model';

@ObjectType()
export class UndoResultModel {
  @Field(() => DiscoveryProfile)
  profile: DiscoveryProfile;

  @Field(() => Int, { description: 'Remaining undo uses today (-1 for premium = unlimited)' })
  remaining: number;
}

@ObjectType()
export class UndoStatusModel {
  @Field()
  canUndo: boolean;

  @Field(() => Int, { description: 'Remaining undo uses today (-1 for premium = unlimited)' })
  remaining: number;

  @Field()
  isPremium: boolean;
}
