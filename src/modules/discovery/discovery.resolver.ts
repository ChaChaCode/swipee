import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { DiscoveryService } from './discovery.service';
import { DiscoveryProfile, DiscoveryResult } from './models/discovery.model';

@Resolver()
export class DiscoveryResolver {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Query(() => DiscoveryResult)
  async discover(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
    @Args('excludeIds', { type: () => [String], defaultValue: [] }) excludeIds: string[],
  ): Promise<DiscoveryResult> {
    const profiles = await this.discoveryService.getProfilesToDiscover({
      userId,
      limit: limit + 1, // Fetch one extra to check if there are more
      offset,
      excludeIds,
    });

    const hasMore = profiles.length > limit;
    const resultProfiles = hasMore ? profiles.slice(0, limit) : profiles;

    return {
      profiles: resultProfiles.map((p) => ({
        id: p.id,
        userId: p.userId,
        name: p.name ?? undefined,
        bio: p.bio ?? undefined,
        age: p.age ?? undefined,
        gender: p.gender as any,
        lookingFor: p.lookingFor as any,
        city: p.city ?? undefined,
        photos: (p.photos as string[]) || [],
        interests: (p.interests as string[]) || [],
        distance: p.distance !== null ? Math.round(Number(p.distance) * 10) / 10 : undefined,
      })),
      total: resultProfiles.length,
      hasMore,
    };
  }

  @Query(() => [DiscoveryProfile])
  async discoverProfiles(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
    @Args('excludeIds', { type: () => [String], defaultValue: [] }) excludeIds: string[],
  ): Promise<DiscoveryProfile[]> {
    const profiles = await this.discoveryService.getProfilesToDiscover({
      userId,
      limit,
      offset,
      excludeIds,
    });

    return profiles.map((p) => ({
      id: p.id,
      userId: p.userId,
      name: p.name ?? undefined,
      bio: p.bio ?? undefined,
      age: p.age ?? undefined,
      gender: p.gender as any,
      lookingFor: p.lookingFor as any,
      city: p.city ?? undefined,
      photos: (p.photos as string[]) || [],
      interests: (p.interests as string[]) || [],
      distance: p.distance !== null ? Math.round(Number(p.distance) * 10) / 10 : undefined,
    }));
  }

  @Query(() => Int)
  async discoveryCount(@Args('userId') userId: string): Promise<number> {
    return this.discoveryService.getDiscoveryCount(userId);
  }

  @Mutation(() => Boolean)
  async resetDiscovery(@Args('userId') userId: string): Promise<boolean> {
    this.discoveryService.resetShownProfiles(userId);
    return true;
  }
}
