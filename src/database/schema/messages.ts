import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { matches } from './matches';

export const messages = pgTable('messages', {
  id: text('id').primaryKey(), // cuid2
  matchId: text('match_id')
    .notNull()
    .references(() => matches.id, { onDelete: 'cascade' }),
  senderId: text('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
