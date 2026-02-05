import { Resolver, Query, Args } from '@nestjs/graphql';
import { Field, ObjectType } from '@nestjs/graphql';
import { GeocodingService } from './geocoding.service';

@ObjectType()
export class GeocodingResult {
  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  displayName?: string;
}

@Resolver()
export class GeocodingResolver {
  constructor(private geocodingService: GeocodingService) {}

  @Query(() => GeocodingResult)
  async getCityFromCoordinates(
    @Args('latitude') latitude: string,
    @Args('longitude') longitude: string,
  ): Promise<GeocodingResult> {
    const result = await this.geocodingService.getCityFromCoordinates(
      latitude,
      longitude,
    );
    return {
      city: result.city ?? undefined,
      region: result.region ?? undefined,
      country: result.country ?? undefined,
      displayName: result.displayName ?? undefined,
    };
  }
}
