# Сообщения

## Обзор

Пользователи могут обмениваться сообщениями после мэтча. Каждый чат привязан к мэтчу.

---

## Queries

### `messagesByMatch` - История сообщений

Возвращает сообщения для конкретного мэтча с пагинацией.

```graphql
query MessagesByMatch($matchId: String!, $limit: Int, $offset: Int) {
  messagesByMatch(matchId: $matchId, limit: $limit, offset: $offset) {
    id
    matchId
    senderId
    content
    isRead
    createdAt
  }
}
```

**Параметры:**
| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| matchId | String! | - | ID мэтча |
| limit | Int | 50 | Количество сообщений |
| offset | Int | 0 | Смещение |

**Пример ответа:**
```json
{
  "data": {
    "messagesByMatch": [
      {
        "id": "msg123",
        "matchId": "match456",
        "senderId": "user1",
        "content": "Привет!",
        "isRead": true,
        "createdAt": "2024-01-15T12:00:00.000Z"
      },
      {
        "id": "msg124",
        "matchId": "match456",
        "senderId": "user2",
        "content": "Привет! Как дела?",
        "isRead": false,
        "createdAt": "2024-01-15T12:01:00.000Z"
      }
    ]
  }
}
```

---

### `unreadMessagesCount` - Количество непрочитанных

```graphql
query UnreadMessagesCount($matchId: String!, $userId: String!) {
  unreadMessagesCount(matchId: $matchId, userId: $userId)
}
```

**Параметры:**
- `matchId` - ID мэтча
- `userId` - ID текущего пользователя (считает сообщения от другого)

**Пример ответа:**
```json
{
  "data": {
    "unreadMessagesCount": 3
  }
}
```

---

## Мутации

### `sendMessage` - Отправить сообщение

```graphql
mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    id
    matchId
    senderId
    content
    isRead
    createdAt
  }
}
```

**Input:**
```json
{
  "matchId": "match123",
  "senderId": "myUserId",
  "content": "Привет! Как дела?"
}
```

**Пример ответа:**
```json
{
  "data": {
    "sendMessage": {
      "id": "msg789",
      "matchId": "match123",
      "senderId": "user1",
      "content": "Привет! Как дела?",
      "isRead": false,
      "createdAt": "2024-01-15T12:05:00.000Z"
    }
  }
}
```

---

### `markMessageAsRead` - Отметить как прочитанное

```graphql
mutation MarkMessageAsRead($messageId: String!) {
  markMessageAsRead(messageId: $messageId) {
    id
    isRead
  }
}
```

---

### `markAllMessagesAsRead` - Прочитать все

Отмечает все сообщения от другого пользователя как прочитанные.

```graphql
mutation MarkAllMessagesAsRead($matchId: String!, $userId: String!) {
  markAllMessagesAsRead(matchId: $matchId, userId: $userId)
}
```

**Параметры:**
- `matchId` - ID мэтча
- `userId` - ID текущего пользователя

**Ответ:**
```json
{
  "data": {
    "markAllMessagesAsRead": true
  }
}
```

---

## Типы

### Message

```typescript
interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}
```

### SendMessageInput

```typescript
interface SendMessageInput {
  matchId: string;
  senderId: string;
  content: string;
}
```

---

## Пример: Чат

```typescript
// ID текущего пользователя и мэтча
const myUserId = "user1";
const matchId = "match123";

// 1. Загружаем историю сообщений
async function loadMessages() {
  const { data } = await graphql({
    query: `query MessagesByMatch($matchId: String!, $limit: Int, $offset: Int) {
      messagesByMatch(matchId: $matchId, limit: $limit, offset: $offset) {
        id
        senderId
        content
        isRead
        createdAt
      }
    }`,
    variables: { matchId, limit: 50, offset: 0 }
  });

  return data.messagesByMatch;
}

// 2. Отправляем сообщение
async function sendMessage(content: string) {
  const { data } = await graphql({
    query: `mutation SendMessage($input: SendMessageInput!) {
      sendMessage(input: $input) {
        id
        content
        createdAt
      }
    }`,
    variables: {
      input: {
        matchId,
        senderId: myUserId,
        content
      }
    }
  });

  return data.sendMessage;
}

// 3. Отмечаем все как прочитанные при открытии чата
async function markAllAsRead() {
  await graphql({
    query: `mutation MarkAllMessagesAsRead($matchId: String!, $userId: String!) {
      markAllMessagesAsRead(matchId: $matchId, userId: $userId)
    }`,
    variables: { matchId, userId: myUserId }
  });
}

// 4. Получаем количество непрочитанных для badge
async function getUnreadCount() {
  const { data } = await graphql({
    query: `query UnreadMessagesCount($matchId: String!, $userId: String!) {
      unreadMessagesCount(matchId: $matchId, userId: $userId)
    }`,
    variables: { matchId, userId: myUserId }
  });

  return data.unreadMessagesCount;
}
```

---

## Пример: Список чатов

```typescript
// Загружаем все мэтчи с последним сообщением и непрочитанными
async function loadChats(myUserId: string) {
  // 1. Получаем все мэтчи
  const { data: matchesData } = await graphql({
    query: `query MatchesByUser($userId: String!) {
      matchesByUser(userId: $userId) {
        id
        user1Id
        user2Id
        isActive
      }
    }`,
    variables: { userId: myUserId }
  });

  const chats = [];

  for (const match of matchesData.matchesByUser) {
    // 2. Получаем последнее сообщение
    const { data: messagesData } = await graphql({
      query: `query MessagesByMatch($matchId: String!) {
        messagesByMatch(matchId: $matchId, limit: 1) {
          content
          senderId
          createdAt
        }
      }`,
      variables: { matchId: match.id }
    });

    // 3. Получаем количество непрочитанных
    const { data: unreadData } = await graphql({
      query: `query UnreadMessagesCount($matchId: String!, $userId: String!) {
        unreadMessagesCount(matchId: $matchId, userId: $userId)
      }`,
      variables: { matchId: match.id, userId: myUserId }
    });

    // 4. Определяем ID собеседника
    const partnerId = match.user1Id === myUserId ? match.user2Id : match.user1Id;

    // 5. Получаем профиль собеседника
    const { data: profileData } = await graphql({
      query: `query ProfileByUserId($userId: ID!) {
        profileByUserId(userId: $userId) {
          name
          photos
        }
      }`,
      variables: { userId: partnerId }
    });

    chats.push({
      matchId: match.id,
      partnerId,
      partnerName: profileData.profileByUserId?.name,
      partnerPhoto: profileData.profileByUserId?.photos[0],
      lastMessage: messagesData.messagesByMatch[0],
      unreadCount: unreadData.unreadMessagesCount
    });
  }

  // Сортируем по времени последнего сообщения
  return chats.sort((a, b) => {
    const timeA = a.lastMessage?.createdAt || 0;
    const timeB = b.lastMessage?.createdAt || 0;
    return new Date(timeB) - new Date(timeA);
  });
}
```

---

## Флоу сообщений

```
┌─────────────────┐
│  Список мэтчей  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Выбор чата     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ markAllAsRead   │
│ (при открытии)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ messagesByMatch │
│ (загрузка)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Отображение    │
│  сообщений      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  sendMessage    │
│  (отправка)     │
└─────────────────┘
```

---

## Заметки

- Сообщения сортируются по `createdAt` DESC (новые первые)
- `isRead` показывает прочитано ли сообщение получателем
- Real-time обновления пока не реализованы (нужен polling или WebSocket)
- Для списка чатов рекомендуется кэшировать данные на клиенте
