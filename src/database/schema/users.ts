import {
  pgTable,
  text,
  timestamp,
  bigint,
  boolean,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // cuid2
  telegramId: bigint('telegram_id', { mode: 'number' }).notNull().unique(),
  username: text('username'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  languageCode: text('language_code').default('en'),
  isPremium: boolean('is_premium').default(false),
  isBot: boolean('is_bot').default(false),
  isActive: boolean('is_active').default(true),
  lastActiveAt: timestamp('last_active_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
