import { Resolver, Mutation, Args, Query, ID } from '@nestjs/graphql';
import { SwipeModel } from './models/swipe.model';
import { SwipesService } from './swipes.service';
import { CreateSwipeInput } from './dto/create-swipe.input';
import { MatchesService } from '../matches/matches.service';
import { MatchModel } from '../matches/models/match.model';

@Resolver(() => SwipeModel)
export class SwipesResolver {
  constructor(
    private swipesService: SwipesService,
    private matchesService: MatchesService,
  ) {}

  @Mutation(() => SwipeModel)
  async createSwipe(@Args('input') input: CreateSwipeInput) {
    const swipe = await this.swipesService.create(input);

    // Check for mutual like and create match
    if (input.type === 'like' || input.type === 'super') {
      const isMutual = await this.swipesService.checkMutualLike(
        input.swiperId,
        input.swipedId,
      );

      if (isMutual) {
        await this.matchesService.create(input.swiperId, input.swipedId);
      }
    }

    return swipe;
  }

  @Query(() => [SwipeModel])
  async swipesByUser(@Args('userId', { type: () => ID }) userId: string) {
    return this.swipesService.getSwipesByUser(userId);
  }
}

@Resolver(() => MatchModel)
export class SwipeResultResolver {
  constructor(private swipesService: SwipesService) {}

  @Query(() => Boolean)
  async checkMutualLike(
    @Args('user1Id', { type: () => ID }) user1Id: string,
    @Args('user2Id', { type: () => ID }) user2Id: string,
  ) {
    return this.swipesService.checkMutualLike(user1Id, user2Id);
  }
}
