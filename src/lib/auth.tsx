import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, tokens, type User } from "./api";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokens.access) { setLoading(false); return; }
    authApi.me().then((d) => setUser(d.user)).catch(() => tokens.clear()).finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await authApi.login(email, password);
    tokens.set(r.accessToken, r.refreshToken);
    setUser(r.user);
  };
  const register = async (name: string, email: string, password: string) => {
    const r = await authApi.register(name, email, password);
    tokens.set(r.accessToken, r.refreshToken);
    setUser(r.user);
  };
  const logout = async () => {
    try { await authApi.logout(); } catch {}
    tokens.clear();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
