import { Inject, Injectable } from '@nestjs/common';
import { or, and, eq, gte } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.module';
import { matches, users } from '../../database/schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MatchesService {
  constructor(
    @Inject(DRIZZLE) private db: Database,
    private notificationsService: NotificationsService,
  ) {}

  async create(user1Id: string, user2Id: string) {
    // Ensure consistent ordering
    const [first, second] = [user1Id, user2Id].sort();
    const id = createId();

    // Hidden until 2 days from now
    const hiddenUntil = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    const result = await this.db
      .insert(matches)
      .values({
        id,
        user1Id: first,
        user2Id: second,
        hiddenUntil,
        user1Notified: false,
        user2Notified: false,
      })
      .onConflictDoUpdate({
        target: [matches.user1Id, matches.user2Id],
        set: {
          isActive: true,
          hiddenUntil,
          user1Notified: false,
          user2Notified: false,
          updatedAt: new Date(),
        },
      })
      .returning();

    const match = result[0] ?? (await this.findMatch(user1Id, user2Id));

    if (match) {
      // Send notifications to both users
      await this.sendMatchNotifications(match);
    }

    // Return match with telegram usernames
    return this.getMatchWithTelegramInfo(match!.id);
  }

  private async sendMatchNotifications(match: {
    id: string;
    user1Id: string;
    user2Id: string;
  }) {
    // Get both users
    const [user1, user2] = await Promise.all([
      this.db
        .select()
        .from(users)
        .where(eq(users.id, match.user1Id))
        .limit(1)
        .then((r) => r[0]),
      this.db
        .select()
        .from(users)
        .where(eq(users.id, match.user2Id))
        .limit(1)
        .then((r) => r[0]),
    ]);

    if (!user1 || !user2) return;

    // Send notification to user1 about user2
    const user1Notified = await this.notificationsService.sendMatchNotification(
      {
        recipientTelegramId: Number(user1.telegramId),
        matchedUserName: user2.firstName,
        matchedUserUsername: user2.username ?? undefined,
      },
    );

    // Send notification to user2 about user1
    const user2Notified = await this.notificationsService.sendMatchNotification(
      {
        recipientTelegramId: Number(user2.telegramId),
        matchedUserName: user1.firstName,
        matchedUserUsername: user1.username ?? undefined,
      },
    );

    // Update notification status
    await this.db
      .update(matches)
      .set({
        user1Notified,
        user2Notified,
        updatedAt: new Date(),
      })
      .where(eq(matches.id, match.id));
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

  async getMatchWithTelegramInfo(matchId: string) {
    const match = await this.db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1)
      .then((r) => r[0]);

    if (!match) return null;

    const [user1, user2] = await Promise.all([
      this.db
        .select()
        .from(users)
        .where(eq(users.id, match.user1Id))
        .limit(1)
        .then((r) => r[0]),
      this.db
        .select()
        .from(users)
        .where(eq(users.id, match.user2Id))
        .limit(1)
        .then((r) => r[0]),
    ]);

    return {
      ...match,
      isActive: match.isActive ?? true,
      user1Notified: match.user1Notified ?? false,
      user2Notified: match.user2Notified ?? false,
      hiddenUntil: match.hiddenUntil ?? undefined,
      user1TelegramUsername: user1?.username ?? undefined,
      user2TelegramUsername: user2?.username ?? undefined,
    };
  }

  async getMatchesByUser(userId: string) {
    const matchList = await this.db
      .select()
      .from(matches)
      .where(
        and(
          or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
          eq(matches.isActive, true),
        ),
      );

    // Add telegram usernames to each match
    return Promise.all(
      matchList.map(async (match) => {
        const [user1, user2] = await Promise.all([
          this.db
            .select()
            .from(users)
            .where(eq(users.id, match.user1Id))
            .limit(1)
            .then((r) => r[0]),
          this.db
            .select()
            .from(users)
            .where(eq(users.id, match.user2Id))
            .limit(1)
            .then((r) => r[0]),
        ]);

        return {
          ...match,
          isActive: match.isActive ?? true,
          user1Notified: match.user1Notified ?? false,
          user2Notified: match.user2Notified ?? false,
          hiddenUntil: match.hiddenUntil ?? undefined,
          user1TelegramUsername: user1?.username ?? undefined,
          user2TelegramUsername: user2?.username ?? undefined,
        };
      }),
    );
  }

  async unmatch(matchId: string) {
    const result = await this.db
      .update(matches)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(matches.id, matchId))
      .returning();

    const match = result[0];
    if (!match) return null;

    return {
      ...match,
      isActive: match.isActive ?? false,
      user1Notified: match.user1Notified ?? false,
      user2Notified: match.user2Notified ?? false,
      hiddenUntil: match.hiddenUntil ?? undefined,
    };
  }

  async getActiveMatchesForDiscovery(userId: string) {
    const now = new Date();
    return this.db
      .select()
      .from(matches)
      .where(
        and(
          or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
          or(eq(matches.isActive, true), gte(matches.hiddenUntil, now)),
        ),
      );
  }
}
