-- NextBit Updates — canonical PostgreSQL schema.
-- Auto-generated from server/db.mjs and server/features.mjs (runtime initialization).
-- Safe to run on a fresh Supabase project: all statements are idempotent.
-- The server also self-initializes at boot; this file makes fresh setup reproducible
-- and documents the schema drift fix (all runtime tables now live here).
CREATE TABLE IF NOT EXISTS users(id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'user',status TEXT NOT NULL DEFAULT 'active',last_login_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;CREATE TABLE IF NOT EXISTS articles(id TEXT PRIMARY KEY,slug TEXT UNIQUE NOT NULL,category TEXT NOT NULL,title TEXT NOT NULL,summary TEXT NOT NULL,image_url TEXT,body TEXT,source_url TEXT,author TEXT,status TEXT NOT NULL DEFAULT 'draft',verified BOOLEAN NOT NULL DEFAULT FALSE,published_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());ALTER TABLE articles ADD COLUMN IF NOT EXISTS body TEXT;ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_url TEXT;ALTER TABLE articles ADD COLUMN IF NOT EXISTS author TEXT;ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';CREATE TABLE IF NOT EXISTS roadmaps(id TEXT PRIMARY KEY,title TEXT NOT NULL,group_name TEXT NOT NULL,description TEXT NOT NULL,stages JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,title TEXT NOT NULL,tech TEXT NOT NULL,level TEXT NOT NULL,duration TEXT NOT NULL,parts TEXT NOT NULL,image_url TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS bookmarks(user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(user_id,article_id));CREATE TABLE IF NOT EXISTS newsletter_subscribers(id BIGSERIAL PRIMARY KEY,email TEXT UNIQUE NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS contact_messages(id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'new',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS analytics_events(id BIGSERIAL PRIMARY KEY,user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,event_name TEXT NOT NULL,path TEXT,metadata JSONB,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS news_items(id TEXT PRIMARY KEY,canonical_url TEXT UNIQUE NOT NULL,title TEXT NOT NULL,summary TEXT,category TEXT NOT NULL,source_name TEXT NOT NULL,source_type TEXT NOT NULL,published_at TIMESTAMPTZ NOT NULL,fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),image_url TEXT);CREATE TABLE IF NOT EXISTS sources(id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,url TEXT NOT NULL UNIQUE,reliability TEXT NOT NULL DEFAULT 'unverified',verification_notes TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS admin_actions(id BIGSERIAL PRIMARY KEY,admin_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,action TEXT NOT NULL,target_type TEXT,target_id TEXT,metadata JSONB,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

CREATE TABLE IF NOT EXISTS ai_tools(id TEXT PRIMARY KEY,name TEXT NOT NULL,category TEXT NOT NULL,description TEXT NOT NULL,url TEXT NOT NULL UNIQUE,tags TEXT[] NOT NULL DEFAULT '{}',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
  CREATE TABLE IF NOT EXISTS votes(target_id TEXT NOT NULL,kind TEXT NOT NULL CHECK (kind IN ('story','tool')),voter TEXT NOT NULL,value INT NOT NULL CHECK (value IN (-1,1)),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY (target_id,kind,voter));
  CREATE INDEX IF NOT EXISTS votes_target_idx ON votes (kind, target_id);
  CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,title TEXT NOT NULL,kind TEXT NOT NULL,url TEXT,location TEXT,starts_at TIMESTAMPTZ NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

CREATE TABLE IF NOT EXISTS categories(id TEXT PRIMARY KEY,name TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
  CREATE TABLE IF NOT EXISTS tags(id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
  CREATE TABLE IF NOT EXISTS article_tags(article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,PRIMARY KEY(article_id,tag_id));
  CREATE TABLE IF NOT EXISTS comments(id BIGSERIAL PRIMARY KEY,article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,author_name TEXT NOT NULL,parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,body TEXT NOT NULL CHECK(char_length(body) BETWEEN 2 AND 2000),hidden BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
  CREATE INDEX IF NOT EXISTS comments_article_idx ON comments(article_id,created_at);
  CREATE INDEX IF NOT EXISTS comments_parent_idx ON comments(parent_id);
  CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(status,published_at DESC);


-- Runtime tables / columns used by image upload, site settings, newsletter and job board.
-- Keep this schema suitable for a fresh Supabase project, not just an already-running app.
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS prefs JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS media_files (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  data TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT site_settings_one_row CHECK (id = 1)
);
INSERT INTO site_settings(id, data) VALUES (1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  company VARCHAR(80) NOT NULL,
  location VARCHAR(80) DEFAULT 'Remote',
  workplace VARCHAR(10) DEFAULT 'remote',
  tag VARCHAR(20) DEFAULT 'AI',
  salary_min INT DEFAULT 0,
  salary_max INT DEFAULT 0,
  currency VARCHAR(8) DEFAULT 'USD',
  stack TEXT[] NOT NULL DEFAULT '{}',
  apply_url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status VARCHAR(10) NOT NULL DEFAULT 'live',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INT NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS news_items_published_idx ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS admin_actions_created_idx ON admin_actions(created_at DESC);
