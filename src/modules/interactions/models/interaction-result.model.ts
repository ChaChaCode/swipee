import { Field, ObjectType } from '@nestjs/graphql';
import { InteractionModel } from './interaction.model';
import { MatchModel } from '../../matches/models/match.model';

@ObjectType()
export class InteractionResultModel {
  @Field(() => InteractionModel)
  interaction: InteractionModel;

  @Field()
  isMatch: boolean;

  @Field(() => MatchModel, { nullable: true })
  match?: MatchModel;
}
