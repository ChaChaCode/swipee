import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const interactionTypeEnum = pgEnum('interaction_type', [
  'like',
  'super_like',
  'skip',
]);

export const interactions = pgTable(
  'interactions',
  {
    id: text('id').primaryKey(), // cuid2
    fromUserId: text('from_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    toUserId: text('to_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: interactionTypeEnum('type').notNull(),
    message: text('message'), // Only for super_like
    isRead: boolean('is_read').default(false), // For super_like messages
    likeCount: integer('like_count').default(1).notNull(), // Times liked without reciprocation
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(), // When can show in feed again / like again
  },
  (table) => [
    unique().on(table.fromUserId, table.toUserId),
    index('idx_interactions_to_user').on(table.toUserId),
    index('idx_interactions_expires_at').on(table.expiresAt),
  ],
);

export type Interaction = typeof interactions.$inferSelect;
export type NewInteraction = typeof interactions.$inferInsert;
