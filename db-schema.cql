-- Keyspace
CREATE KEYSPACE IF NOT EXISTS comments_keyspace WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE comments_keyspace;

-- Table to store comments by video
CREATE TABLE IF NOT EXISTS comments_by_video (
  video_id text,
  comment_id uuid,
  user_id text,
  content text,
  likes int,
  dislikes int,
  created_at timestamp,
  PRIMARY KEY (video_id, comment_id)
) WITH CLUSTERING ORDER BY (comment_id DESC);

-- Table to store likes/dislikes per comment
CREATE TABLE IF NOT EXISTS likes_by_comment (
  comment_id uuid,
  user_id text,
  is_like boolean,
  PRIMARY KEY (comment_id, user_id)
);

-- Optional: replies
-- CREATE TABLE IF NOT EXISTS replies_by_comment (
--   parent_comment_id uuid,
--   reply_id uuid,
--   user_id text,
--   content text,
--   created_at timestamp,
--   PRIMARY KEY (parent_comment_id, reply_id)
-- ) WITH CLUSTERING ORDER BY (reply_id DESC);
