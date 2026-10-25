# NextBit Updates

NextBit Updates is a technology-intelligence platform for ICT and electronics news, global ICT roadmaps, projects, software engineering, AI, cybersecurity, hardware, robotics and African technology. It is **not a teaching/course platform**: roadmaps are navigation maps for ICT career and technology fields.

## Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4 and modern CSS3.
- Backend: Node.js 20+, Express, PostgreSQL, JWT and bcrypt.
- Database: Supabase PostgreSQL. Runtime initialization creates/updates tables; `supabase/schema.sql` is the fresh-project schema and `supabase/seed.sql` contains starter data.
- Deployment: one Render Node web service serves both the compiled frontend and relative `/api` routes.

## Main capabilities
- Public technology homepage, search, news page, attributed external RSS headlines, article reader and share links.
- Admin-authored articles with drafts/publishing states, article thumbnails, image uploads, trusted-source registry and audit history.
- ICT roadmaps, hardware/software projects, Africa Tech, opportunities and status integrations.
- Comments and moderation, bookmarks, contact inbox, newsletter subscriptions, site settings, breaking-news banner and RSS feed.
- AI summary/chat/code explanation endpoints, GitHub trending, technology events, developer tools, job board and reader statistics. Optional integrations need their provider credentials configured before they can work.
- RSS output: `/feed.xml`. Sitemap: `/sitemap.xml`. Health check: `/api/health`.

## Admin sign-in — read this carefully
Open `/#/login`. The sign-in page asks for a **username or email** plus password.
- `ADMIN_EMAIL` is the preferred login identifier. If it is unset, `ADMIN_USERNAME` is used. If both are unset, local development uses `nextbitupdatesadmin`.
- Set `ADMIN_PASSWORD` in Render to the password you want to use. When it is configured, the backend hashes and uses it in preference to `ADMIN_PASSWORD_HASH`. If you use a hash instead, it must be a valid bcrypt hash.
- `JWT_SECRET` must be a stable, long, random secret in Render. Do not use a database password or an admin password as the JWT secret.
- `ADMIN_EMAIL` also identifies the database admin user created/promoted on startup. Set it to the intended admin address.
- Never commit real passwords, database URLs or API keys. If a password has been exposed, rotate it.

## Render setup
The repository includes `render.yaml` as a Blueprint template. The currently running Render service is connected to `https://github.com/arcange-dev/Nextbit-updates-official`, branch `main`, and uses:
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Runtime health endpoint: `/api/health`

Required Render environment variables:
1. `DATABASE_URL`: Supabase **Session pooler** connection string appropriate for your project. Copy it from Supabase → Project Settings → Database; do not paste a placeholder hostname.
2. `JWT_SECRET`: a stable, long, random value.
3. `ADMIN_EMAIL`: your intended administrator email and the default login identifier. Set `ADMIN_USERNAME` only if you specifically want a different login name.
4. `ADMIN_PASSWORD`: the password for the admin login. If you previously set `ADMIN_PASSWORD_HASH`, the plain `ADMIN_PASSWORD` now takes precedence; remove the hash if you do not need it.
5. `SITE_URL`: `https://nextbit-updates-r6k2.onrender.com`.

Optional integrations:
- AI features: `NEXTBIT_AI_ENDPOINT`, `NEXTBIT_AI_KEY`, and optional `NEXTBIT_AI_MODEL` (defaults to `gpt-4o-mini`). Use an OpenAI-compatible endpoint.
- Supabase Storage uploads: `SUPABASE_SERVICE_ROLE_KEY` (keep secret; never expose it in frontend variables). Database-backed image storage is used as a fallback.
- Newsletter mail: `RESEND_API_KEY` and a sender address in `MAIL_FROM` verified with the provider.
- GitHub data integrations use `GITHUB_TOKEN` when available. An OAuth module is present in the repository but the frontend callback/session flow is not yet enabled; do not treat Google/GitHub OAuth sign-in as launch-ready.

### Database connection steps
1. Open the correct Supabase project and go to **Project Settings → Database**.
2. Copy the **Session pooler** URI and replace its password with the current database password. URL-encode special characters if you construct the URI manually.
3. In Render → Nextbit-updates → Environment, set `DATABASE_URL` and save; set `SUPABASE_DB_PASSWORD` only if you deliberately use it to override the password inside that URI.
4. Set the admin variables above and save changes. Render will redeploy/restart the service.
5. Verify `/api/health` reports `database.status: "ok"`. If not, check Render logs for DNS, password, or connection errors.
6. Open `/#/login`, sign in, then open `/#/admin`. Publish a test draft and verify it appears in the public news/article pages before adding more content.

## Local development
```bash
npm install
npm run dev
```

Check backend syntax and build the frontend:
```bash
for file in server/*.mjs; do node --check "$file" || exit 1; done
npm run build
npm start
```

## Operational notes / known limitations
- The Render free web service can spin down after inactivity.
- Public RSS providers can rate-limit, block or change feeds; external stories should link to the original article and retain source attribution.
- AI, email delivery, GitHub API and OAuth features remain dependent on their respective credentials and provider rules.
- CI runs `npm ci`, syntax-checks every backend module, runs the news-cache unit tests, and builds the production frontend. Automated browser/end-to-end tests are still a recommended next step.
- Use `.gitignore` so local `node_modules/`, compiled `dist/`, secrets and test artifacts are not committed.
