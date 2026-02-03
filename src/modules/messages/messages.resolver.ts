import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { MessageModel } from './models/message.model';
import { MessagesService } from './messages.service';
import { SendMessageInput } from './dto/send-message.input';

@Resolver(() => MessageModel)
export class MessagesResolver {
  constructor(private messagesService: MessagesService) {}

  @Query(() => [MessageModel])
  async messagesByMatch(
    @Args('matchId', { type: () => ID }) matchId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ) {
    return this.messagesService.getMessagesByMatch(matchId, limit, offset);
  }

  @Mutation(() => MessageModel)
  async sendMessage(@Args('input') input: SendMessageInput) {
    return this.messagesService.create(input);
  }

  @Mutation(() => MessageModel, { nullable: true })
  async markMessageAsRead(
    @Args('messageId', { type: () => ID }) messageId: string,
  ) {
    return this.messagesService.markAsRead(messageId);
  }

  @Mutation(() => Boolean)
  async markAllMessagesAsRead(
    @Args('matchId', { type: () => ID }) matchId: string,
    @Args('userId', { type: () => ID }) userId: string,
  ) {
    await this.messagesService.markAllAsRead(matchId, userId);
    return true;
  }

  @Query(() => Int)
  async unreadMessagesCount(
    @Args('matchId', { type: () => ID }) matchId: string,
    @Args('userId', { type: () => ID }) userId: string,
  ) {
    return this.messagesService.getUnreadCount(matchId, userId);
  }
}
