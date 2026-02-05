import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  eq,
  ne,
  notInArray,
  sql,
  gte,
  lte,
  or,
  isNull,
  SQL,
} from 'drizzle-orm';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.module';
import { profiles, interactions, matches } from '../../database/schema';
import { getMinBirthDateForAge, getMaxBirthDateForAge } from '../../common/utils/age.utils';

export interface DiscoveryFilters {
  userId: string;
  limit?: number;
  offset?: number;
  excludeIds?: string[];
}

@Injectable()
export class DiscoveryService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async getProfilesToDiscover(filters: DiscoveryFilters) {
    const { userId, limit = 10, offset = 0, excludeIds = [] } = filters;
    const now = new Date();

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

    // Get IDs of users with active interactions (expiresAt not yet passed)
    const interactedUsers = await this.db
      .select({ toUserId: interactions.toUserId })
      .from(interactions)
      .where(
        and(
          eq(interactions.fromUserId, userId),
          gte(interactions.expiresAt, now),
        ),
      );

    const interactedUserIds = interactedUsers.map((i) => i.toUserId);

    // Get IDs of users with active matches or within hiddenUntil period
    const matchedUsers = await this.db
      .select()
      .from(matches)
      .where(
        and(
          or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
          or(eq(matches.isActive, true), gte(matches.hiddenUntil, now)),
        ),
      );

    const matchedUserIds = matchedUsers.map((m) =>
      m.user1Id === userId ? m.user2Id : m.user1Id,
    );

    // Combine all excluded user IDs
    const excludedUserIds = [...new Set([...interactedUserIds, ...matchedUserIds])];

    // Build conditions
    const conditions: SQL[] = [
      // Exclude self
      ne(profiles.userId, userId),
      // Only completed profiles
      eq(profiles.onboardingCompleted, true),
      // Only visible profiles
      eq(profiles.isVisible, true),
    ];

    // Exclude already interacted and matched users
    if (excludedUserIds.length > 0) {
      conditions.push(notInArray(profiles.userId, excludedUserIds));
    }

    // Exclude profiles by ID (passed from frontend)
    if (excludeIds.length > 0) {
      conditions.push(notInArray(profiles.id, excludeIds));
    }


    // Filter by gender preference (what I'm looking for)
    if (myProfile.lookingFor && myProfile.lookingFor !== 'both') {
      conditions.push(eq(profiles.gender, myProfile.lookingFor));
    }

    // Filter by their lookingFor preference (they should be looking for my gender or both)
    if (myProfile.gender) {
      // Map gender to lookingFor compatible value
      const myGenderForLookingFor =
        myProfile.gender === 'other' ? 'both' : myProfile.gender;
      conditions.push(
        or(
          eq(
            profiles.lookingFor,
            myGenderForLookingFor as 'male' | 'female' | 'both',
          ),
          eq(profiles.lookingFor, 'both'),
          isNull(profiles.lookingFor),
        )!,
      );
    }

    // Filter by age range (my preferences) using birthDate
    // minAge means we want people at least this old (birthDate <= maxBirthDate)
    if (myProfile.minAge) {
      const maxBirthDate = getMaxBirthDateForAge(myProfile.minAge);
      conditions.push(
        or(lte(profiles.birthDate, maxBirthDate), isNull(profiles.birthDate))!,
      );
    }
    // maxAge means we want people at most this old (birthDate >= minBirthDate)
    if (myProfile.maxAge) {
      const minBirthDate = getMinBirthDateForAge(myProfile.maxAge);
      conditions.push(
        or(gte(profiles.birthDate, minBirthDate), isNull(profiles.birthDate))!,
      );
    }

    // Build base query
    const baseCondition = and(...conditions);

    // Check if user wants profiles from anywhere (anyLocation = true OR no location set)
    const showFromAnywhere = myProfile.anyLocation || (!myProfile.city && !myProfile.latitude && !myProfile.longitude);

    // If showing from anywhere - skip location filtering
    if (showFromAnywhere) {
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
    const profilesList = await this.getProfilesToDiscover({
      userId,
      limit: 1000,
    });
    return profilesList.length;
  }
}
