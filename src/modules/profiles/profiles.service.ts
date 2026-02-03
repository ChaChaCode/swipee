import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { DRIZZLE } from '../../database/database.module';
import type { Database } from '../../database/database.module';
import { profiles, NewProfile } from '../../database/schema';

@Injectable()
export class ProfilesService {
  constructor(@Inject(DRIZZLE) private db: Database) {}

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }

  async create(userId: string, data?: Partial<Omit<NewProfile, 'id' | 'userId'>>) {
    const id = createId();
    const result = await this.db
      .insert(profiles)
      .values({ id, userId, ...data })
      .returning();
    return result[0];
  }

  async update(id: string, data: Partial<NewProfile>) {
    const result = await this.db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return result[0];
  }

  async updateByUserId(userId: string, data: Partial<NewProfile>) {
    const result = await this.db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async findOrCreate(userId: string) {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;
    return this.create(userId);
  }

  async delete(id: string) {
    const result = await this.db
      .delete(profiles)
      .where(eq(profiles.id, id))
      .returning();
    return result[0] ?? null;
  }

  async deleteByUserId(userId: string) {
    const result = await this.db
      .delete(profiles)
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0] ?? null;
  }
}
