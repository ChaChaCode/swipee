import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ne, notInArray, sql, gte, lte, or, isNull, SQL } from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.module';
import { profiles, swipes } from '../../database/schema';

export interface DiscoveryFilters {
  userId: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class DiscoveryService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async getProfilesToDiscover(filters: DiscoveryFilters) {
    const { userId, limit = 10, offset = 0 } = filters;

    // Get current user's profile with preferences
    const currentProfile = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!currentProfile[0]) {
      return [];
    }

    const myProfile = currentProfile[0];

    // Get IDs of users already swiped by current user
    const swipedUsers = await this.db
      .select({ swipedId: swipes.swipedId })
      .from(swipes)
      .where(eq(swipes.swiperId, userId));

    const swipedUserIds = swipedUsers.map((s) => s.swipedId);

    // Build conditions
    const conditions: SQL[] = [
      // Exclude self
      ne(profiles.userId, userId),
      // Only completed profiles
      eq(profiles.onboardingCompleted, true),
      // Only visible profiles
      eq(profiles.isVisible, true),
    ];

    // Exclude already swiped users
    if (swipedUserIds.length > 0) {
      conditions.push(notInArray(profiles.userId, swipedUserIds));
    }

    // Filter by gender preference (what I'm looking for)
    if (myProfile.lookingFor && myProfile.lookingFor !== 'both') {
      conditions.push(eq(profiles.gender, myProfile.lookingFor));
    }

    // Filter by their lookingFor preference (they should be looking for my gender or both)
    if (myProfile.gender) {
      // Map gender to lookingFor compatible value
      const myGenderForLookingFor = myProfile.gender === 'other' ? 'both' : myProfile.gender;
      conditions.push(
        or(
          eq(profiles.lookingFor, myGenderForLookingFor as 'male' | 'female' | 'both'),
          eq(profiles.lookingFor, 'both'),
          isNull(profiles.lookingFor),
        )!,
      );
    }

    // Filter by age range (my preferences)
    if (myProfile.minAge) {
      conditions.push(
        or(gte(profiles.age, myProfile.minAge), isNull(profiles.age))!,
      );
    }
    if (myProfile.maxAge) {
      conditions.push(
        or(lte(profiles.age, myProfile.maxAge), isNull(profiles.age))!,
      );
    }

    // Build base query
    const baseCondition = and(...conditions);

    // If both users have location, calculate distance
    if (myProfile.latitude && myProfile.longitude) {
      const lat = parseFloat(myProfile.latitude);
      const lon = parseFloat(myProfile.longitude);

      // Calculate distance using Haversine formula
      const distanceExpr = sql<number>`(
        6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(${lat})) *
            cos(radians(CAST(${profiles.latitude} AS DOUBLE PRECISION))) *
            cos(radians(CAST(${profiles.longitude} AS DOUBLE PRECISION)) - radians(${lon})) +
            sin(radians(${lat})) *
            sin(radians(CAST(${profiles.latitude} AS DOUBLE PRECISION)))
          ))
        )
      )`;

      // Add distance filter if maxDistance is set
      let finalCondition = baseCondition;
      if (myProfile.maxDistance) {
        finalCondition = and(
          baseCondition,
          or(
            sql`${distanceExpr} <= ${myProfile.maxDistance}`,
            isNull(profiles.latitude),
          ),
        );
      }

      const results = await this.db
        .select({
          profile: profiles,
          distance: distanceExpr,
        })
        .from(profiles)
        .where(finalCondition)
        .orderBy(sql`${distanceExpr} ASC NULLS LAST`)
        .limit(limit)
        .offset(offset);

      return results.map((r) => ({
        ...r.profile,
        distance: r.distance as number | null,
      }));
    }

    // No location - just return profiles without distance
    const results = await this.db
      .select()
      .from(profiles)
      .where(baseCondition)
      .limit(limit)
      .offset(offset);

    return results.map((r) => ({
      ...r,
      distance: null as number | null,
    }));
  }

  async getDiscoveryCount(userId: string): Promise<number> {
    const profiles = await this.getProfilesToDiscover({
      userId,
      limit: 1000,
    });
    return profiles.length;
  }
}
