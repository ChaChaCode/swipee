# Swipee API - Quick Start

## Endpoint

```
POST /graphql
```

---

## Документация

1. [Авторизация](./01-auth.md) - Telegram Mini App auth
2. [Онбординг и профиль](./02-onboarding.md) - создание анкеты, загрузка фото
3. [Discovery, Свайпы, Мэтчи](./03-discovery-swipes-matches.md) - поиск и лайки
4. [Сообщения](./04-messages.md) - чат между мэтчами

---

## Быстрый старт

### 1. Авторизация

```typescript
const tg = window.Telegram.WebApp;

const { data } = await fetch('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `mutation Auth($initData: String!) {
      auth(initData: $initData) {
        user { id firstName }
        isNewUser
      }
    }`,
    variables: { initData: tg.initData }
  })
}).then(r => r.json());

const userId = data.auth.user.id;
const isNewUser = data.auth.isNewUser;
```

### 2. Проверка онбординга

```typescript
if (isNewUser) {
  // Показать онбординг
} else {
  // Проверить статус
  const { data } = await graphql(`
    query OnboardingStatus($userId: String!) {
      onboardingStatus(userId: $userId) {
        isComplete
      }
    }
  `, { userId });

  if (!data.onboardingStatus.isComplete) {
    // Показать онбординг
  }
}
```

### 3. Онбординг

```typescript
// Заполнить всё за раз
await graphql(`
  mutation CompleteOnboarding($userId: String!, $input: CompleteOnboardingInput!) {
    completeOnboarding(userId: $userId, input: $input) {
      onboardingCompleted
    }
  }
`, {
  userId,
  input: {
    name: "Иван",
    age: 25,
    gender: "MALE",
    lookingFor: "FEMALE",
    interestIds: ["gaming", "music"],
    photoUrls: ["https://..."],
    city: "Москва"
  }
});
```

### 4. Discovery

```typescript
const { data } = await graphql(`
  query Discover($userId: String!) {
    discover(userId: $userId, limit: 10) {
      profiles {
        id userId name age photos distance
      }
      hasMore
    }
  }
`, { userId });
```

### 5. Свайп

```typescript
await graphql(`
  mutation CreateSwipe($input: CreateSwipeInput!) {
    createSwipe(input: $input) { id }
  }
`, {
  input: {
    swiperId: userId,
    swipedId: targetUserId,
    type: "LIKE"
  }
});
```

### 6. Чат

```typescript
// Отправить сообщение
await graphql(`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) { id content }
  }
`, {
  input: {
    matchId: matchId,
    senderId: userId,
    content: "Привет!"
  }
});
```

---

## Все Queries

| Query | Описание |
|-------|----------|
| `me` | Текущий пользователь |
| `interests` | Список интересов |
| `onboardingProfile(userId)` | Профиль для онбординга |
| `onboardingStatus(userId)` | Статус заполнения |
| `profile(id)` | Профиль по ID |
| `profileByUserId(userId)` | Профиль по userId |
| `discover(userId, limit, offset)` | Поиск анкет |
| `discoverProfiles(userId, limit, offset)` | Простой список |
| `discoveryCount(userId)` | Количество анкет |
| `swipesByUser(userId)` | Свайпы пользователя |
| `checkMutualLike(user1Id, user2Id)` | Взаимный лайк? |
| `matchesByUser(userId)` | Мэтчи пользователя |
| `match(user1Id, user2Id)` | Конкретный мэтч |
| `messagesByMatch(matchId, limit, offset)` | Сообщения |
| `unreadMessagesCount(matchId, userId)` | Непрочитанные |

---

## Все Mutations

| Mutation | Описание |
|----------|----------|
| `auth(initData)` | Авторизация |
| `authDev(initData)` | Авторизация (dev) |
| `setName(userId, input)` | Установить имя |
| `setBio(userId, input)` | Установить био |
| `setAge(userId, input)` | Установить возраст |
| `setGender(userId, input)` | Установить пол |
| `setLookingFor(userId, input)` | Кого ищет |
| `setInterests(userId, input)` | Интересы |
| `setPhotos(userId, input)` | Фото |
| `setLocation(userId, input)` | Локация |
| `completeOnboarding(userId, input)` | Всё сразу |
| `updateProfile(userId, input)` | Обновить профиль |
| `getUploadUrl(userId, mimeType)` | URL для загрузки |
| `deletePhoto(key)` | Удалить фото |
| `createSwipe(input)` | Свайп |
| `unmatch(matchId)` | Размэтч |
| `sendMessage(input)` | Отправить |
| `markMessageAsRead(messageId)` | Прочитано |
| `markAllMessagesAsRead(matchId, userId)` | Все прочитаны |

---

## Enums

```graphql
enum Gender {
  MALE
  FEMALE
  OTHER
}

enum LookingFor {
  MALE
  FEMALE
  BOTH
}

enum SwipeType {
  LIKE
  DISLIKE
  SUPER
}
```

---

## GraphQL Playground

Доступен по адресу:
```
http://localhost:3000/graphql
```

Там можно тестировать все запросы интерактивно.
