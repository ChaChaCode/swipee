import { Resolver, Mutation, Args, Query, ID, Int } from '@nestjs/graphql';
import { InteractionModel, InteractionType } from './models/interaction.model';
import { InteractionResultModel } from './models/interaction-result.model';
import { LikeReceivedModel } from './models/like-received.model';
import { SuperLikeReceivedModel } from './models/super-like-received.model';
import { InteractionsService } from './interactions.service';
import { CreateInteractionInput } from './dto/create-interaction.input';
import { MatchesService } from '../matches/matches.service';
import { toPhotoModels } from '../profiles/models/photo.model';

@Resolver(() => InteractionModel)
export class InteractionsResolver {
  constructor(
    private interactionsService: InteractionsService,
    private matchesService: MatchesService,
  ) {}

  @Mutation(() => InteractionResultModel)
  async createInteraction(
    @Args('fromUserId', { type: () => ID }) fromUserId: string,
    @Args('toUserId', { type: () => ID }) toUserId: string,
    @Args('type', { type: () => InteractionType }) type: InteractionType,
    @Args('message', { type: () => String, nullable: true }) message?: string,
  ): Promise<InteractionResultModel> {
    const input = { fromUserId, toUserId, type, message };
    const interaction = await this.interactionsService.create(input);

    let isMatch = false;
    let match = null;

    // Check for match (if like or super_like)
    const typeStr = String(type).toUpperCase();
    if (typeStr === 'LIKE' || typeStr === 'SUPER_LIKE') {
      const isMutual = await this.interactionsService.checkMutualLike(
        fromUserId,
        toUserId,
      );

      if (isMutual) {
        // Check if match already exists
        const existingMatch = await this.matchesService.findMatch(
          fromUserId,
          toUserId,
        );

        if (!existingMatch || !existingMatch.isActive) {
          match = await this.matchesService.create(
            fromUserId,
            toUserId,
          );
          isMatch = true;

          // Reset like counts for both directions
          await this.interactionsService.resetLikeCount(
            fromUserId,
            toUserId,
          );
          await this.interactionsService.resetLikeCount(
            toUserId,
            fromUserId,
          );
        }
      }
    }

    return {
      interaction,
      isMatch,
      match: match ?? undefined,
    };
  }

  @Query(() => [LikeReceivedModel])
  async likesReceived(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<LikeReceivedModel[]> {
    const likes = await this.interactionsService.getLikesReceived(userId);
    return likes.map((like) => ({
      ...like,
      fromUser: {
        ...like.fromUser,
        photos: toPhotoModels(like.fromUser.photos as string[]),
      },
    }));
  }

  @Query(() => [SuperLikeReceivedModel])
  async superLikesReceived(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<SuperLikeReceivedModel[]> {
    const superLikes = await this.interactionsService.getSuperLikesReceived(userId);
    return superLikes.map((superLike) => ({
      ...superLike,
      fromUser: {
        ...superLike.fromUser,
        photos: toPhotoModels(superLike.fromUser.photos as string[]),
      },
    }));
  }

  @Query(() => Int)
  async unreadSuperLikesCount(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<number> {
    return this.interactionsService.getUnreadSuperLikesCount(userId);
  }

  @Mutation(() => Boolean)
  async markSuperLikeAsRead(
    @Args('interactionId', { type: () => ID }) interactionId: string,
  ): Promise<boolean> {
    const result = await this.interactionsService.markAsRead(interactionId);
    return result !== null;
  }

  @Query(() => Boolean)
  async checkMutualLike(
    @Args('user1Id', { type: () => ID }) user1Id: string,
    @Args('user2Id', { type: () => ID }) user2Id: string,
  ): Promise<boolean> {
    return this.interactionsService.checkMutualLike(user1Id, user2Id);
  }
}
