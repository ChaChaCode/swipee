import { Field, ObjectType, Int } from '@nestjs/graphql';
import { ProfileModel } from '../../profiles/models/profile.model';

@ObjectType()
export class UndoResultModel {
  @Field(() => ProfileModel)
  profile: ProfileModel;

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
