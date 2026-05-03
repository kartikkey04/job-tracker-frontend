const BASE = import.meta.env.VITE_API_URL || "https://job-tracker-backend-production-9f07.up.railway.app/"; // Updated for production

export type JobStatus = "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";

export interface Job {
  id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  job_description?: string;
  status: JobStatus;
  applied_date?: string;
  interview_date?: string;
  salary_range?: string;
  job_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface User { userId: string; email: string; name?: string; }

const TOKEN_KEY = "jt_access";
const REFRESH_KEY = "jt_refresh";

export const tokens = {
  get access() { return typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null; },
  get refresh() { return typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null; },
  set(access: string, refresh: string) {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY); },
};

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  const r = tokens.refresh;
  if (!r) return false;
  refreshing = (async () => {
    try {
      const res = await fetch(`${BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: r }),
      });
      if (!res.ok) return false;
      const json = await res.json();
      const data = json.data || json;
      const access = data.access_token || data.accessToken;
      const refresh = data.refresh_token || data.refreshToken;
      if (access && refresh) { tokens.set(access, refresh); return true; }
      return false;
    } catch { return false; }
    finally { refreshing = null; }
  })();
  return refreshing;
}

export async function api<T = any>(path: string, opts: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const { auth = true, headers, ...rest } = opts;
  const doFetch = async () => {
    const h: Record<string, string> = { "Content-Type": "application/json", ...(headers as any) };
    if (auth && tokens.access) h.Authorization = `Bearer ${tokens.access}`;
    return fetch(`${BASE}${path}`, { ...rest, headers: h });
  };
  let res = await doFetch();
  if (res.status === 401 && auth && tokens.refresh) {
    const ok = await tryRefresh();
    if (ok) res = await doFetch();
  }
  const text = await res.text();
  let json: any = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { error: text }; }
  if (!res.ok || json.success === false) {
    throw new Error(json.error || json.message || `Request failed (${res.status})`);
  }
  return json.data as T;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api<{ user: User; accessToken: string; refreshToken: string }>("/api/auth/register", {
      method: "POST", auth: false, body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    api<{ user: User; accessToken: string; refreshToken: string }>("/api/auth/login", {
      method: "POST", auth: false, body: JSON.stringify({ email, password }),
    }),
  me: () => api<{ user: User }>("/api/auth/me"),
  logout: () => api("/api/auth/logout", { method: "POST" }),
};

export const jobsApi = {
  list: (params: { status?: JobStatus; page?: number; limit?: number; sort?: string; order?: string } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v != null && q.set(k, String(v)));
    return api<{ jobs: Job[]; total: number; page: number; limit: number } | any>(`/api/jobs?${q}`);
  },
  get: (id: string) => api<{ job: Job }>(`/api/jobs/${id}`),
  create: (body: Partial<Job>) => api<{ job: Job }>("/api/jobs", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Job>) => api<{ job: Job }>(`/api/jobs/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: string) => api(`/api/jobs/${id}`, { method: "DELETE" }),
  stats: () => api<{ stats: Record<string, number> | Array<{ status: string; count: number }> }>("/api/jobs/stats"),
};

export const aiApi = {
  coverLetter: (b: { job_description: string; role_title: string; company_name: string }) =>
    api<any>("/api/ai/cover-letter", { method: "POST", body: JSON.stringify(b) }),
  interviewTips: (b: { job_description: string; role_title: string; company_name: string }) =>
    api<any>("/api/ai/interview-tips", { method: "POST", body: JSON.stringify(b) }),
  resumeMatch: (b: { resume_text: string; job_description: string }) =>
    api<any>("/api/ai/resume-match", { method: "POST", body: JSON.stringify(b) }),
};

export const STATUSES: JobStatus[] = ["applied", "screening", "interview", "offer", "rejected", "withdrawn"];
