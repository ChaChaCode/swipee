import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const lookingForEnum = pgEnum('looking_for', ['male', 'female', 'both']);
export const purposeEnum = pgEnum('purpose', [
  'dating',
  'relationship',
  'friendship',
  'chatting',
  'adult',
]);

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(), // cuid2
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Basic info
  name: text('name'), // Display name (can differ from Telegram)
  bio: text('bio'),
  birthDate: timestamp('birth_date'),

  // Gender & preferences
  gender: genderEnum('gender'),
  lookingFor: lookingForEnum('looking_for'),
  purpose: purposeEnum('purpose'),

  // Location
  city: text('city'),
  latitude: text('latitude'),
  longitude: text('longitude'),
  anyLocation: boolean('any_location').default(false), // true = show profiles from anywhere

  // Media & interests
  photos: jsonb('photos').$type<string[]>().default([]),
  interests: jsonb('interests').$type<string[]>().default([]),

  // Search filters
  minAge: integer('min_age').default(18),
  maxAge: integer('max_age').default(100),
  maxDistance: integer('max_distance').default(50), // km

  // Status
  isVisible: boolean('is_visible').default(true),
  onboardingCompleted: boolean('onboarding_completed').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
