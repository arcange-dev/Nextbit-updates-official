import pg from "pg";import dotenv from "dotenv";import bcrypt from "bcryptjs";import{ARTICLES,PROJECTS,ROADMAPS}from "./data.mjs";dotenv.config();
const{Pool}=pg;
let connectionString=process.env.DATABASE_URL||"";
// Supabase retired the legacy pooler hostnames (e.g. eu-west-1.pooler.supabase.com -> ENOTFOUND).
// Rewrite legacy hosts to the current aws-0-<region> pooler so existing DATABASE_URL values keep working.
// Optional: SUPABASE_DB_PASSWORD overrides just the password inside DATABASE_URL (properly URL-encoded).
// Lets you fix the connection by pasting only the database password from Supabase.
if(connectionString&&process.env.SUPABASE_DB_PASSWORD){const _pw=process.env.SUPABASE_DB_PASSWORD;connectionString=connectionString.replace(/^([a-z][a-z0-9+.-]*:\/\/[^:@/]+):[^@]*@/i,(m,prefix)=>prefix+":"+encodeURIComponent(_pw)+"@");console.log("[NextBit] database password overridden from SUPABASE_DB_PASSWORD.");}
if(connectionString){connectionString=connectionString.replace(/(^|[.@/])([a-z0-9-]+)\.pooler\.supabase\.com/,(m,pre,region)=>{if(/^aws-/.test(region))return m;console.log("[NextBit] rewriting legacy Supabase pooler host for region",region);return pre+"aws-0-"+region+".pooler.supabase.com"});}
let parsedDatabaseInfo=null;
try{if(connectionString){const u=new URL(connectionString);parsedDatabaseInfo={host:u.hostname,port:u.port||"5432",database:u.pathname.replace(/^\//,"")||"postgres",user:u.username};}}catch{}
export const pool=connectionString?new Pool({connectionString,max:Number(process.env.DB_POOL_MAX||5),idleTimeoutMillis:30000,connectionTimeoutMillis:Number(process.env.DB_CONNECTION_TIMEOUT||20000),keepAlive:true,ssl:{rejectUnauthorized:false}}):null;
export const hasDatabase=()=>Boolean(pool);
export const databaseInfo=()=>parsedDatabaseInfo;
export async function verifyDatabaseConnection({retries=5,delayMs=2500}={}){
  if(!pool)return{ok:false,error:"DATABASE_URL is not configured"};
  let lastError=null;
  for(let attempt=1;attempt<=retries;attempt++){
    try{await pool.query("SELECT 1");return{ok:true,attempt,info:parsedDatabaseInfo}}
    catch(error){
      lastError=error;const msg=String(error.message||"");
      if(/password|authentication|28P01|ECIRCUITBREAKER/i.test(msg)&&!/ENOTFOUND|ECONNREFUSED|ETIMEDOUT/.test(msg)){
        return{ok:false,error:"The database password was rejected by Supabase. Copy the Session pooler connection string from Supabase > Project Settings > Database (reset the database password if needed), then update DATABASE_URL on Render.",info:parsedDatabaseInfo};
      }
      if(attempt<retries)await new Promise(r=>setTimeout(r,delayMs))
    }
  }
  return{ok:false,error:lastError?.message||"Database connection failed",info:parsedDatabaseInfo};
}
export async function q(text,params=[]){if(!pool)throw new Error("DATABASE_URL is not configured");return pool.query(text,params)}
export async function initDb(){if(!pool){console.warn("[NextBit] DATABASE_URL missing; API database features are disabled.");return false}const check=await verifyDatabaseConnection();if(!check.ok){console.error("[NextBit] PostgreSQL connection failed after retries.",{error:check.error,info:check.info});return false}await q(`CREATE TABLE IF NOT EXISTS users(id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'user',status TEXT NOT NULL DEFAULT 'active',last_login_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;CREATE TABLE IF NOT EXISTS articles(id TEXT PRIMARY KEY,slug TEXT UNIQUE NOT NULL,category TEXT NOT NULL,title TEXT NOT NULL,summary TEXT NOT NULL,image_url TEXT,body TEXT,source_url TEXT,author TEXT,status TEXT NOT NULL DEFAULT 'draft',verified BOOLEAN NOT NULL DEFAULT FALSE,published_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());ALTER TABLE articles ADD COLUMN IF NOT EXISTS body TEXT;ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_url TEXT;ALTER TABLE articles ADD COLUMN IF NOT EXISTS author TEXT;ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';CREATE TABLE IF NOT EXISTS roadmaps(id TEXT PRIMARY KEY,title TEXT NOT NULL,group_name TEXT NOT NULL,description TEXT NOT NULL,stages JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,title TEXT NOT NULL,tech TEXT NOT NULL,level TEXT NOT NULL,duration TEXT NOT NULL,parts TEXT NOT NULL,image_url TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS bookmarks(user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(user_id,article_id));CREATE TABLE IF NOT EXISTS newsletter_subscribers(id BIGSERIAL PRIMARY KEY,email TEXT UNIQUE NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS contact_messages(id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'new',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS analytics_events(id BIGSERIAL PRIMARY KEY,user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,event_name TEXT NOT NULL,path TEXT,metadata JSONB,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS news_items(id TEXT PRIMARY KEY,canonical_url TEXT UNIQUE NOT NULL,title TEXT NOT NULL,summary TEXT,category TEXT NOT NULL,source_name TEXT NOT NULL,source_type TEXT NOT NULL,published_at TIMESTAMPTZ NOT NULL,fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),image_url TEXT);CREATE TABLE IF NOT EXISTS sources(id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,url TEXT NOT NULL UNIQUE,reliability TEXT NOT NULL DEFAULT 'unverified',verification_notes TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS media_files(id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,mime TEXT NOT NULL,size INTEGER NOT NULL DEFAULT 0,data TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS admin_actions(id BIGSERIAL PRIMARY KEY,admin_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,action TEXT NOT NULL,target_type TEXT,target_id TEXT,metadata JSONB,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);  // Create the public Supabase storage bucket for image uploads (idempotent; needs no service key).
  try { await q("INSERT INTO storage.buckets (id, name, public) VALUES ('media','media',true) ON CONFLICT (id) DO NOTHING;"); console.log('[NextBit] media bucket ready (Supabase storage: media, public).') } catch (e) { console.warn('[NextBit] Could not create the storage bucket via SQL (the DB-backed fallback will be used):', e?.message || e) }

const ac=await q("SELECT COUNT(*)::int AS c FROM articles");
if(process.env.ADMIN_EMAIL){
  const existing=await q("SELECT id FROM users WHERE email=LOWER($1)",[process.env.ADMIN_EMAIL]);
  if(existing.rowCount){
    await q("UPDATE users SET role='admin',status='active' WHERE email=LOWER($1)",[process.env.ADMIN_EMAIL]);
  }else if(process.env.ADMIN_PASSWORD){
    const adminPasswordHash=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);
    await q("INSERT INTO users(name,email,password_hash,role,status) VALUES($1,LOWER($2),$3,'admin','active')",["NextBit Administrator",process.env.ADMIN_EMAIL,adminPasswordHash]);
    console.log("[NextBit] administrator account created from Render secrets.");
  }else{
    console.warn("[NextBit] ADMIN_EMAIL is set but ADMIN_PASSWORD is missing; admin account has not been created.");
  }
}if(ac.rows[0].c===0)for(const a of ARTICLES)await q("INSERT INTO articles(id,slug,category,title,summary,image_url,body,author,status,verified,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) ON CONFLICT DO NOTHING",[a.id,a.slug,a.category,a.title,a.summary,a.image_url,"Technology intelligence article body.","NextBit Desk","published",a.verified]);
const rc=await q("SELECT COUNT(*)::int AS c FROM roadmaps");if(rc.rows[0].c===0)for(const r of ROADMAPS)await q("INSERT INTO roadmaps(id,title,group_name,description,stages) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",[r.id,r.title,r.group,r.description,JSON.stringify(r.stages)]);
const pc=await q("SELECT COUNT(*)::int AS c FROM projects");if(pc.rows[0].c===0)for(const p of PROJECTS)await q("INSERT INTO projects(id,title,tech,level,duration,parts,image_url) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING",[p.id,p.title,p.tech,p.level,p.duration,p.parts,p.image_url]);await initFeatureTables();await initCommunityTables();return true}
// ---- Feature tables (AI directory, votes, tech events) ----
// Idempotent migration, runs on every boot like the tables above.
export async function initFeatureTables(){
  await q(`CREATE TABLE IF NOT EXISTS ai_tools(id TEXT PRIMARY KEY,name TEXT NOT NULL,category TEXT NOT NULL,description TEXT NOT NULL,url TEXT NOT NULL UNIQUE,tags TEXT[] NOT NULL DEFAULT '{}',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
  CREATE TABLE IF NOT EXISTS votes(target_id TEXT NOT NULL,kind TEXT NOT NULL CHECK (kind IN ('story','tool')),voter TEXT NOT NULL,value INT NOT NULL CHECK (value IN (-1,1)),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY (target_id,kind,voter));
  CREATE INDEX IF NOT EXISTS votes_target_idx ON votes (kind, target_id);
  CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,title TEXT NOT NULL,kind TEXT NOT NULL,url TEXT,location TEXT,starts_at TIMESTAMPTZ NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);
  const tc=await q("SELECT COUNT(*)::int AS c FROM ai_tools");
  if(tc.rows[0].c===0){
    const tools=[["gpt-4o","GPT-4o","LLM","OpenAI's flagship multimodal model for text, vision and audio reasoning.","https://openai.com/gpt-4o",["api","multimodal"]],
    ["claude","Claude","LLM","Anthropic's assistant family, strong at long-context reasoning and code.","https://claude.ai",["api","agents"]],
    ["ollama","Ollama","Local LLM","Run open models like Llama and Mistral locally with a one-line install.","https://ollama.com",["local","open-source"]],
    ["cursor","Cursor","Coding","AI-first code editor with repo-aware autocomplete and agent edits.","https://cursor.com",["ide","agents"]],
    ["pytorch","PyTorch","ML Framework","The dominant deep-learning framework for research and production.","https://pytorch.org",["python","training"]],
    ["huggingface","Hugging Face","Model Hub","The central repository for open models, datasets and inference APIs.","https://huggingface.co",["models","datasets"]],
    ["langchain","LangChain","Agents","Framework for building LLM applications, RAG pipelines and tool-using agents.","https://langchain.com",["rag","orchestration"]],
    ["vllm","vLLM","Serving","High-throughput LLM inference server with PagedAttention.","https://docs.vllm.ai",["inference","production"]],
    ["midjourney","Midjourney","Image","State-of-the-art image generation for creative and editorial workflows.","https://midjourney.com",["image","creative"]],
    ["whisper","Whisper","Speech","OpenAI's open-source speech-to-text, runs locally in many languages.","https://github.com/openai/whisper",["audio","open-source"]]];
    for(const[id,name,category,description,url,tags]of tools)await q("INSERT INTO ai_tools(id,name,category,description,url,tags) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING",[id,name,category,description,url,tags]);
  }
  const ec=await q("SELECT COUNT(*)::int AS c FROM events");
  if(ec.rows[0].c===0){
    const events=[["foss4g-2026","FOSS4G Africa","Conference","https://foss4g.africa","Kigali, Rwanda","2026-11-18T08:00:00Z"],
    ["ai-everything-2026","AI Everything Summit","Conference","https://ai-everything.com","Dubai, UAE","2026-12-08T08:00:00Z"],
    ["hackrwanda-2026","HackRwanda 48h Hackathon","Hackathon","https://hackrwanda.dev","Kigali, Rwanda","2026-11-06T09:00:00Z"],
    ["websummit-2026","Web Summit","Conference","https://websummit.com","Lisbon, Portugal","2026-11-02T08:00:00Z"],
    ["ces-2027","CES 2027","Release","https://ces.tech","Las Vegas, USA","2027-01-06T08:00:00Z"]];
    for(const[id,title,kind,url,location,starts_at]of events)await q("INSERT INTO events(id,title,kind,url,location,starts_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING",[id,title,kind,url,location,starts_at]);
  }
}

// ---- Community tables (categories, tags, comments) ----
// Idempotent migration for the MVP social layer: taxonomies for article
// filtering plus a threaded (one-level-reply) comment engine.
export async function initCommunityTables(){
  if(!pool) return;
  // Best-effort trigram search index. Managed Postgres (Render/Neon) may
  // restrict CREATE EXTENSION, so degrade silently to ILIKE search.
  try{
    await q("CREATE EXTENSION IF NOT EXISTS pg_trgm");
    await q("CREATE INDEX IF NOT EXISTS articles_title_trgm ON articles USING gin (title gin_trgm_ops)");
    await q("CREATE INDEX IF NOT EXISTS articles_summary_trgm ON articles USING gin (summary gin_trgm_ops)");
  }catch(e){ console.warn("[NextBit] pg_trgm search indexes unavailable, using ILIKE fallback:", e.message); }
  await q(`CREATE TABLE IF NOT EXISTS categories(id TEXT PRIMARY KEY,name TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
  CREATE TABLE IF NOT EXISTS tags(id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
  CREATE TABLE IF NOT EXISTS article_tags(article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,PRIMARY KEY(article_id,tag_id));
  CREATE TABLE IF NOT EXISTS comments(id BIGSERIAL PRIMARY KEY,article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,author_name TEXT NOT NULL,parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,body TEXT NOT NULL CHECK(char_length(body) BETWEEN 2 AND 2000),hidden BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
  CREATE INDEX IF NOT EXISTS comments_article_idx ON comments(article_id,created_at);
  CREATE INDEX IF NOT EXISTS comments_parent_idx ON comments(parent_id);
  CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(status,published_at DESC);`);
  // Backfill the taxonomy from existing article categories so the filter UI
  // has data on first boot.
  const cats = await q("SELECT DISTINCT category FROM articles");
  for(const {category} of cats.rows){
    const id = String(category).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    if(!id) continue;
    await q("INSERT INTO categories(id,name) VALUES($1,$2) ON CONFLICT DO NOTHING",[id,category]);
    await q("INSERT INTO tags(id,name) VALUES($1,$2) ON CONFLICT DO NOTHING",[id,category]);
    await q(`INSERT INTO article_tags(article_id,tag_id) SELECT id,$1 FROM articles WHERE category=$2 ON CONFLICT DO NOTHING`,[id,category]);
  }
}
