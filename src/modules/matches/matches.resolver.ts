import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { MatchModel } from './models/match.model';
import { MatchesService } from './matches.service';

@Resolver(() => MatchModel)
export class MatchesResolver {
  constructor(private matchesService: MatchesService) {}

  @Query(() => [MatchModel])
  async matchesByUser(@Args('userId', { type: () => ID }) userId: string) {
    return this.matchesService.getMatchesByUser(userId);
  }

  @Query(() => MatchModel, { nullable: true })
  async match(
    @Args('user1Id', { type: () => ID }) user1Id: string,
    @Args('user2Id', { type: () => ID }) user2Id: string,
  ) {
    return this.matchesService.findMatch(user1Id, user2Id);
  }

  @Mutation(() => MatchModel, { nullable: true })
  async unmatch(@Args('matchId', { type: () => ID }) matchId: string) {
    return this.matchesService.unmatch(matchId);
  }
}
