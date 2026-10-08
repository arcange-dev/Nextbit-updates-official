# NextBit Updates

NextBit Updates is a futuristic global ICT news, roadmap and project platform focused on AI, software engineering, cybersecurity, electronics, robotics, hardware, infrastructure, IoT, semiconductors, telecom and African technology.

## Product direction
NextBit is **not a teaching/course platform**. It is a technology intelligence platform: verified news, technical context, global ICT roadmaps, projects, industry signals and AI-powered analysis.

## Frontend
- React + TypeScript + Vite + Tailwind CSS
- Modern CSS3 glassmorphism with layered blur, gradients, grain, glow lines and responsive cards
- HTML5 Canvas animated technology network/particle hero
- Liquid-style glass CTA buttons with animated sheen and depth
- Responsive navigation, mobile menu, article UI, roadmaps, projects, Africa Tech and editorial/admin screens
- 37+ global ICT roadmaps spanning software, data, AI, security, infrastructure, hardware, emerging and applied ICT
- API-connected login/register, newsletter signup and contact forms
- Accessible focus states and reduced-motion support

## Backend
- Node.js + Express API
- Helmet, CORS, Morgan and rate limiting
- PostgreSQL persistence
- JWT authentication with bcrypt password hashing
- Articles, roadmaps, projects, bookmarks, users, newsletter subscribers, contact messages and analytics events
- Health endpoint: `GET /api/health`
- Search endpoint: `GET /api/search?q=...`

## Admin panel
The admin console is protected by the backend. Set `ADMIN_EMAIL` in Render, register an account with that exact email, then sign in and open `/#/admin`. On backend startup, that email is promoted to the `admin` role. The admin console includes live overview metrics and article create/edit/publish/delete workflows.

## Render deployment
The repository includes `render.yaml` for a Render Blueprint with:
- One Node web service serving both the Vite frontend and Express API
- One Render Postgres database
- Automatic deployment from `main`
- Health check at `/api/health`
- Backend binds to `0.0.0.0` and the Render `PORT`

### Deploy
1. Open Render and choose **New → Blueprint**.
2. Connect `arcange-dev/Nextbit-updates-official`.
3. Render reads `render.yaml` and creates the web service and database.
4. Enter a strong `JWT_SECRET` when prompted.
5. After the first deploy, open the generated `onrender.com` URL.

For a single-service deployment, the frontend calls the backend through relative `/api` URLs, so no separate frontend API domain is required.

Render supports Node web services and static sites; web services must bind to `0.0.0.0`. Free services are useful for testing but Render notes that free web services spin down after inactivity and are not recommended for production workloads.

## Environment variables
Copy `.env.example` for local development. Never commit real database URLs, JWT secrets or AI/API keys.

## Run locally
```
npm install
npm run dev
```

Backend + production build:
```
npm run build
npm start
```
