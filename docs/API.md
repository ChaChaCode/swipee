# Swipee API Documentation

GraphQL endpoint: `https://swipee.ru/graphql`

---

## Авторизация

### Mutation: `auth`

Авторизация через Telegram Mini App initData.

```graphql
mutation Auth($initData: String!) {
  auth(initData: $initData) {
    user {
      id
      telegramId
      username
      firstName
      lastName
    }
    profile {
      id
      name
      bio
      age
      gender
      lookingFor
      purpose
      photos
      interests
      onboardingCompleted
    }
    isNewUser
  }
}
```

**Параметры:**
- `initData` - строка initData из Telegram WebApp (`window.Telegram.WebApp.initData`)

**Ответ:**
- `user` - данные пользователя из Telegram
- `profile` - профиль пользователя (может быть `null` если новый)
- `isNewUser` - `true` если пользователь только что создан

---

### Mutation: `authTestUser` (только dev)

Авторизация тестового пользователя без initData для локальной разработки.

```graphql
mutation AuthTestUser {
  authTestUser(telegramId: "999999999") {
    user {
      id
      telegramId
      username
      firstName
    }
    profile {
      id
      name
      bio
      age
      gender
      lookingFor
      purpose
      photos
      onboardingCompleted
    }
    isNewUser
  }
}
```

**Тестовый пользователь:**
- telegramId: `999999999`
- username: `testuser`

---

### Mutation: `authDev` (только dev)

Авторизация без валидации подписи (для локальной разработки).

```graphql
mutation AuthDev($initData: String!) {
  authDev(initData: $initData) {
    user {
      id
      telegramId
      username
      firstName
    }
    profile {
      id
      name
      onboardingCompleted
    }
    isNewUser
  }
}
```

---

### Query: `me`

Получить текущего пользователя по Authorization header.

```graphql
query Me {
  me {
    id
    telegramId
    username
    firstName
    lastName
  }
}
```

**Headers:**
```
Authorization: tma <initData>
```

**Ответ:** `User` или `null` если не авторизован

---

## Профиль

### Query: `profile`

Получить профиль по ID профиля.

```graphql
query GetProfile($id: ID!) {
  profile(id: $id) {
    id
    userId
    name
    bio
    age
    gender
    lookingFor
    purpose
    photos
    onboardingCompleted
  }
}
```

---

### Query: `profileByUserId`

Получить профиль по ID пользователя.

```graphql
query GetProfileByUserId($userId: ID!) {
  profileByUserId(userId: $userId) {
    id
    userId
    name
    bio
    age
    birthDate
    gender
    lookingFor
    purpose
    city
    photos
    interests
    minAge
    maxAge
    maxDistance
    isVisible
    onboardingCompleted
  }
}
```

---

### Mutation: `updateProfile`

Обновить профиль пользователя. Аргументы передаются отдельно (не input объектом).

```graphql
mutation UpdateProfile(
  $userId: ID!
  $name: String
  $bio: String
  $birthDate: DateTime
  $gender: Gender
  $lookingFor: LookingFor
  $purpose: Purpose
  $city: String
  $latitude: String
  $longitude: String
  $photos: [String!]
  $interests: [String!]
  $minAge: Int
  $maxAge: Int
  $maxDistance: Int
  $isVisible: Boolean
  $onboardingCompleted: Boolean
) {
  updateProfile(
    userId: $userId
    name: $name
    bio: $bio
    birthDate: $birthDate
    gender: $gender
    lookingFor: $lookingFor
    purpose: $purpose
    city: $city
    latitude: $latitude
    longitude: $longitude
    photos: $photos
    interests: $interests
    minAge: $minAge
    maxAge: $maxAge
    maxDistance: $maxDistance
    isVisible: $isVisible
    onboardingCompleted: $onboardingCompleted
  ) {
    id
    name
    bio
    age
    photos
    interests
    onboardingCompleted
  }
}
```

**Доступные поля:**

| Поле | Тип | Описание |
|------|-----|----------|
| `userId` | ID! | ID пользователя (обязательный) |
| `name` | String | Имя |
| `bio` | String | О себе |
| `birthDate` | DateTime | Дата рождения |
| `gender` | Gender | Пол (MALE, FEMALE, OTHER) |
| `lookingFor` | LookingFor | Кого показывать (MALE, FEMALE, BOTH) |
| `purpose` | Purpose | Цель в приложении |
| `city` | String | Город |
| `latitude` | String | Широта |
| `longitude` | String | Долгота |
| `photos` | [String!] | Фотографии (1-6) |
| `interests` | [String!] | Теги/интересы |
| `minAge` | Int | Мин. возраст в фильтре |
| `maxAge` | Int | Макс. возраст в фильтре |
| `maxDistance` | Int | Макс. дистанция (км) |
| `isVisible` | Boolean | Видимость профиля |
| `onboardingCompleted` | Boolean | Онбординг завершен |

---

### Mutation: `deleteProfile`

Удалить профиль пользователя.

```graphql
mutation DeleteProfile($userId: ID!) {
  deleteProfile(userId: $userId)
}
```

**Ответ:** `Boolean` - успешно ли удален профиль

---

## Загрузка фотографий

Фотографии загружаются через presigned URL в Yandex Cloud S3.

### Mutation: `getUploadUrl`

Получить presigned URL для загрузки фотографии.

```graphql
mutation GetUploadUrl($userId: String!, $mimeType: String) {
  getUploadUrl(userId: $userId, mimeType: $mimeType) {
    uploadUrl
    key
    publicUrl
  }
}
```

**Параметры:**
- `userId` - ID пользователя
- `mimeType` - MIME тип изображения (по умолчанию `image/jpeg`)

**Поддерживаемые форматы:**
- `image/jpeg` / `image/jpg`
- `image/png`
- `image/webp`
- `image/gif`

**Ответ:**

| Поле | Тип | Описание |
|------|-----|----------|
| `uploadUrl` | String | Presigned URL для загрузки (действует 1 час) |
| `key` | String | Ключ файла в S3 |
| `publicUrl` | String | Публичный URL для доступа к фото |

---

### Mutation: `deletePhoto`

Удалить фотографию из хранилища.

```graphql
mutation DeletePhoto($key: String!) {
  deletePhoto(key: $key)
}
```

**Параметры:**
- `key` - ключ файла в S3 (получен из `getUploadUrl`)

**Ответ:** `Boolean` - успешно ли удалено

---

### Полный флоу загрузки фотографии

```javascript
// 1. Получить presigned URL
const { data } = await client.mutate({
  mutation: GET_UPLOAD_URL,
  variables: {
    userId: currentUserId,
    mimeType: 'image/jpeg'
  }
});

const { uploadUrl, publicUrl } = data.getUploadUrl;

// 2. Загрузить файл напрямую в S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: imageFile,
  headers: {
    'Content-Type': 'image/jpeg',
  }
});

// 3. Добавить URL в профиль
const currentPhotos = profile.photos || [];
await client.mutate({
  mutation: UPDATE_PROFILE,
  variables: {
    userId: currentUserId,
    photos: [...currentPhotos, publicUrl]
  }
});
```

### Удаление фотографии из профиля

```javascript
// 1. Получить key из URL (последняя часть пути)
const photoUrl = 'https://storage.yandexcloud.net/swipee/photos/userId/abc123.jpg';
const key = 'photos/userId/abc123.jpg'; // Извлечь из URL

// 2. Удалить из S3
await client.mutate({
  mutation: DELETE_PHOTO,
  variables: { key }
});

// 3. Обновить массив фотографий в профиле
const newPhotos = profile.photos.filter(p => p !== photoUrl);
await client.mutate({
  mutation: UPDATE_PROFILE,
  variables: {
    userId: currentUserId,
    photos: newPhotos
  }
});
```

---

## Онбординг

### Обязательные поля для завершения онбординга:

| Поле | Тип | Описание |
|------|-----|----------|
| `name` | String | Имя пользователя |
| `birthDate` | DateTime | Дата рождения |
| `gender` | Gender | Пол: MALE, FEMALE, OTHER |
| `lookingFor` | LookingFor | Кого показывать: MALE, FEMALE, BOTH |
| `purpose` | Purpose | Цель в приложении |
| `photos` | [String!] | От 1 до 6 фотографий |

### Пример онбординга:

```graphql
mutation CompleteOnboarding {
  updateProfile(
    userId: "user_id_here"
    name: "Анна"
    birthDate: "1995-05-15T00:00:00Z"
    gender: FEMALE
    lookingFor: MALE
    purpose: DATING
    photos: ["https://example.com/photo1.jpg"]
    onboardingCompleted: true
  ) {
    id
    name
    age
    onboardingCompleted
  }
}
```

---

## Редактирование профиля

### После онбординга можно редактировать:

| Поле | Описание |
|------|----------|
| `name` | Имя |
| `birthDate` | Дата рождения |
| `bio` | Текст о себе |
| `lookingFor` | Кого показывать |
| `purpose` | Цель в приложении |
| `city` | Город |
| `latitude/longitude` | Координаты |
| `photos` | Фотографии (1-6) |
| `interests` | Теги/интересы |
| `minAge/maxAge` | Фильтр по возрасту |
| `maxDistance` | Максимальная дистанция |
| `isVisible` | Видимость профиля |

### Нельзя изменить после онбординга:

| Поле | Причина |
|------|---------|
| `gender` | Пол устанавливается один раз при регистрации |

### Пример редактирования профиля:

```graphql
mutation EditProfile {
  updateProfile(
    userId: "user_id_here"
    bio: "Люблю путешествия и хорошую музыку"
    interests: ["путешествия", "музыка", "кино", "спорт"]
    photos: [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg"
    ]
  ) {
    id
    bio
    interests
    photos
  }
}
```

---

## Лента анкет (Discovery)

### Query: `discover`

Получить анкеты для свайпов с пагинацией.

```graphql
query Discover($userId: String!, $limit: Int, $offset: Int, $excludeIds: [String!]) {
  discover(userId: $userId, limit: $limit, offset: $offset, excludeIds: $excludeIds) {
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
- `userId` - ID текущего пользователя
- `limit` - количество анкет (по умолчанию 10)
- `offset` - смещение для пагинации (по умолчанию 0)
- `excludeIds` - массив ID профилей для исключения (по умолчанию [])

**Ответ:**
- `profiles` - массив анкет
- `total` - количество возвращенных анкет
- `hasMore` - есть ли еще анкеты

**Поля профиля в Discovery:**

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | ID | ID профиля |
| `userId` | String | ID пользователя |
| `name` | String | Имя |
| `bio` | String | О себе |
| `age` | Int | Возраст |
| `gender` | Gender | Пол |
| `lookingFor` | LookingFor | Кого ищет |
| `city` | String | Город |
| `photos` | [String] | Фотографии |
| `interests` | [String] | Интересы |
| `distance` | Float | Расстояние в км |

**Фильтрация (автоматическая):**
- По полу (gender/lookingFor)
- По возрасту (minAge/maxAge)
- По расстоянию (maxDistance)
- Исключаются пользователи с активными взаимодействиями (24ч cooldown)
- Исключаются активные матчи
- Исключаются матчи в периоде скрытия (2 дня)

---

### Query: `discoverProfiles`

Альтернативный запрос - возвращает просто массив профилей без обертки.

```graphql
query DiscoverProfiles($userId: String!, $limit: Int, $offset: Int, $excludeIds: [String!]) {
  discoverProfiles(userId: $userId, limit: $limit, offset: $offset, excludeIds: $excludeIds) {
    id
    userId
    name
    bio
    age
    gender
    city
    photos
    interests
    distance
  }
}
```

---

### Query: `discoveryCount`

Получить количество доступных анкет для пользователя.

```graphql
query DiscoveryCount($userId: String!) {
  discoveryCount(userId: $userId)
}
```

**Ответ:** `Int` - количество анкет

---

## Взаимодействия (Interactions)

### Mutation: `createInteraction`

Создать взаимодействие (лайк, суперлайк, скип).

```graphql
mutation CreateInteraction(
  $fromUserId: ID!
  $toUserId: ID!
  $type: InteractionType!
  $message: String
) {
  createInteraction(
    fromUserId: $fromUserId
    toUserId: $toUserId
    type: $type
    message: $message
  ) {
    interaction {
      id
      type
      likeCount
      createdAt
    }
    isMatch
    match {
      id
      user1Id
      user2Id
      user1TelegramUsername
      user2TelegramUsername
      hiddenUntil
    }
  }
}
```

**Параметры:**
- `fromUserId` - ID текущего пользователя
- `toUserId` - ID пользователя которого лайкаем
- `type` - тип взаимодействия: `LIKE`, `SUPER_LIKE`, `SKIP`
- `message` - сообщение (обязательно для `SUPER_LIKE`)

**InteractionType:**
```graphql
enum InteractionType {
  LIKE
  SUPER_LIKE
  SKIP
}
```

**Бизнес-логика:**
- `SUPER_LIKE` требует `message`
- После взаимодействия 24ч cooldown до следующего
- При повторном лайке увеличивается `likeCount`
- При взаимном лайке создается матч
- При матче обоим отправляется уведомление в Telegram
- После матча `likeCount` сбрасывается

**Ответ:**
- `interaction` - созданное взаимодействие
- `isMatch` - `true` если произошел матч
- `match` - данные матча с Telegram username обоих пользователей

---

### Query: `likesReceived`

Получить список полученных лайков ("Кто меня лайкнул").

```graphql
query LikesReceived($userId: ID!) {
  likesReceived(userId: $userId) {
    id
    fromUser {
      id
      userId
      name
      age
      photos
      city
    }
    likeCount
    createdAt
  }
}
```

**Ответ:**
- `id` - ID взаимодействия
- `fromUser` - профиль пользователя который лайкнул
- `likeCount` - сколько раз лайкнул (без взаимности)
- `createdAt` - дата последнего лайка

---

### Query: `superLikesReceived`

Получить список суперлайков с сообщениями.

```graphql
query SuperLikesReceived($userId: ID!) {
  superLikesReceived(userId: $userId) {
    id
    fromUser {
      id
      userId
      name
      age
      photos
    }
    message
    isRead
    createdAt
  }
}
```

**Ответ:**
- `id` - ID взаимодействия
- `fromUser` - профиль отправителя
- `message` - текст сообщения
- `isRead` - прочитано ли
- `createdAt` - дата отправки

---

### Query: `unreadSuperLikesCount`

Получить количество непрочитанных суперлайков (для бейджа).

```graphql
query UnreadCount($userId: ID!) {
  unreadSuperLikesCount(userId: $userId)
}
```

**Ответ:** `Int` - количество непрочитанных

---

### Mutation: `markSuperLikeAsRead`

Отметить суперлайк как прочитанный.

```graphql
mutation MarkAsRead($interactionId: ID!) {
  markSuperLikeAsRead(interactionId: $interactionId)
}
```

**Ответ:** `Boolean` - успешно ли

---

### Query: `checkMutualLike`

Проверить есть ли взаимный лайк.

```graphql
query CheckMutual($user1Id: ID!, $user2Id: ID!) {
  checkMutualLike(user1Id: $user1Id, user2Id: $user2Id)
}
```

**Ответ:** `Boolean` - есть ли взаимный лайк

---

## Матчи

### Query: `matchesByUser`

Получить список матчей пользователя.

```graphql
query MatchesByUser($userId: ID!) {
  matchesByUser(userId: $userId) {
    id
    user1Id
    user2Id
    user1 {
      id
      telegramId
      username
    }
    user2 {
      id
      telegramId
      username
    }
    user1TelegramUsername
    user2TelegramUsername
    isActive
    user1Notified
    user2Notified
    hiddenUntil
    createdAt
    updatedAt
  }
}
```

**Ответ:**

| Поле | Тип | Описание |
|------|-----|----------|
| `user1Id` / `user2Id` | ID | ID пользователей |
| `user1` / `user2` | User | Вложенные объекты пользователей |
| `user1TelegramUsername` / `user2TelegramUsername` | String | Telegram username для связи |
| `isActive` | Boolean | Активен ли матч |
| `user1Notified` / `user2Notified` | Boolean | Отправлено ли уведомление |
| `hiddenUntil` | DateTime | До какого времени скрыт из ленты (2 дня) |
| `createdAt` / `updatedAt` | DateTime | Даты создания и обновления |

---

### Query: `match`

Получить конкретный матч между двумя пользователями.

```graphql
query Match($user1Id: ID!, $user2Id: ID!) {
  match(user1Id: $user1Id, user2Id: $user2Id) {
    id
    isActive
    hiddenUntil
    createdAt
  }
}
```

**Ответ:** `Match` или `null` если матча нет

---

### Mutation: `unmatch`

Отменить матч.

```graphql
mutation Unmatch($matchId: ID!) {
  unmatch(matchId: $matchId) {
    id
    isActive
  }
}
```

---

## Типы данных

### Gender
```graphql
enum Gender {
  MALE    # Мужчина
  FEMALE  # Женщина
  OTHER   # Другой
}
```

### LookingFor
```graphql
enum LookingFor {
  MALE    # Показывать мужчин
  FEMALE  # Показывать женщин
  BOTH    # Показывать всех
}
```

### Purpose
```graphql
enum Purpose {
  DATING       # Свидания
  RELATIONSHIP # Отношения
  FRIENDSHIP   # Дружба
  CHATTING     # Общение без конкретики
  ADULT        # Тема 18+
}
```

### InteractionType
```graphql
enum InteractionType {
  LIKE
  SUPER_LIKE
  SKIP
}
```

---

## Примеры использования

### Полный флоу свайпа

```javascript
// 1. Получить анкеты
const { data } = await client.query({
  query: DISCOVER_QUERY,
  variables: {
    userId: currentUserId,
    limit: 10,
    offset: 0,
    excludeIds: []
  }
});

const profiles = data.discover.profiles;
const hasMore = data.discover.hasMore;

// 2. Свайп вправо (лайк)
const { data: likeResult } = await client.mutate({
  mutation: CREATE_INTERACTION,
  variables: {
    fromUserId: currentUserId,
    toUserId: profileId,
    type: 'LIKE'
  }
});

if (likeResult.createInteraction.isMatch) {
  // Показать экран матча
  const match = likeResult.createInteraction.match;
  console.log('Match! Telegram:', match.user2TelegramUsername);
}

// 3. Суперлайк с сообщением
const { data: superLikeResult } = await client.mutate({
  mutation: CREATE_INTERACTION,
  variables: {
    fromUserId: currentUserId,
    toUserId: profileId,
    type: 'SUPER_LIKE',
    message: 'Привет! Классные фото!'
  }
});
```

### Страница "Кто меня лайкнул"

```javascript
// Получить лайки
const { data } = await client.query({
  query: LIKES_RECEIVED,
  variables: { userId: currentUserId }
});

// Отобразить карточки
data.likesReceived.forEach(like => {
  console.log(like.fromUser.name, 'лайкнул вас', like.likeCount, 'раз');
});
```

### Страница суперлайков

```javascript
// Получить суперлайки
const { data } = await client.query({
  query: SUPER_LIKES_RECEIVED,
  variables: { userId: currentUserId }
});

// Отметить как прочитанное при открытии
await client.mutate({
  mutation: MARK_AS_READ,
  variables: { interactionId: superLike.id }
});
```

### Страница матчей

```javascript
// Получить все матчи
const { data } = await client.query({
  query: MATCHES_BY_USER,
  variables: { userId: currentUserId }
});

data.matchesByUser.forEach(match => {
  // Определить кто партнер
  const partnerId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;
  const partnerUsername = match.user1Id === currentUserId
    ? match.user2TelegramUsername
    : match.user1TelegramUsername;

  console.log('Матч с:', partnerUsername);
});

// Отменить матч
await client.mutate({
  mutation: UNMATCH,
  variables: { matchId: match.id }
});
```

---

## Ошибки

| Ошибка | Описание |
|--------|----------|
| `Super like requires a message` | SUPER_LIKE без message |
| `Cannot interact yet. Please wait 24 hours.` | Cooldown не истек |
| `Cannot change gender after onboarding` | Попытка изменить пол после онбординга |
| `Not available in production` | Dev-only endpoint в production |
| `Test user not found` | Тестовый пользователь не найден |

---

## Уведомления

При матче оба пользователя получают уведомление в Telegram от бота с:
- Именем матча
- Кнопкой для перехода в приложение

Настройка бота: переменная `TELEGRAM_BOT_TOKEN` в .env
