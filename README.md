# YouTube-Style Comment Backend

A minimal tRPC + Express + ScyllaDB backend that supports posting, retrieving, liking, and editing comments on a video.

## 🏃‍♂️ Quick Start

```bash
# 1. Install deps
npm install

# 2. Copy env file
cp .env.example .env
# edit if your Scylla cluster is not on localhost

# 3. Create keyspace & tables inside cqlsh
cqlsh -f db-schema.cql

# 4. Seed demo data (optional)
npm run seed

# 5. Start dev server
npm run dev
```

Server listens on `http://localhost:4000/trpc`.

## 📑 API Examples (using tRPC HTTP JSON)

All endpoints use POST with a JSON body `{ "input": <params> }`.

### 1. Post comment

```
POST /trpc/comment.postComment
{
  "input": { "videoId": "video123", "userId": "alice", "content": "Great!" }
}
```

### 2. Get comments, sorted by top

```
POST /trpc/comment.getComments
{
  "input": { "videoId": "video123", "sort": "top" }
}
```

### 3. Like a comment

```
POST /trpc/comment.likeComment
{
  "input": { "commentId": "<uuid>", "userId": "bob", "isLike": true }
}
```

### 4. Edit comment

```
POST /trpc/comment.editComment
{
  "input": { "commentId": "<uuid>", "userId": "alice", "newContent": "Updated text" }
}
```

## 🗂️ Project Structure

- `src/` – source TypeScript
  - `db/` – Scylla client
  - `routes/` – tRPC routers
  - `lib/` – pure helpers (ranking)
- `db-schema.cql` – Keyspace + table DDL
- `seed.ts` – optional seeding script

## 📊 Ranking Algorithm

```
score = likes - dislikes + max(0, 10 - hoursSincePosted)
```

Used when `sort = 'top'`.
