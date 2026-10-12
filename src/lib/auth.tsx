import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api";

export type AuthUser = { id: number | string; name: string; email: string; role: string; status?: string };

// Global session state. The JWT lives in localStorage ("nextbit_token") and is
// verified against GET /api/auth/me on boot. OAuth sign-in lands on #/oauth
// and calls finishOAuth() with the token the server redirected with.
type AuthCtx = {
  token: string | null;
  user: AuthUser | null;
  ready: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
};

const Ctx = createContext<AuthCtx>({ token: null, user: null, ready: false, signIn: async () => {}, signOut: () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("nextbit_token"));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    if (!token) { setUser(null); setReady(true); return; }
    api.me(token)
      .then((u: AuthUser) => active && setUser(u))
      .catch(() => { if (active) { localStorage.removeItem("nextbit_token"); setToken(null); setUser(null); } })
      .finally(() => active && setReady(true));
    return () => { active = false; };
  }, [token]);

  const signIn = async (t: string) => {
    localStorage.setItem("nextbit_token", t);
    const u = await api.me(t);
    setToken(t); setUser(u);
  };

  const signOut = () => {
    localStorage.removeItem("nextbit_token");
    setToken(null); setUser(null);
  };

  return <Ctx.Provider value={{ token, user, ready, signIn, signOut }}>{children}</Ctx.Provider>;
}
