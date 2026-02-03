import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Predefined interests/tags
export const interests = pgTable('interests', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  emoji: text('emoji'),
  category: text('category'), // dating, hobbies, lifestyle
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Interest = typeof interests.$inferSelect;
export type NewInterest = typeof interests.$inferInsert;

// Default interests to seed
export const DEFAULT_INTERESTS = [
  // Dating
  { id: 'new-friends', name: 'Новые знакомства', emoji: '👋', category: 'dating' },
  { id: 'serious', name: 'Серьёзные отношения', emoji: '💍', category: 'dating' },
  { id: 'flirt', name: 'Флирт', emoji: '😏', category: 'dating' },
  { id: 'adult', name: '18+', emoji: '🔥', category: 'dating' },

  // Hobbies
  { id: 'gaming', name: 'Игры', emoji: '🎮', category: 'hobbies' },
  { id: 'music', name: 'Музыка', emoji: '🎵', category: 'hobbies' },
  { id: 'movies', name: 'Кино', emoji: '🎬', category: 'hobbies' },
  { id: 'books', name: 'Книги', emoji: '📚', category: 'hobbies' },
  { id: 'travel', name: 'Путешествия', emoji: '✈️', category: 'hobbies' },
  { id: 'sport', name: 'Спорт', emoji: '⚽', category: 'hobbies' },
  { id: 'fitness', name: 'Фитнес', emoji: '💪', category: 'hobbies' },
  { id: 'cooking', name: 'Готовка', emoji: '🍳', category: 'hobbies' },
  { id: 'art', name: 'Искусство', emoji: '🎨', category: 'hobbies' },
  { id: 'photo', name: 'Фотография', emoji: '📷', category: 'hobbies' },

  // Lifestyle
  { id: 'party', name: 'Тусовки', emoji: '🎉', category: 'lifestyle' },
  { id: 'cafe', name: 'Кафе', emoji: '☕', category: 'lifestyle' },
  { id: 'nature', name: 'Природа', emoji: '🌲', category: 'lifestyle' },
  { id: 'pets', name: 'Животные', emoji: '🐕', category: 'lifestyle' },
  { id: 'tech', name: 'Технологии', emoji: '💻', category: 'lifestyle' },
  { id: 'anime', name: 'Аниме', emoji: '🇯🇵', category: 'lifestyle' },
];
