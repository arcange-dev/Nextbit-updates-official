-- NextBit Updates / Supabase PostgreSQL schema
-- Run in Supabase Dashboard -> SQL Editor.
-- The Render backend connects with DATABASE_URL.

create table if not exists public.users (
  id bigserial primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'user',
  status text not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key, slug text unique not null, category text not null,
  title text not null, summary text not null, image_url text, body text,
  source_url text, author text, status text not null default 'draft',
  verified boolean not null default false, published_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.roadmaps (id text primary key,title text not null,group_name text not null,description text not null,stages jsonb not null,created_at timestamptz not null default now());
create table if not exists public.projects (id text primary key,title text not null,tech text not null,level text not null,duration text not null,parts text not null,image_url text,created_at timestamptz not null default now());
create table if not exists public.bookmarks (user_id bigint not null references public.users(id) on delete cascade,article_id text not null references public.articles(id) on delete cascade,created_at timestamptz not null default now(),primary key (user_id,article_id));
create table if not exists public.newsletter_subscribers (id bigserial primary key,email text unique not null,created_at timestamptz not null default now());
create table if not exists public.contact_messages (id bigserial primary key,name text not null,email text not null,message text not null,status text not null default 'new',created_at timestamptz not null default now());
create table if not exists public.analytics_events (id bigserial primary key,user_id bigint references public.users(id) on delete set null,event_name text not null,path text,metadata jsonb,created_at timestamptz not null default now());
create table if not exists public.sources (id bigserial primary key,name text not null,url text not null unique,reliability text not null default 'unverified',verification_notes text,created_at timestamptz not null default now());
create table if not exists public.admin_actions (id bigserial primary key,admin_user_id bigint references public.users(id) on delete set null,action text not null,target_type text,target_id text,metadata jsonb,created_at timestamptz not null default now());
create table if not exists public.news_items (id text primary key,canonical_url text unique not null,title text not null,summary text,category text not null,source_name text not null,source_type text not null,published_at timestamptz not null,fetched_at timestamptz not null default now(),image_url text);

alter table public.users add column if not exists status text not null default 'active';
alter table public.users add column if not exists last_login_at timestamptz;
alter table public.articles add column if not exists body text;
alter table public.articles add column if not exists source_url text;
alter table public.articles add column if not exists author text;
alter table public.articles add column if not exists status text not null default 'draft';

create index if not exists idx_articles_status_published on public.articles(status, published_at desc);
create index if not exists idx_articles_category on public.articles(category);
create index if not exists idx_roadmaps_group on public.roadmaps(group_name);
create index if not exists idx_news_items_published on public.news_items(published_at desc);
create index if not exists idx_news_items_category on public.news_items(category);
create index if not exists idx_admin_actions_created on public.admin_actions(created_at desc);

alter table public.users enable row level security;
alter table public.articles enable row level security;
alter table public.roadmaps enable row level security;
alter table public.projects enable row level security;
alter table public.bookmarks enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.analytics_events enable row level security;
alter table public.sources enable row level security;
alter table public.admin_actions enable row level security;
alter table public.news_items enable row level security;
