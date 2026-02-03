import { pgTable, text, timestamp, boolean, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

export const matches = pgTable(
  'matches',
  {
    id: text('id').primaryKey(), // cuid2
    user1Id: text('user1_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    user2Id: text('user2_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [unique().on(table.user1Id, table.user2Id)],
);

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
