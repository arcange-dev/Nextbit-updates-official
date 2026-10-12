// OAuth2 sign-in (GitHub + Google) using the authorization-code flow.
//
// Setup (Render environment variables):
//   GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET  -> from a GitHub OAuth App
//   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET  -> from a Google OAuth 2.0 Web client
//
// Flow: /api/auth/oauth/:provider/start  -> provider consent screen
//       /api/auth/oauth/:provider/callback -> code exchange, account link by
//       verified email, JWT issue, redirect back to the SPA as
//       /#/oauth?token=<jwt>&name=<name>. The client stores the token and
//       continues the session exactly like email/password sign-in.
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { hasDatabase, q } from "./db.mjs";

const r = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";

const PROVIDERS = {
  github: {
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scope: "read:user user:email",
    clientId: () => process.env.GITHUB_CLIENT_ID,
    secret: () => process.env.GITHUB_CLIENT_SECRET,
    async profile(token) {
      const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "nextbit-updates" };
      const user = await (await fetch("https://api.github.com/user", { headers })).json();
      if (!user.email) {
        const emails = await (await fetch("https://api.github.com/user/emails", { headers })).json();
        const primary = (Array.isArray(emails) ? emails : []).find((e) => e.verified && e.primary) || (Array.isArray(emails) ? emails : []).find((e) => e.verified);
        user.email = primary?.email;
      }
      return { email: user.email, name: user.name || user.login };
    },
  },
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    secret: () => process.env.GOOGLE_CLIENT_SECRET,
    async profile(token) {
      const user = await (await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${token}` } })).json();
      return { email: user.email, name: user.name || user.email?.split("@")[0] };
    },
  },
};

const issueToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "7d" });

// Create-or-activate the account for a verified OAuth identity. Accounts are
// matched by email; the local password hash is a random unusable secret so an
// OAuth-only account can never be logged into by password guessing.
async function upsertOAuthUser(email, name) {
  const existing = await q("SELECT id, email, name, role, status FROM users WHERE email = LOWER($1)", [email]);
  if (existing.rowCount) {
    if (existing.rows[0].status !== "active") throw Object.assign(new Error("Account is disabled"), { status: 403 });
    await q("UPDATE users SET last_login_at = NOW() WHERE id = $1", [existing.rows[0].id]);
    return existing.rows[0];
  }
  const randomHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
  const { rows } = await q(
    "INSERT INTO users(name, email, password_hash, role) VALUES($1, LOWER($2), $3, 'user') RETURNING id, email, name, role, status",
    [name, email, randomHash]
  );
  return rows[0];
}

// GET /api/auth/oauth/:provider/start
r.get("/auth/oauth/:provider/start", (req, res) => {
  const p = PROVIDERS[req.params.provider];
  if (!p) return res.status(404).json({ ok: false, error: "Unknown OAuth provider" });
  if (!p.clientId()) return res.status(503).json({ ok: false, error: `${req.params.provider} sign-in is not configured. Set ${req.params.provider.toUpperCase()}_CLIENT_ID / _CLIENT_SECRET.` });
  // Signed state protects the callback against CSRF/insertion attacks.
  const state = jwt.sign({ p: req.params.provider, n: crypto.randomBytes(12).toString("hex") }, JWT_SECRET, { expiresIn: "10m" });
  const url = new URL(p.authUrl);
  url.searchParams.set("client_id", p.clientId());
  url.searchParams.set("redirect_uri", `${req.protocol}://${req.get("host")}/api/auth/oauth/${req.params.provider}/callback`);
  url.searchParams.set("scope", p.scope);
  url.searchParams.set("state", state);
  if (req.params.provider === "google") { url.searchParams.set("response_type", "code"); url.searchParams.set("access_type", "online"); }
  res.redirect(url.toString());
});

// GET /api/auth/oauth/:provider/callback
r.get("/auth/oauth/:provider/callback", async (req, res) => {
  const p = PROVIDERS[req.params.provider];
  const fail = (msg) => res.redirect(`/#/oauth?error=${encodeURIComponent(msg)}`);
  try {
    if (!p) return res.status(404).json({ ok: false, error: "Unknown provider" });
    if (!p.clientId()) return fail("OAuth provider is not configured");
    try { jwt.verify(String(req.query.state || ""), JWT_SECRET); } catch { return fail("The sign-in request expired. Try again."); }
    if (!req.query.code) return fail("The provider did not return an authorization code");
    const tokenRes = await fetch(p.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: p.clientId(),
        client_secret: p.secret(),
        code: req.query.code,
        redirect_uri: `${req.protocol}://${req.get("host")}/api/auth/oauth/${req.params.provider}/callback`,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) return fail("Authorization failed. Check the provider credentials.");
    const profile = await p.profile(tokens.access_token);
    if (!profile.email) return fail("Your provider account has no verified email address");
    if (!hasDatabase()) return fail("Database is not configured");
    const user = await upsertOAuthUser(profile.email, profile.name);
    const token = issueToken(user);
    res.redirect(`/#/oauth?token=${token}`);
  } catch (e) {
    console.error("[oauth]", e);
    fail("Sign-in failed. Please try again.");
  }
});

export default r;
