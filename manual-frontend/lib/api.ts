export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export async function ensureCsrf(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/csrf/`, { credentials: 'include' });
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const method = (options.method || 'GET').toUpperCase();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const needsCsrf = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  if (needsCsrf) {
    const token = getCookie('csrftoken');
    if (token) headers['X-CSRFToken'] = token;
  }
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });
  if (!res.ok) {
    let detail: any = undefined;
    try { detail = await res.json(); } catch {}
    const message = (detail && (detail.detail || detail.non_field_errors || JSON.stringify(detail))) || res.statusText;
    throw new Error(typeof message === 'string' ? message : 'Request failed');
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export type Profile = {
  display_name: string;
  must_change_password: boolean;
  phone_number: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'AUTHOR' | 'REVIEWER' | 'READER' | 'ADMIN';
  department: string;
  profile?: Profile;
  date_joined: string;
  last_login: string | null;
};

export async function loginApi(username: string, password: string): Promise<User> {
  await ensureCsrf();
  return apiFetch<User>('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logoutApi(): Promise<void> {
  await ensureCsrf();
  await apiFetch('/api/auth/logout/', { method: 'POST' });
}

export function meApi(): Promise<User> {
  return apiFetch<User>('/api/auth/me/');
}

export type UpdateProfilePayload = Partial<Pick<Profile, 'display_name' | 'phone_number'>>;

export function updateProfileApi(payload: UpdateProfilePayload): Promise<Profile> {
  return apiFetch<Profile>('/api/auth/profile/', { method: 'PATCH', body: JSON.stringify(payload) });
}

export function changePasswordApi(old_password: string, new_password: string): Promise<{ detail: string }> {
  return apiFetch('/api/auth/password/change/', { method: 'POST', body: JSON.stringify({ old_password, new_password }) });
}

// Manuals
export type ManualStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';
export type Manual = {
  id: number;
  title: string;
  slug: string;
  department: string;
  status: ManualStatus;
  created_at: string;
  updated_at: string;
};

export async function listManuals(): Promise<Manual[]> {
  return apiFetch<Manual[]>('/api/manuals/');
}

export async function createManual(payload: { title: string; slug: string; department?: string }): Promise<Manual> {
  await ensureCsrf();
  return apiFetch<Manual>('/api/manuals/', { method: 'POST', body: JSON.stringify(payload) });
}


