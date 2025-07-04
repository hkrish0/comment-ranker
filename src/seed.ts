import { cassandraClient, initDB } from './db/client';
import { v4 as uuid } from 'uuid';

async function seed() {
  await initDB();
  const videoId = 'video123';
  const comments = [
    { userId: 'alice', content: 'Great video!' },
    { userId: 'bob', content: 'Nice explanation.' },
    { userId: 'carol', content: 'Could be shorter.' },
  ];

  for (const c of comments) {
    const commentId = uuid();
    await cassandraClient.execute(
      `INSERT INTO comments_by_video (video_id, comment_id, user_id, content, likes, dislikes, created_at)
      VALUES (?, ?, ?, ?, 0, 0, toTimestamp(now()))`,
      [videoId, commentId, c.userId, c.content],
      { prepare: true },
    );
  }
  console.log('Seed completed');
  process.exit(0);
}

seed();
