# Авторизация

## Обзор

Авторизация происходит через Telegram Mini App. Бэкенд валидирует `initData` от Telegram и создаёт/возвращает пользователя.

## GraphQL Endpoint

```
POST /graphql
```

---

## Мутации

### `auth` - Авторизация (продакшн)

Валидирует initData от Telegram и возвращает пользователя.

```graphql
mutation Auth($initData: String!) {
  auth(initData: $initData) {
    user {
      id
      telegramId
      username
      firstName
      lastName
      isPremium
      createdAt
    }
    isNewUser
  }
}
```

**Параметры:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| initData | String! | Строка initData из Telegram WebApp |

**Пример запроса:**
```json
{
  "query": "mutation Auth($initData: String!) { auth(initData: $initData) { user { id telegramId firstName } isNewUser } }",
  "variables": {
    "initData": "query_id=AAHdF6IQ...&user=%7B%22id%22%3A123456789..."
  }
}
```

**Пример ответа:**
```json
{
  "data": {
    "auth": {
      "user": {
        "id": "cm5abc123def456",
        "telegramId": "123456789",
        "firstName": "Иван"
      },
      "isNewUser": true
    }
  }
}
```

---

### `authDev` - Авторизация (разработка)

**Только для разработки!** Парсит initData без валидации подписи.

```graphql
mutation AuthDev($initData: String!) {
  authDev(initData: $initData) {
    user {
      id
      telegramId
      username
      firstName
      lastName
    }
    isNewUser
  }
}
```

---

## Queries

### `me` - Текущий пользователь

Возвращает текущего пользователя по заголовку Authorization.

```graphql
query Me {
  me {
    id
    telegramId
    username
    firstName
    lastName
    isPremium
    isActive
    lastActiveAt
    createdAt
  }
}
```

**Заголовки:**
```
Authorization: Bearer <userId>
```

**Пример ответа:**
```json
{
  "data": {
    "me": {
      "id": "cm5abc123def456",
      "telegramId": "123456789",
      "username": "ivan_petrov",
      "firstName": "Иван",
      "lastName": "Петров",
      "isPremium": false,
      "isActive": true,
      "lastActiveAt": "2024-01-15T12:00:00.000Z",
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  }
}
```

---

## Интеграция с Telegram Mini App

### Получение initData

```typescript
// В Telegram Mini App
const tg = window.Telegram.WebApp;
const initData = tg.initData;

// Отправка на бэкенд
const response = await fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      mutation Auth($initData: String!) {
        auth(initData: $initData) {
          user { id firstName }
          isNewUser
        }
      }
    `,
    variables: { initData }
  })
});

const { data } = await response.json();
const userId = data.auth.user.id;
const isNewUser = data.auth.isNewUser;

// Сохранить userId для последующих запросов
localStorage.setItem('userId', userId);
```

### Использование userId в запросах

После авторизации используй `userId` в заголовке или как параметр:

```typescript
// Вариант 1: В заголовке
const response = await fetch('/graphql', {
  headers: {
    'Authorization': `Bearer ${userId}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: 'query Me { me { id firstName } }' })
});

// Вариант 2: Как параметр в запросах
const response = await fetch('/graphql', {
  body: JSON.stringify({
    query: 'query Profile($userId: ID!) { profileByUserId(userId: $userId) { name bio } }',
    variables: { userId }
  })
});
```

---

## Флоу авторизации

```
┌─────────────────┐
│  Telegram App   │
│  открывает      │
│  Mini App       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Получаем       │
│  initData       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Вызываем       │
│  mutation auth  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  isNewUser?     │─Yes─▶  Онбординг     │
└────────┬────────┘     └─────────────────┘
         │ No
         ▼
┌─────────────────┐
│  Главный экран  │
│  (Discovery)    │
└─────────────────┘
```

---

## Типы

### User

```typescript
interface User {
  id: string;           // CUID2 идентификатор
  telegramId: string;   // ID пользователя в Telegram
  username?: string;    // @username в Telegram
  firstName?: string;   // Имя
  lastName?: string;    // Фамилия
  languageCode?: string; // Код языка (ru, en, etc)
  isPremium: boolean;   // Telegram Premium
  isBot: boolean;       // Является ботом
  isActive: boolean;    // Активен ли аккаунт
  lastActiveAt: Date;   // Последняя активность
  createdAt: Date;      // Дата регистрации
  updatedAt: Date;      // Дата обновления
}
```

### AuthResult

```typescript
interface AuthResult {
  user: User;
  isNewUser: boolean;  // true если пользователь только что создан
}
```
