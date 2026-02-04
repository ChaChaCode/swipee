import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { createId } from '@paralleldrive/cuid2';
import 'dotenv/config';

import { users } from './schema/users';
import { profiles } from './schema/profiles';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);

const BASE_URL = 'https://storage.yandexcloud.net/swipee';

// 5 girls
const girls = [
  {
    telegramId: 1000001,
    username: 'anna_sweet',
    firstName: 'Анна',
    profile: {
      name: 'Анна',
      bio: 'Люблю путешествия и хорошую музыку 🎵',
      age: 23,
      birthDate: new Date('2003-05-15'),
      gender: 'female' as const,
      lookingFor: 'both' as const,
      purpose: 'dating' as const,
      city: 'Челябинск',
      latitude: '55.1644',
      longitude: '61.4368',
      photos: [
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/photo_2025-12-22_23-49-41.jpg`,
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/photo_2025-12-23_03-56-37.jpg`,
      ],
      interests: ['travel', 'music', 'cafe'],
    },
  },
  {
    telegramId: 1000002,
    username: 'maria_love',
    firstName: 'Мария',
    profile: {
      name: 'Мария',
      bio: 'Ищу интересного собеседника для прогулок по городу ☕',
      age: 25,
      birthDate: new Date('2001-08-22'),
      gender: 'female' as const,
      lookingFor: 'both' as const,
      purpose: 'relationship' as const,
      city: 'Челябинск',
      latitude: '55.1650',
      longitude: '61.4370',
      photos: [`${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/photo_2026-01-16_04-10-32.jpg`],
      interests: ['books', 'art', 'nature'],
    },
  },
  {
    telegramId: 1000003,
    username: 'kate_smile',
    firstName: 'Екатерина',
    profile: {
      name: 'Катя',
      bio: 'Фитнес-тренер 💪 Люблю активный образ жизни',
      age: 27,
      birthDate: new Date('1999-03-10'),
      gender: 'female' as const,
      lookingFor: 'both' as const,
      purpose: 'dating' as const,
      city: 'Челябинск',
      latitude: '55.1655',
      longitude: '61.4375',
      photos: [
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/photo_2025-07-21_21-39-38.jpg`,
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/photo_2024-12-03_15-48-01.jpg`,
      ],
      interests: ['fitness', 'sport', 'cooking'],
    },
  },
  {
    telegramId: 1000004,
    username: 'olga_night',
    firstName: 'Ольга',
    profile: {
      name: 'Оля',
      bio: 'Обожаю кино и сериалы 🎬 Netflix & chill?',
      age: 22,
      birthDate: new Date('2004-01-28'),
      gender: 'female' as const,
      lookingFor: 'both' as const,
      purpose: 'chatting' as const,
      city: 'Челябинск',
      latitude: '55.1660',
      longitude: '61.4380',
      photos: [`${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/photo_2022-09-21_11-12-16.jpg`],
      interests: ['movies', 'gaming', 'anime'],
    },
  },
  {
    telegramId: 1000005,
    username: 'daria_star',
    firstName: 'Дарья',
    profile: {
      name: 'Даша',
      bio: 'Фотограф 📷 Покажу мир через объектив',
      age: 24,
      birthDate: new Date('2002-07-05'),
      gender: 'female' as const,
      lookingFor: 'both' as const,
      purpose: 'friendship' as const,
      city: 'Челябинск',
      latitude: '55.1665',
      longitude: '61.4385',
      photos: [
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/6c202abe-145a-4d19-b5a6-45986a767fb5.png`,
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/FemAPA2MpyB7beOxNm-zcZ3rK9aQun7uortbSSaP7S9MWQtQlb02WkkAnzo7L6vYeBXBqhmSu5kwMIHCRRULlccQ.jpg`,
      ],
      interests: ['photo', 'art', 'travel'],
    },
  },
];

// Test user
const testUser = {
  telegramId: 999999999,
  username: 'test_user',
  firstName: 'Тест',
  profile: {
    name: 'Тестовый пользователь',
    bio: 'Тестовый аккаунт для разработки',
    age: 25,
    birthDate: new Date('2001-01-01'),
    gender: 'male' as const,
    lookingFor: 'both' as const,
    purpose: 'dating' as const,
    city: 'Челябинск',
    latitude: '55.1644',
    longitude: '61.4368',
    photos: [`${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/123123123.png`],
    interests: ['tech', 'gaming', 'music'],
  },
};

// 5 boys
const boys = [
  {
    telegramId: 2000001,
    username: 'alex_cool',
    firstName: 'Александр',
    profile: {
      name: 'Саша',
      bio: 'Программист днём, геймер ночью 🎮',
      age: 26,
      birthDate: new Date('2000-04-12'),
      gender: 'male' as const,
      lookingFor: 'both' as const,
      purpose: 'dating' as const,
      city: 'Челябинск',
      latitude: '55.1670',
      longitude: '61.4390',
      photos: [
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/123123123.png`,
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/55b3cae494cb6b44071320183e9ed67e.jpg`,
      ],
      interests: ['tech', 'gaming', 'movies'],
    },
  },
  {
    telegramId: 2000002,
    username: 'dmitry_fit',
    firstName: 'Дмитрий',
    profile: {
      name: 'Дима',
      bio: 'Спортсмен, люблю горы и активный отдых ⛰️',
      age: 28,
      birthDate: new Date('1998-11-30'),
      gender: 'male' as const,
      lookingFor: 'both' as const,
      purpose: 'relationship' as const,
      city: 'Челябинск',
      latitude: '55.1675',
      longitude: '61.4395',
      photos: [`${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/65f61ce32da41b49974c63bfbfb9f3a1.jpg`],
      interests: ['sport', 'fitness', 'nature'],
    },
  },
  {
    telegramId: 2000003,
    username: 'ivan_music',
    firstName: 'Иван',
    profile: {
      name: 'Ваня',
      bio: 'Музыкант 🎸 Играю на гитаре в баре по выходным',
      age: 24,
      birthDate: new Date('2002-02-18'),
      gender: 'male' as const,
      lookingFor: 'both' as const,
      purpose: 'dating' as const,
      city: 'Челябинск',
      latitude: '55.1680',
      longitude: '61.4400',
      photos: [
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/f965f1528cac6912a0f8b5f0ebf03646.jpg`,
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/nrs0bxabt48mmhy24f761xlg.jpg`,
      ],
      interests: ['music', 'party', 'cafe'],
    },
  },
  {
    telegramId: 2000004,
    username: 'maxim_travel',
    firstName: 'Максим',
    profile: {
      name: 'Макс',
      bio: 'Путешественник ✈️ Был в 30 странах, ищу компанию',
      age: 30,
      birthDate: new Date('1996-09-08'),
      gender: 'male' as const,
      lookingFor: 'both' as const,
      purpose: 'friendship' as const,
      city: 'Челябинск',
      latitude: '55.1685',
      longitude: '61.4405',
      photos: [`${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/w41rksznd3ozl3g94cqie46f.jpg`],
      interests: ['travel', 'photo', 'cooking'],
    },
  },
  {
    telegramId: 2000005,
    username: 'nikita_books',
    firstName: 'Никита',
    profile: {
      name: 'Никита',
      bio: 'Читаю книги, пью кофе, обсуждаю философию 📚',
      age: 25,
      birthDate: new Date('2001-06-25'),
      gender: 'male' as const,
      lookingFor: 'both' as const,
      purpose: 'chatting' as const,
      city: 'Челябинск',
      latitude: '55.1690',
      longitude: '61.4410',
      photos: [
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/123123123.png`,
        `${BASE_URL}/photos/dxs13a5704jdg2cnbojz94wz/photo_2022-09-21_11-12-16.jpg`,
      ],
      interests: ['books', 'cafe', 'art'],
    },
  },
];

async function seed() {
  console.log('Seeding database...');

  // Clear existing seed users (by telegramId range)
  const seedTelegramIds = [999999999, 1000001, 1000002, 1000003, 1000004, 1000005, 2000001, 2000002, 2000003, 2000004, 2000005];

  for (const tgId of seedTelegramIds) {
    await db.delete(users).where(eq(users.telegramId, tgId));
  }
  console.log('Cleared old seed users');

  const allUsers = [testUser, ...girls, ...boys];

  for (const userData of allUsers) {
    const userId = createId();
    const profileId = createId();

    // Create user
    await db.insert(users).values({
      id: userId,
      telegramId: userData.telegramId,
      username: userData.username,
      firstName: userData.firstName,
    });

    // Create profile
    await db.insert(profiles).values({
      id: profileId,
      userId: userId,
      name: userData.profile.name,
      bio: userData.profile.bio,
      age: userData.profile.age,
      birthDate: userData.profile.birthDate,
      gender: userData.profile.gender,
      lookingFor: userData.profile.lookingFor,
      purpose: userData.profile.purpose,
      city: userData.profile.city,
      latitude: userData.profile.latitude,
      longitude: userData.profile.longitude,
      photos: userData.profile.photos,
      interests: userData.profile.interests,
      onboardingCompleted: true,
      isVisible: true,
    });

    console.log(`Created user: ${userData.firstName} (@${userData.username})`);
  }

  console.log('Seeding completed!');
  await client.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
