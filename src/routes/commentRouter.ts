import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { cassandraClient } from '../db/client';
import { calculateScore } from '../lib/ranking';
import { publicProcedure, router } from '../trpc';

const CommentInput = z.object({
  videoId: z.string(),
  userId: z.string(),
  content: z.string().min(1),
});

type CommentRow = {
  video_id: string;
  comment_id: string;
  user_id: string;
  content: string;
  likes: number;
  dislikes: number;
  created_at: Date;
};

export const commentRouter = router({
  postComment: publicProcedure.input(CommentInput).mutation(async ({ input }) => {
    const commentId = uuid();
    const query = `INSERT INTO comments_by_video (video_id, comment_id, user_id, content, likes, dislikes, created_at)
                   VALUES (?, ?, ?, ?, 0, 0, toTimestamp(now()))`;
    await cassandraClient.execute(query, [input.videoId, commentId, input.userId, input.content], { prepare: true });
    return { commentId };
  }),

  getComments: publicProcedure
    .input(
      z.object({
        videoId: z.string(),
        sort: z.enum(['top', 'new']).default('top'),
      }),
    )
    .query(async ({ input }) => {
      const rows = (
        await cassandraClient.execute(
          'SELECT * FROM comments_by_video WHERE video_id = ? LIMIT 100',
          [input.videoId],
          { prepare: true },
        )
      ).rows as CommentRow[];

      const enriched = rows.map((r) => ({
        ...r,
        score: calculateScore(r.likes, r.dislikes, r.created_at),
      }));

      return enriched.sort((a, b) => {
        if (input.sort === 'new') return b.created_at.getTime() - a.created_at.getTime();
        return b.score - a.score;
      });
    }),

  likeComment: publicProcedure
    .input(z.object({ commentId: z.string().uuid(), userId: z.string(), isLike: z.boolean() }))
    .mutation(async ({ input }) => {
      const likeQuery = 'INSERT INTO likes_by_comment (comment_id, user_id, is_like) VALUES (?, ?, ?)';
      await cassandraClient.execute(likeQuery, [input.commentId, input.userId, input.isLike], { prepare: true });

      // Update counts atomically is harder; for simplicity fetch and update
      const select = 'SELECT video_id, likes, dislikes FROM comments_by_video WHERE comment_id = ? ALLOW FILTERING';
      const row = (await cassandraClient.execute(select, [input.commentId], { prepare: true })).first();
      if (!row) throw new Error('Comment not found');

      const newLikes = row.likes + (input.isLike ? 1 : 0);
      const newDislikes = row.dislikes + (input.isLike ? 0 : 1);

      await cassandraClient.execute(
        'UPDATE comments_by_video SET likes = ?, dislikes = ? WHERE video_id = ? AND comment_id = ?',
        [newLikes, newDislikes, row.video_id, input.commentId],
        { prepare: true },
      );
      return { success: true };
    }),

  editComment: publicProcedure
    .input(z.object({ commentId: z.string().uuid(), userId: z.string(), newContent: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const select = 'SELECT video_id, user_id FROM comments_by_video WHERE comment_id = ? ALLOW FILTERING';
      const row = (await cassandraClient.execute(select, [input.commentId], { prepare: true })).first() as CommentRow | undefined;
      if (!row) throw new Error('Comment not found');
      if (row.user_id !== input.userId) throw new Error('Unauthorized');

      await cassandraClient.execute(
        'UPDATE comments_by_video SET content = ? WHERE video_id = ? AND comment_id = ?',
        [input.newContent, row.video_id, input.commentId],
        { prepare: true },
      );
      return { success: true };
    }),
});
