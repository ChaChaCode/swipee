import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.module';
import { users, NewUser } from '../../database/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByTelegramId(telegramId: number) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: Omit<NewUser, 'id'>) {
    const id = createId();
    const result = await this.db
      .insert(users)
      .values({ ...data, id })
      .returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewUser>) {
    const result = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async findOrCreate(telegramData: {
    telegramId: number;
    username?: string;
    firstName: string;
    lastName?: string;
    languageCode?: string;
    isPremium?: boolean;
  }) {
    const existing = await this.findByTelegramId(telegramData.telegramId);
    if (existing) {
      return this.update(existing.id, {
        ...telegramData,
        lastActiveAt: new Date(),
      });
    }
    return this.create(telegramData);
  }
}
