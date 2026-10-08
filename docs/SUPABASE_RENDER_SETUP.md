# NextBit + Supabase PostgreSQL + Render

NextBit uses Supabase as the PostgreSQL provider while Render runs the Node/Express web service.

## 1. Create Supabase project
Open Supabase Dashboard -> New project. Create `nextbit-updates`, set a strong database password and choose a region.

Supabase provides a full Postgres database and a Connect panel for connection strings. citeturn893303search0turn893303search1

## 2. Create the schema
Supabase -> SQL Editor -> New query.
Copy the complete contents of `supabase/schema.sql` from this repository and click Run.

Then run `supabase/seed.sql` if you want the starter source registry.

## 3. Get the database connection string
Supabase -> Connect -> Session pooler.
Copy the generated PostgreSQL URI and replace the password placeholder with your database password.

Example shape:

postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:5432/postgres

Supabase documents Session pooler as an option when you need IPv4 compatibility; direct connections are appropriate when the runtime supports the required network path. citeturn893303search0turn893303search2

Do not put the connection string in GitHub.

## 4. Configure Render
Render -> Nextbit-updates -> Settings -> Environment.

Add:

```text
DATABASE_URL=<your complete Supabase Session Pooler URI>
DB_POOL_MAX=5
JWT_SECRET=<long random secret>
ADMIN_EMAIL=<email for the NextBit administrator>
```

The latest `render.yaml` expects DATABASE_URL as a secret provided by Render; it no longer creates a separate Render Postgres database.

## 5. Deploy
Render -> Manual Deploy -> Deploy latest commit.

After startup, open:

https://YOUR-RENDER-DOMAIN/api/health

You want `database: ok`.

## 6. Admin
Register at `/#/register` using the exact ADMIN_EMAIL configured in Render.
Then sign in and open `/#/admin`.

## 7. Live news
The backend exposes:

/api/trending
/api/trending?topic=AI&limit=30

The system combines Google News RSS searches with selected publisher/official RSS feeds, deduplicates results, stores feed metadata in `news_items`, and keeps original source links visible.

Admin also has a Refresh live news control.

## 8. Security
Do not commit DATABASE_URL, Supabase database passwords, JWT_SECRET, private API keys or service-role keys.

The browser does not directly access the tables. The Express backend uses the database connection. RLS is enabled in the schema to block unintended Data API access unless policies are later added.

Supabase documents SQL Editor, RLS and database connection methods in its database docs. citeturn893303search0turn893303search3turn893303search5

## 9. Local development
Create `.env` from `.env.example` and set DATABASE_URL to the same Supabase connection string.

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm start
```

## 10. Database maintenance
Keep `supabase/schema.sql` in version control. Supabase documents schema/migration workflows for keeping schema definitions reproducible. citeturn893303search6

## Easy administrator setup

Set these two Render secrets:

ADMIN_EMAIL=admin@nextbitupdates.com
ADMIN_PASSWORD=NextBitAdmin@2026!

On backend startup, when ADMIN_EMAIL and ADMIN_PASSWORD are present, NextBit provisions that account as an active administrator. If the account already exists, the configured password is applied to it. The password is stored as a bcrypt hash in PostgreSQL; the plaintext password is never stored in the database or repository.

Do not commit ADMIN_PASSWORD to GitHub. Set it only in Render Environment Variables.
