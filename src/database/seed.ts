import { drizzle } from 'drizzle-orm/postgres-js';
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
      lookingFor: 'male' as const,
      purpose: 'dating' as const,
      city: 'Москва',
      latitude: '55.7558',
      longitude: '37.6173',
      photos: [
        'https://randomuser.me/api/portraits/women/1.jpg',
        'https://randomuser.me/api/portraits/women/2.jpg',
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
      lookingFor: 'male' as const,
      purpose: 'relationship' as const,
      city: 'Москва',
      latitude: '55.7600',
      longitude: '37.6200',
      photos: ['https://randomuser.me/api/portraits/women/3.jpg'],
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
      lookingFor: 'male' as const,
      purpose: 'dating' as const,
      city: 'Санкт-Петербург',
      latitude: '59.9343',
      longitude: '30.3351',
      photos: [
        'https://randomuser.me/api/portraits/women/4.jpg',
        'https://randomuser.me/api/portraits/women/5.jpg',
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
      lookingFor: 'male' as const,
      purpose: 'chatting' as const,
      city: 'Москва',
      latitude: '55.7520',
      longitude: '37.6150',
      photos: ['https://randomuser.me/api/portraits/women/6.jpg'],
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
      lookingFor: 'male' as const,
      purpose: 'friendship' as const,
      city: 'Казань',
      latitude: '55.8304',
      longitude: '49.0661',
      photos: [
        'https://randomuser.me/api/portraits/women/7.jpg',
        'https://randomuser.me/api/portraits/women/8.jpg',
        'https://randomuser.me/api/portraits/women/9.jpg',
      ],
      interests: ['photo', 'art', 'travel'],
    },
  },
];

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
      lookingFor: 'female' as const,
      purpose: 'dating' as const,
      city: 'Москва',
      latitude: '55.7580',
      longitude: '37.6190',
      photos: [
        'https://randomuser.me/api/portraits/men/1.jpg',
        'https://randomuser.me/api/portraits/men/2.jpg',
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
      lookingFor: 'female' as const,
      purpose: 'relationship' as const,
      city: 'Санкт-Петербург',
      latitude: '59.9380',
      longitude: '30.3140',
      photos: ['https://randomuser.me/api/portraits/men/3.jpg'],
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
      lookingFor: 'female' as const,
      purpose: 'dating' as const,
      city: 'Москва',
      latitude: '55.7540',
      longitude: '37.6210',
      photos: [
        'https://randomuser.me/api/portraits/men/4.jpg',
        'https://randomuser.me/api/portraits/men/5.jpg',
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
      lookingFor: 'female' as const,
      purpose: 'friendship' as const,
      city: 'Казань',
      latitude: '55.8320',
      longitude: '49.0700',
      photos: ['https://randomuser.me/api/portraits/men/6.jpg'],
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
      lookingFor: 'female' as const,
      purpose: 'chatting' as const,
      city: 'Москва',
      latitude: '55.7610',
      longitude: '37.6100',
      photos: [
        'https://randomuser.me/api/portraits/men/7.jpg',
        'https://randomuser.me/api/portraits/men/8.jpg',
      ],
      interests: ['books', 'cafe', 'art'],
    },
  },
];

async function seed() {
  console.log('Seeding database...');

  const allUsers = [...girls, ...boys];

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
