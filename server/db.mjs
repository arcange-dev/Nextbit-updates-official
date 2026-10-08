import pg from "pg";import dotenv from "dotenv";import bcrypt from "bcryptjs";import{ARTICLES,PROJECTS,ROADMAPS}from "./data.mjs";dotenv.config();
const{Pool}=pg;const connectionString=process.env.DATABASE_URL||"";
let parsedDatabaseInfo=null;
try{if(connectionString){const u=new URL(connectionString);parsedDatabaseInfo={host:u.hostname,port:u.port||"5432",database:u.pathname.replace(/^\//,"")||"postgres",user:u.username};}}catch{}
export const pool=connectionString?new Pool({connectionString,max:Number(process.env.DB_POOL_MAX||5),idleTimeoutMillis:30000,connectionTimeoutMillis:Number(process.env.DB_CONNECTION_TIMEOUT||20000),keepAlive:true,ssl:{rejectUnauthorized:false}}):null;
export const hasDatabase=()=>Boolean(pool);
export const databaseInfo=()=>parsedDatabaseInfo;
export async function verifyDatabaseConnection({retries=5,delayMs=2500}={}){
  if(!pool)return{ok:false,error:"DATABASE_URL is not configured"};
  let lastError=null;
  for(let attempt=1;attempt<=retries;attempt++){
    try{await pool.query("SELECT 1");return{ok:true,attempt,info:parsedDatabaseInfo}}catch(error){lastError=error;if(attempt<retries)await new Promise(r=>setTimeout(r,delayMs));}
  }
  return{ok:false,error:lastError?.message||"Database connection failed",info:parsedDatabaseInfo};
}
export async function q(text,params=[]){if(!pool)throw new Error("DATABASE_URL is not configured");return pool.query(text,params)}
export async function initDb(){if(!pool){console.warn("[NextBit] DATABASE_URL missing; API database features are disabled.");return false}const check=await verifyDatabaseConnection();if(!check.ok){console.error("[NextBit] PostgreSQL connection failed after retries.",{error:check.error,info:check.info});return false}await q(`CREATE TABLE IF NOT EXISTS users(id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'user',status TEXT NOT NULL DEFAULT 'active',last_login_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;CREATE TABLE IF NOT EXISTS articles(id TEXT PRIMARY KEY,slug TEXT UNIQUE NOT NULL,category TEXT NOT NULL,title TEXT NOT NULL,summary TEXT NOT NULL,image_url TEXT,body TEXT,source_url TEXT,author TEXT,status TEXT NOT NULL DEFAULT 'draft',verified BOOLEAN NOT NULL DEFAULT FALSE,published_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());ALTER TABLE articles ADD COLUMN IF NOT EXISTS body TEXT;ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_url TEXT;ALTER TABLE articles ADD COLUMN IF NOT EXISTS author TEXT;ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';CREATE TABLE IF NOT EXISTS roadmaps(id TEXT PRIMARY KEY,title TEXT NOT NULL,group_name TEXT NOT NULL,description TEXT NOT NULL,stages JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY,title TEXT NOT NULL,tech TEXT NOT NULL,level TEXT NOT NULL,duration TEXT NOT NULL,parts TEXT NOT NULL,image_url TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS bookmarks(user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(user_id,article_id));CREATE TABLE IF NOT EXISTS newsletter_subscribers(id BIGSERIAL PRIMARY KEY,email TEXT UNIQUE NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS contact_messages(id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL,message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'new',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS analytics_events(id BIGSERIAL PRIMARY KEY,user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,event_name TEXT NOT NULL,path TEXT,metadata JSONB,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS news_items(id TEXT PRIMARY KEY,canonical_url TEXT UNIQUE NOT NULL,title TEXT NOT NULL,summary TEXT,category TEXT NOT NULL,source_name TEXT NOT NULL,source_type TEXT NOT NULL,published_at TIMESTAMPTZ NOT NULL,fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),image_url TEXT);CREATE TABLE IF NOT EXISTS sources(id BIGSERIAL PRIMARY KEY,name TEXT NOT NULL,url TEXT NOT NULL UNIQUE,reliability TEXT NOT NULL DEFAULT 'unverified',verification_notes TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());CREATE TABLE IF NOT EXISTS admin_actions(id BIGSERIAL PRIMARY KEY,admin_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,action TEXT NOT NULL,target_type TEXT,target_id TEXT,metadata JSONB,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);
const ac=await q("SELECT COUNT(*)::int AS c FROM articles");
if(process.env.ADMIN_EMAIL){
  if(process.env.ADMIN_PASSWORD){
    const adminPasswordHash=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);
    const existing=await q("SELECT id FROM users WHERE email=LOWER($1)",[process.env.ADMIN_EMAIL]);
    if(existing.rowCount){
      await q("UPDATE users SET role='admin',status='active',password_hash=$1 WHERE email=LOWER($2)",[adminPasswordHash,process.env.ADMIN_EMAIL]);
    }else{
      await q("INSERT INTO users(name,email,password_hash,role,status) VALUES($1,LOWER($2),$3,'admin','active')",["NextBit Administrator",process.env.ADMIN_EMAIL,adminPasswordHash]);
    }
    console.log("[NextBit] administrator account provisioned from Render secrets.");
  }else{
    await q("UPDATE users SET role='admin',status='active' WHERE email=LOWER($1)",[process.env.ADMIN_EMAIL]);
  }
}if(ac.rows[0].c===0)for(const a of ARTICLES)await q("INSERT INTO articles(id,slug,category,title,summary,image_url,body,author,status,verified,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()) ON CONFLICT DO NOTHING",[a.id,a.slug,a.category,a.title,a.summary,a.image_url,"Technology intelligence article body.","NextBit Desk","published",a.verified]);
const rc=await q("SELECT COUNT(*)::int AS c FROM roadmaps");if(rc.rows[0].c===0)for(const r of ROADMAPS)await q("INSERT INTO roadmaps(id,title,group_name,description,stages) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",[r.id,r.title,r.group,r.description,JSON.stringify(r.stages)]);
const pc=await q("SELECT COUNT(*)::int AS c FROM projects");if(pc.rows[0].c===0)for(const p of PROJECTS)await q("INSERT INTO projects(id,title,tech,level,duration,parts,image_url) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING",[p.id,p.title,p.tech,p.level,p.duration,p.parts,p.image_url]);return true}
