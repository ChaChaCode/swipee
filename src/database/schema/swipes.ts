import { pgTable, text, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

export const swipeTypeEnum = pgEnum('swipe_type', ['like', 'dislike', 'super']);

export const swipes = pgTable(
  'swipes',
  {
    id: text('id').primaryKey(), // cuid2
    swiperId: text('swiper_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    swipedId: text('swiped_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: swipeTypeEnum('type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [unique().on(table.swiperId, table.swipedId)],
);

export type Swipe = typeof swipes.$inferSelect;
export type NewSwipe = typeof swipes.$inferInsert;
