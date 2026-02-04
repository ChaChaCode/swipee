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

## Пользователи (Users)

### Query: `user`

Получить пользователя по ID.

```graphql
query User($id: ID!) {
  user(id: $id) {
    id
    telegramId
    username
    firstName
    lastName
    languageCode
    isPremium
    isActive
    lastActiveAt
    createdAt
    updatedAt
  }
}
```

---

### Query: `userByTelegramId`

Получить пользователя по Telegram ID.

```graphql
query UserByTelegramId($telegramId: Int!) {
  userByTelegramId(telegramId: $telegramId) {
    id
    telegramId
    username
    firstName
    lastName
    isPremium
    isActive
  }
}
```

---

### Модель User

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | ID | Внутренний ID |
| `telegramId` | Int | Telegram ID |
| `username` | String? | Username в Telegram |
| `firstName` | String | Имя |
| `lastName` | String? | Фамилия |
| `languageCode` | String? | Код языка |
| `isPremium` | Boolean | Telegram Premium |
| `isActive` | Boolean | Активен ли пользователь |
| `lastActiveAt` | DateTime | Последняя активность |
| `createdAt` | DateTime | Дата создания |
| `updatedAt` | DateTime | Дата обновления |

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

Специальные endpoints для пошагового онбординга новых пользователей.

### Query: `onboardingProfile`

Получить текущее состояние профиля для онбординга.

```graphql
query OnboardingProfile($userId: String!) {
  onboardingProfile(userId: $userId) {
    id
    name
    bio
    age
    gender
    lookingFor
    photos
    interests
    city
    latitude
    longitude
    onboardingCompleted
  }
}
```

---

### Query: `onboardingStatus`

Получить статус заполнения онбординга (какие поля заполнены).

```graphql
query OnboardingStatus($userId: String!) {
  onboardingStatus(userId: $userId) {
    hasName
    hasBio
    hasAge
    hasGender
    hasLookingFor
    hasInterests
    hasPhotos
    hasLocation
    isComplete
    photosCount
    interestsCount
  }
}
```

**Ответ OnboardingStatus:**

| Поле | Тип | Описание |
|------|-----|----------|
| `hasName` | Boolean | Имя заполнено |
| `hasBio` | Boolean | О себе заполнено |
| `hasAge` | Boolean | Возраст указан |
| `hasGender` | Boolean | Пол указан |
| `hasLookingFor` | Boolean | Кого ищет указано |
| `hasInterests` | Boolean | Интересы выбраны |
| `hasPhotos` | Boolean | Фото загружены |
| `hasLocation` | Boolean | Локация указана |
| `isComplete` | Boolean | Онбординг завершен |
| `photosCount` | Int | Количество фото |
| `interestsCount` | Int | Количество интересов |

---

### Query: `interests`

Получить список всех доступных интересов.

```graphql
query Interests {
  interests {
    id
    name
    emoji
    category
  }
}
```

**Ответ:** массив интересов с id, названием, эмоджи и категорией.

---

### Mutation: `setName`

Установить имя.

```graphql
mutation SetName($userId: String!, $input: SetNameInput!) {
  setName(userId: $userId, input: $input) {
    id
    name
    onboardingCompleted
  }
}
```

**Input:**
```graphql
input SetNameInput {
  name: String!  # 1-50 символов
}
```

---

### Mutation: `setBio`

Установить описание "О себе".

```graphql
mutation SetBio($userId: String!, $input: SetBioInput!) {
  setBio(userId: $userId, input: $input) {
    id
    bio
  }
}
```

**Input:**
```graphql
input SetBioInput {
  bio: String!  # до 500 символов
}
```

---

### Mutation: `setAge`

Установить возраст.

```graphql
mutation SetAge($userId: String!, $input: SetAgeInput!) {
  setAge(userId: $userId, input: $input) {
    id
    age
  }
}
```

**Input:**
```graphql
input SetAgeInput {
  age: Int!  # 16-120
}
```

---

### Mutation: `setGender`

Установить пол.

```graphql
mutation SetGender($userId: String!, $input: SetGenderInput!) {
  setGender(userId: $userId, input: $input) {
    id
    gender
  }
}
```

**Input:**
```graphql
input SetGenderInput {
  gender: Gender!  # MALE, FEMALE, OTHER
}
```

---

### Mutation: `setLookingFor`

Установить кого ищет.

```graphql
mutation SetLookingFor($userId: String!, $input: SetLookingForInput!) {
  setLookingFor(userId: $userId, input: $input) {
    id
    lookingFor
  }
}
```

**Input:**
```graphql
input SetLookingForInput {
  lookingFor: LookingFor!  # MALE, FEMALE, BOTH
}
```

---

### Mutation: `setInterests`

Установить интересы (по ID из списка interests).

```graphql
mutation SetInterests($userId: String!, $input: SetInterestsInput!) {
  setInterests(userId: $userId, input: $input) {
    id
    interests
  }
}
```

**Input:**
```graphql
input SetInterestsInput {
  interestIds: [String!]!
}
```

---

### Mutation: `setPhotos`

Установить фотографии.

```graphql
mutation SetPhotos($userId: String!, $input: SetPhotosInput!) {
  setPhotos(userId: $userId, input: $input) {
    id
    photos
  }
}
```

**Input:**
```graphql
input SetPhotosInput {
  photoUrls: [String!]!  # от 1 до 6 фотографий
}
```

---

### Mutation: `setLocation`

Установить локацию.

```graphql
mutation SetLocation($userId: String!, $input: SetLocationInput!) {
  setLocation(userId: $userId, input: $input) {
    id
    city
    latitude
    longitude
  }
}
```

**Input:**
```graphql
input SetLocationInput {
  city: String
  latitude: String
  longitude: String
}
```

---

### Mutation: `completeOnboarding`

Завершить онбординг одним запросом (установить все поля сразу).

```graphql
mutation CompleteOnboarding($userId: String!, $input: CompleteOnboardingInput!) {
  completeOnboarding(userId: $userId, input: $input) {
    id
    name
    bio
    age
    gender
    lookingFor
    photos
    interests
    onboardingCompleted
  }
}
```

**Input:**
```graphql
input CompleteOnboardingInput {
  name: String!           # 1-50 символов
  bio: String             # до 500 символов (опционально)
  age: Int!               # 16-120
  gender: Gender!         # MALE, FEMALE, OTHER
  lookingFor: LookingFor! # MALE, FEMALE, BOTH
  interestIds: [String!]! # ID интересов
  photoUrls: [String!]!   # 1-6 фотографий
  city: String            # опционально
  latitude: String        # опционально
  longitude: String       # опционально
}
```

---

### Пример пошагового онбординга

```javascript
// 1. Проверить текущий статус
const { data: status } = await client.query({
  query: ONBOARDING_STATUS,
  variables: { userId }
});

// 2. Получить список интересов
const { data: interestsData } = await client.query({
  query: INTERESTS
});

// 3. Установить данные по шагам
await client.mutate({
  mutation: SET_NAME,
  variables: { userId, input: { name: 'Анна' } }
});

await client.mutate({
  mutation: SET_AGE,
  variables: { userId, input: { age: 25 } }
});

await client.mutate({
  mutation: SET_GENDER,
  variables: { userId, input: { gender: 'FEMALE' } }
});

await client.mutate({
  mutation: SET_LOOKING_FOR,
  variables: { userId, input: { lookingFor: 'MALE' } }
});

await client.mutate({
  mutation: SET_INTERESTS,
  variables: { userId, input: { interestIds: ['id1', 'id2', 'id3'] } }
});

await client.mutate({
  mutation: SET_PHOTOS,
  variables: { userId, input: { photoUrls: ['url1', 'url2'] } }
});
```

### Пример завершения онбординга одним запросом

```javascript
await client.mutate({
  mutation: COMPLETE_ONBOARDING,
  variables: {
    userId,
    input: {
      name: 'Анна',
      age: 25,
      gender: 'FEMALE',
      lookingFor: 'MALE',
      interestIds: ['id1', 'id2', 'id3'],
      photoUrls: ['url1', 'url2'],
      city: 'Москва'
    }
  }
});
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
