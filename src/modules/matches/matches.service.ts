import { Inject, Injectable } from '@nestjs/common';
import { or, and, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.module';
import { matches } from '../../database/schema';

@Injectable()
export class MatchesService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async create(user1Id: string, user2Id: string) {
    // Ensure consistent ordering
    const [first, second] = [user1Id, user2Id].sort();
    const id = createId();

    const result = await this.db
      .insert(matches)
      .values({ id, user1Id: first, user2Id: second })
      .onConflictDoNothing()
      .returning();

    return result[0] ?? this.findMatch(user1Id, user2Id);
  }

  async findMatch(user1Id: string, user2Id: string) {
    const result = await this.db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.user1Id, user1Id), eq(matches.user2Id, user2Id)),
          and(eq(matches.user1Id, user2Id), eq(matches.user2Id, user1Id)),
        ),
      )
      .limit(1);
    return result[0] ?? null;
  }

  async getMatchesByUser(userId: string) {
    return this.db
      .select()
      .from(matches)
      .where(
        and(
          or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
          eq(matches.isActive, true),
        ),
      );
  }

  async unmatch(matchId: string) {
    const result = await this.db
      .update(matches)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(matches.id, matchId))
      .returning();
    return result[0];
  }
}
