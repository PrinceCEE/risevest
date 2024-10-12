const up = `
  -- Create Users table
  CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Create Posts table
  CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      user_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Create Comments table
  CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY,
      content TEXT NOT NULL,
      user_id UUID NOT NULL,
      post_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
  );

  -- Create indexes
  -- CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
  -- CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
  -- CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
`;

const down = `
  -- Drop indexes
  DROP INDEX IF EXISTS idx_comments_post_id;
  DROP INDEX IF EXISTS idx_comments_user_id;
  DROP INDEX IF EXISTS idx_posts_user_id;

  -- Drop tables
  DROP TABLE IF EXISTS comments;
  DROP TABLE IF EXISTS posts;
  DROP TABLE IF EXISTS users;
`;

export const migration = { up, down };
