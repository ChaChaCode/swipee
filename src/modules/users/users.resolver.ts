import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UserModel } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => UserModel, { nullable: true })
  async user(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findById(id);
  }

  @Query(() => UserModel, { nullable: true })
  async userByTelegramId(@Args('telegramId') telegramId: number) {
    return this.usersService.findByTelegramId(telegramId);
  }
}
