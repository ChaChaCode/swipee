import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.module';
import { swipes, NewSwipe } from '../../database/schema';

@Injectable()
export class SwipesService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async create(data: Omit<NewSwipe, 'id'>) {
    const id = createId();
    const result = await this.db
      .insert(swipes)
      .values({ ...data, id })
      .onConflictDoUpdate({
        target: [swipes.swiperId, swipes.swipedId],
        set: { type: data.type },
      })
      .returning();
    return result[0];
  }

  async findSwipe(swiperId: string, swipedId: string) {
    const result = await this.db
      .select()
      .from(swipes)
      .where(and(eq(swipes.swiperId, swiperId), eq(swipes.swipedId, swipedId)))
      .limit(1);
    return result[0] ?? null;
  }

  async checkMutualLike(user1Id: string, user2Id: string): Promise<boolean> {
    const swipe1 = await this.findSwipe(user1Id, user2Id);
    const swipe2 = await this.findSwipe(user2Id, user1Id);

    return (
      swipe1 !== null &&
      swipe2 !== null &&
      (swipe1.type === 'like' || swipe1.type === 'super') &&
      (swipe2.type === 'like' || swipe2.type === 'super')
    );
  }

  async getSwipesByUser(userId: string) {
    return this.db.select().from(swipes).where(eq(swipes.swiperId, userId));
  }
}
