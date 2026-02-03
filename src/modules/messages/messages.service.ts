import { Inject, Injectable } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.module';
import { messages, NewMessage } from '../../database/schema';

@Injectable()
export class MessagesService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async create(data: Omit<NewMessage, 'id'>) {
    const id = createId();
    const result = await this.db
      .insert(messages)
      .values({ ...data, id })
      .returning();
    return result[0];
  }

  async getMessagesByMatch(matchId: string, limit = 50, offset = 0) {
    return this.db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async markAsRead(messageId: string) {
    const result = await this.db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId))
      .returning();
    return result[0];
  }

  async markAllAsRead(matchId: string, userId: string) {
    await this.db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.matchId, matchId),
          eq(messages.isRead, false),
        ),
      );
  }

  async getUnreadCount(matchId: string, userId: string) {
    const result = await this.db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.matchId, matchId),
          eq(messages.isRead, false),
        ),
      );
    return result.filter((m) => m.senderId !== userId).length;
  }
}
