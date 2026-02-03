import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './models/auth.model';
import { UserModel } from '../users/models/user.model';
import { UnauthorizedException } from '@nestjs/common';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async auth(@Args('initData') initData: string): Promise<AuthPayload> {
    const result = await this.authService.authenticateWithInitData(initData);

    return {
      user: result.user as UserModel,
      profile: result.profile as any,
      isNewUser: result.isNewUser,
    };
  }

  @Mutation(() => AuthPayload, { description: 'Auth without validation (dev only)' })
  async authDev(@Args('initData') initData: string): Promise<AuthPayload> {
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Not available in production');
    }

    const result = await this.authService.authenticateUnsafe(initData);

    if (!result) {
      throw new UnauthorizedException('Invalid initData');
    }

    return {
      user: result.user as UserModel,
      profile: result.profile as any,
      isNewUser: result.isNewUser,
    };
  }

  @Query(() => UserModel, { nullable: true })
  async me(@Context() context: { req: { headers: { authorization?: string } } }) {
    const authHeader = context.req.headers.authorization;

    if (!authHeader) {
      return null;
    }

    // Extract initData from Authorization header
    // Format: "tma <initData>"
    const [type, initData] = authHeader.split(' ');

    if (type !== 'tma' || !initData) {
      return null;
    }

    try {
      const result = await this.authService.authenticateWithInitData(initData);
      return result.user;
    } catch {
      return null;
    }
  }
}
