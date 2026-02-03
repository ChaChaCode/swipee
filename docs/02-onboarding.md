# Онбординг и профиль

## Обзор

После регистрации (`isNewUser: true`) пользователь должен заполнить анкету. Онбординг можно делать пошагово или одним запросом.

---

## Шаги онбординга

1. **Имя** - как обращаться (1-50 символов)
2. **Возраст** - 16-120 лет
3. **Пол** - мужской/женский/другой
4. **Кого ищет** - мужчин/женщин/всех
5. **Интересы** - выбор из списка тегов
6. **Фото** - 2-5 фотографий
7. **Локация** - город или координаты
8. **Био** - описание (опционально, до 500 символов)

---

## Queries

### `onboardingStatus` - Статус заполнения

Показывает какие поля заполнены.

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

**Пример ответа:**
```json
{
  "data": {
    "onboardingStatus": {
      "hasName": true,
      "hasBio": false,
      "hasAge": true,
      "hasGender": true,
      "hasLookingFor": true,
      "hasInterests": true,
      "hasPhotos": false,
      "hasLocation": false,
      "isComplete": false,
      "photosCount": 1,
      "interestsCount": 3
    }
  }
}
```

---

### `onboardingProfile` - Текущий профиль

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

### `interests` - Список интересов

Возвращает все доступные интересы/теги для выбора.

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

**Пример ответа:**
```json
{
  "data": {
    "interests": [
      { "id": "new-friends", "name": "Новые знакомства", "emoji": "👋", "category": "dating" },
      { "id": "serious", "name": "Серьёзные отношения", "emoji": "💍", "category": "dating" },
      { "id": "gaming", "name": "Игры", "emoji": "🎮", "category": "hobbies" },
      { "id": "music", "name": "Музыка", "emoji": "🎵", "category": "hobbies" }
    ]
  }
}
```

**Категории:**
- `dating` - цели знакомства
- `hobbies` - хобби
- `lifestyle` - образ жизни

---

## Мутации (пошаговое заполнение)

### `setName` - Установить имя

```graphql
mutation SetName($userId: String!, $input: SetNameInput!) {
  setName(userId: $userId, input: $input) {
    id
    name
  }
}
```

**Input:**
```json
{
  "name": "Иван"  // 1-50 символов
}
```

---

### `setAge` - Установить возраст

```graphql
mutation SetAge($userId: String!, $input: SetAgeInput!) {
  setAge(userId: $userId, input: $input) {
    id
    age
  }
}
```

**Input:**
```json
{
  "age": 25  // 16-120
}
```

---

### `setGender` - Установить пол

```graphql
mutation SetGender($userId: String!, $input: SetGenderInput!) {
  setGender(userId: $userId, input: $input) {
    id
    gender
  }
}
```

**Input:**
```json
{
  "gender": "MALE"  // MALE, FEMALE, OTHER
}
```

---

### `setLookingFor` - Кого ищет

```graphql
mutation SetLookingFor($userId: String!, $input: SetLookingForInput!) {
  setLookingFor(userId: $userId, input: $input) {
    id
    lookingFor
  }
}
```

**Input:**
```json
{
  "lookingFor": "FEMALE"  // MALE, FEMALE, BOTH
}
```

---

### `setBio` - Установить описание

```graphql
mutation SetBio($userId: String!, $input: SetBioInput!) {
  setBio(userId: $userId, input: $input) {
    id
    bio
  }
}
```

**Input:**
```json
{
  "bio": "Люблю путешествия и музыку"  // до 500 символов
}
```

---

### `setInterests` - Выбрать интересы

```graphql
mutation SetInterests($userId: String!, $input: SetInterestsInput!) {
  setInterests(userId: $userId, input: $input) {
    id
    interests
  }
}
```

**Input:**
```json
{
  "interestIds": ["gaming", "music", "travel"]
}
```

---

### `setPhotos` - Установить фото

```graphql
mutation SetPhotos($userId: String!, $input: SetPhotosInput!) {
  setPhotos(userId: $userId, input: $input) {
    id
    photos
  }
}
```

**Input:**
```json
{
  "photoUrls": [
    "https://storage.yandexcloud.net/swipee/photos/user123/photo1.jpg",
    "https://storage.yandexcloud.net/swipee/photos/user123/photo2.jpg"
  ]  // 2-5 фото
}
```

---

### `setLocation` - Установить локацию

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

**Input (город):**
```json
{
  "city": "Москва"
}
```

**Input (координаты):**
```json
{
  "latitude": "55.7558",
  "longitude": "37.6173"
}
```

**Input (оба):**
```json
{
  "city": "Москва",
  "latitude": "55.7558",
  "longitude": "37.6173"
}
```

---

## Мутация (всё за раз)

### `completeOnboarding` - Заполнить всё сразу

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
    city
    onboardingCompleted
  }
}
```

**Input:**
```json
{
  "name": "Иван",
  "age": 25,
  "gender": "MALE",
  "lookingFor": "FEMALE",
  "interestIds": ["gaming", "music", "travel"],
  "photoUrls": [
    "https://storage.yandexcloud.net/swipee/photos/user123/photo1.jpg",
    "https://storage.yandexcloud.net/swipee/photos/user123/photo2.jpg"
  ],
  "city": "Москва",
  "latitude": "55.7558",
  "longitude": "37.6173",
  "bio": "Люблю путешествия"
}
```

---

## Загрузка фото

### Шаг 1: Получить presigned URL

```graphql
mutation GetUploadUrl($userId: String!, $mimeType: String!) {
  getUploadUrl(userId: $userId, mimeType: $mimeType) {
    uploadUrl
    key
    publicUrl
  }
}
```

**Параметры:**
```json
{
  "userId": "cm5abc123",
  "mimeType": "image/jpeg"  // image/jpeg, image/png, image/webp, image/gif
}
```

**Ответ:**
```json
{
  "data": {
    "getUploadUrl": {
      "uploadUrl": "https://storage.yandexcloud.net/swipee/photos/...?X-Amz-Signature=...",
      "key": "photos/cm5abc123/xyz789.jpg",
      "publicUrl": "https://storage.yandexcloud.net/swipee/photos/cm5abc123/xyz789.jpg"
    }
  }
}
```

### Шаг 2: Загрузить файл

```typescript
const file = document.querySelector('input[type="file"]').files[0];

// Получаем presigned URL
const { data } = await graphqlRequest({
  query: `mutation GetUploadUrl($userId: String!, $mimeType: String!) {
    getUploadUrl(userId: $userId, mimeType: $mimeType) {
      uploadUrl
      publicUrl
    }
  }`,
  variables: { userId, mimeType: file.type }
});

// Загружаем файл напрямую в S3
await fetch(data.getUploadUrl.uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type
  }
});

// Используем publicUrl для сохранения в профиле
const photoUrl = data.getUploadUrl.publicUrl;
```

### Шаг 3: Сохранить в профиле

```graphql
mutation SetPhotos($userId: String!, $input: SetPhotosInput!) {
  setPhotos(userId: $userId, input: $input) {
    photos
  }
}
```

```json
{
  "photoUrls": ["https://storage.yandexcloud.net/swipee/photos/cm5abc123/xyz789.jpg"]
}
```

---

## Удаление фото

```graphql
mutation DeletePhoto($key: String!) {
  deletePhoto(key: $key)
}
```

```json
{
  "key": "photos/cm5abc123/xyz789.jpg"
}
```

---

## Типы

### Gender (enum)
```typescript
enum Gender {
  MALE = "male"
  FEMALE = "female"
  OTHER = "other"
}
```

### LookingFor (enum)
```typescript
enum LookingFor {
  MALE = "male"
  FEMALE = "female"
  BOTH = "both"
}
```

### OnboardingProfile
```typescript
interface OnboardingProfile {
  id: string;
  name?: string;
  bio?: string;
  age?: number;
  gender?: Gender;
  lookingFor?: LookingFor;
  photos: string[];
  interests: string[];
  city?: string;
  latitude?: string;
  longitude?: string;
  onboardingCompleted: boolean;
}
```

### Interest
```typescript
interface Interest {
  id: string;      // "gaming", "music", etc
  name: string;    // "Игры", "Музыка"
  emoji: string;   // "🎮", "🎵"
  category: string; // "dating", "hobbies", "lifestyle"
}
```

---

## Флоу онбординга

```
┌─────────────┐
│   Имя       │
└──────┬──────┘
       ▼
┌─────────────┐
│  Возраст    │
└──────┬──────┘
       ▼
┌─────────────┐
│    Пол      │
└──────┬──────┘
       ▼
┌─────────────┐
│  Кого ищет  │
└──────┬──────┘
       ▼
┌─────────────┐
│  Интересы   │
└──────┬──────┘
       ▼
┌─────────────┐
│    Фото     │
│  (2-5 шт)   │
└──────┬──────┘
       ▼
┌─────────────┐
│  Локация    │
└──────┬──────┘
       ▼
┌─────────────┐
│    Био      │
│(опционально)│
└──────┬──────┘
       ▼
┌─────────────┐
│  Discovery  │
└─────────────┘
```

---

## Валидация

| Поле | Ограничения |
|------|-------------|
| name | 1-50 символов |
| bio | 0-500 символов |
| age | 16-120 |
| gender | MALE, FEMALE, OTHER |
| lookingFor | MALE, FEMALE, BOTH |
| photos | 2-5 URLs |
| interestIds | массив строк |
