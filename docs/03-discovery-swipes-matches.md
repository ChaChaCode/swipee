# Discovery, Свайпы и Мэтчи

## Обзор

- **Discovery** - поиск анкет для свайпа
- **Swipes** - лайк/дизлайк/суперлайк
- **Matches** - взаимные лайки

---

# Discovery

## Queries

### `discover` - Поиск анкет (с пагинацией)

Возвращает профили для свайпа с информацией о пагинации.

```graphql
query Discover($userId: String!, $limit: Int, $offset: Int) {
  discover(userId: $userId, limit: $limit, offset: $offset) {
    profiles {
      id
      userId
      name
      bio
      age
      gender
      lookingFor
      city
      photos
      interests
      distance
    }
    total
    hasMore
  }
}
```

**Параметры:**
| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| userId | String! | - | ID текущего пользователя |
| limit | Int | 10 | Количество профилей |
| offset | Int | 0 | Смещение |

**Пример ответа:**
```json
{
  "data": {
    "discover": {
      "profiles": [
        {
          "id": "profile123",
          "userId": "user456",
          "name": "Анна",
          "bio": "Люблю путешествия",
          "age": 23,
          "gender": "FEMALE",
          "lookingFor": "MALE",
          "city": "Москва",
          "photos": [
            "https://storage.yandexcloud.net/swipee/photos/user456/photo1.jpg",
            "https://storage.yandexcloud.net/swipee/photos/user456/photo2.jpg"
          ],
          "interests": ["travel", "music", "cafe"],
          "distance": 5.2
        }
      ],
      "total": 1,
      "hasMore": true
    }
  }
}
```

---

### `discoverProfiles` - Простой список

```graphql
query DiscoverProfiles($userId: String!, $limit: Int, $offset: Int) {
  discoverProfiles(userId: $userId, limit: $limit, offset: $offset) {
    id
    userId
    name
    age
    photos
    distance
  }
}
```

---

### `discoveryCount` - Количество доступных анкет

```graphql
query DiscoveryCount($userId: String!) {
  discoveryCount(userId: $userId)
}
```

**Ответ:**
```json
{
  "data": {
    "discoveryCount": 42
  }
}
```

---

## Фильтрация Discovery

Профили фильтруются автоматически на основе настроек пользователя:

| Фильтр | Описание |
|--------|----------|
| gender + lookingFor | Взаимное соответствие предпочтений |
| minAge / maxAge | Возрастной диапазон |
| maxDistance | Максимальное расстояние (км) |
| Свайпы | Исключаются уже свайпнутые |
| onboardingCompleted | Только завершённые профили |
| isVisible | Только видимые профили |

**Пример:** Если я мужчина и ищу женщин, мне покажут женщин, которые ищут мужчин или всех.

---

## Типы

### DiscoveryProfile

```typescript
interface DiscoveryProfile {
  id: string;
  userId: string;
  name?: string;
  bio?: string;
  age?: number;
  gender?: Gender;
  lookingFor?: LookingFor;
  city?: string;
  photos: string[];
  interests: string[];
  distance?: number;  // расстояние в км (если есть геолокация)
}
```

---

# Свайпы

## Мутации

### `createSwipe` - Свайп

Создаёт свайп. При взаимном лайке автоматически создаётся мэтч.

```graphql
mutation CreateSwipe($input: CreateSwipeInput!) {
  createSwipe(input: $input) {
    id
    swiperId
    swipedId
    type
    createdAt
  }
}
```

**Input:**
```json
{
  "swiperId": "myUserId",
  "swipedId": "targetUserId",
  "type": "LIKE"
}
```

**Типы свайпов:**
| Тип | Описание |
|-----|----------|
| LIKE | Обычный лайк |
| DISLIKE | Пропуск |
| SUPER | Суперлайк |

**Пример ответа (обычный свайп):**
```json
{
  "data": {
    "createSwipe": {
      "id": "swipe123",
      "swiperId": "user1",
      "swipedId": "user2",
      "type": "LIKE",
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

---

## Queries

### `swipesByUser` - Все свайпы пользователя

```graphql
query SwipesByUser($userId: String!) {
  swipesByUser(userId: $userId) {
    id
    swipedId
    type
    createdAt
  }
}
```

---

### `checkMutualLike` - Проверка взаимного лайка

```graphql
query CheckMutualLike($user1Id: String!, $user2Id: String!) {
  checkMutualLike(user1Id: $user1Id, user2Id: $user2Id)
}
```

**Ответ:**
```json
{
  "data": {
    "checkMutualLike": true
  }
}
```

---

## Типы

### SwipeType (enum)
```typescript
enum SwipeType {
  LIKE = "like"
  DISLIKE = "dislike"
  SUPER = "super"
}
```

### Swipe
```typescript
interface Swipe {
  id: string;
  swiperId: string;
  swipedId: string;
  type: SwipeType;
  createdAt: Date;
}
```

---

# Мэтчи

Мэтч создаётся автоматически при взаимном лайке.

## Queries

### `matchesByUser` - Все мэтчи пользователя

```graphql
query MatchesByUser($userId: String!) {
  matchesByUser(userId: $userId) {
    id
    user1Id
    user2Id
    isActive
    createdAt
    updatedAt
  }
}
```

**Пример ответа:**
```json
{
  "data": {
    "matchesByUser": [
      {
        "id": "match123",
        "user1Id": "user1",
        "user2Id": "user2",
        "isActive": true,
        "createdAt": "2024-01-15T12:00:00.000Z",
        "updatedAt": "2024-01-15T12:00:00.000Z"
      }
    ]
  }
}
```

---

### `match` - Конкретный мэтч

```graphql
query Match($user1Id: String!, $user2Id: String!) {
  match(user1Id: $user1Id, user2Id: $user2Id) {
    id
    isActive
    createdAt
  }
}
```

---

## Мутации

### `unmatch` - Размэтчиться

Soft delete - устанавливает `isActive: false`.

```graphql
mutation Unmatch($matchId: String!) {
  unmatch(matchId: $matchId) {
    id
    isActive
  }
}
```

---

## Типы

### Match
```typescript
interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

# Флоу свайпов

```
┌─────────────────────┐
│  Показываем профиль │
│  из Discovery       │
└──────────┬──────────┘
           │
           ▼
    ┌──────┴──────┐
    │   Свайп?    │
    └──────┬──────┘
           │
     ┌─────┼─────┐
     ▼     ▼     ▼
  DISLIKE LIKE  SUPER
     │     │     │
     │     └──┬──┘
     │        │
     │        ▼
     │  ┌───────────┐
     │  │ Взаимный? │
     │  └─────┬─────┘
     │        │
     │    Yes │ No
     │        ▼
     │  ┌───────────┐
     │  │  MATCH!   │
     │  │ Создаётся │
     │  │автоматом  │
     │  └───────────┘
     │
     ▼
┌─────────────────────┐
│ Следующий профиль   │
└─────────────────────┘
```

---

# Пример: полный флоу

```typescript
// 1. Загружаем профили для свайпа
const { data } = await graphql({
  query: `query Discover($userId: String!) {
    discover(userId: $userId, limit: 10) {
      profiles {
        id
        userId
        name
        age
        photos
        distance
      }
      hasMore
    }
  }`,
  variables: { userId: myUserId }
});

const profiles = data.discover.profiles;

// 2. Показываем первый профиль
const currentProfile = profiles[0];

// 3. Пользователь свайпает вправо (LIKE)
const swipeResult = await graphql({
  query: `mutation CreateSwipe($input: CreateSwipeInput!) {
    createSwipe(input: $input) {
      id
      type
    }
  }`,
  variables: {
    input: {
      swiperId: myUserId,
      swipedId: currentProfile.userId,
      type: "LIKE"
    }
  }
});

// 4. Проверяем есть ли мэтч
const matchResult = await graphql({
  query: `query Match($user1Id: String!, $user2Id: String!) {
    match(user1Id: $user1Id, user2Id: $user2Id) {
      id
    }
  }`,
  variables: {
    user1Id: myUserId,
    user2Id: currentProfile.userId
  }
});

if (matchResult.data.match) {
  // Показываем "It's a match!" экран
  showMatchScreen(currentProfile);
}

// 5. Переходим к следующему профилю
showNextProfile();
```
