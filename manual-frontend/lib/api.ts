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
    if (token) (headers as any)['X-CSRFToken'] = token;
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
  created_by: number;
  current_version?: number;
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

export async function getManual(id: number): Promise<Manual> {
  return apiFetch<Manual>(`/api/manuals/${id}/`);
}

export async function updateManual(id: number, payload: Partial<Manual>): Promise<Manual> {
  await ensureCsrf();
  return apiFetch<Manual>(`/api/manuals/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteManual(id: number): Promise<void> {
  await ensureCsrf();
  return apiFetch<void>(`/api/manuals/${id}/`, { method: 'DELETE' });
}

// Manual Actions
export async function submitManualForReview(id: number): Promise<any> {
  await ensureCsrf();
  return apiFetch(`/api/manuals/${id}/submit/`, { method: 'POST' });
}

export async function publishManual(id: number): Promise<Manual> {
  await ensureCsrf();
  return apiFetch<Manual>(`/api/manuals/${id}/publish/`, { method: 'POST' });
}

export async function rollbackManual(id: number, versionNumber: number): Promise<Manual> {
  await ensureCsrf();
  return apiFetch<Manual>(`/api/manuals/${id}/rollback/`, { 
    method: 'POST', 
    body: JSON.stringify({ version_number: versionNumber }) 
  });
}

// Categories
export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export async function listCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/api/categories/');
}

export async function createCategory(payload: { name: string; slug: string; description?: string; color?: string }): Promise<Category> {
  await ensureCsrf();
  return apiFetch<Category>('/api/categories/', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateCategory(id: number, payload: Partial<Category>): Promise<Category> {
  await ensureCsrf();
  return apiFetch<Category>(`/api/categories/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteCategory(id: number): Promise<void> {
  await ensureCsrf();
  return apiFetch<void>(`/api/categories/${id}/`, { method: 'DELETE' });
}

// Tags
export type Tag = {
  id: number;
  name: string;
  slug: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export async function listTags(): Promise<Tag[]> {
  return apiFetch<Tag[]>('/api/tags/');
}

export async function createTag(payload: { name: string; slug: string; color?: string }): Promise<Tag> {
  await ensureCsrf();
  return apiFetch<Tag>('/api/tags/', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateTag(id: number, payload: Partial<Tag>): Promise<Tag> {
  await ensureCsrf();
  return apiFetch<Tag>(`/api/tags/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteTag(id: number): Promise<void> {
  await ensureCsrf();
  return apiFetch<void>(`/api/tags/${id}/`, { method: 'DELETE' });
}

// Manual Versions
export type ManualVersion = {
  id: number;
  manual: number;
  version_number: number;
  content: string;
  is_published: boolean;
  published_html: string;
  created_at: string;
  updated_at: string;
  created_by: number;
};

export async function listVersions(): Promise<ManualVersion[]> {
  return apiFetch<ManualVersion[]>('/api/versions/');
}

export async function getVersion(id: number): Promise<ManualVersion> {
  return apiFetch<ManualVersion>(`/api/versions/${id}/`);
}

export async function createVersion(payload: { manual: number; changelog?: string }): Promise<ManualVersion> {
  await ensureCsrf();
  return apiFetch<ManualVersion>('/api/versions/', { method: 'POST', body: JSON.stringify(payload) });
}

export async function previewVersion(id: number): Promise<ManualVersion> {
  return apiFetch<ManualVersion>(`/api/versions/${id}/preview/`);
}

// Content Blocks
export type ContentBlockType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'TABLE' | 'LIST' | 'CODE' | 'QUOTE' | 'DIVIDER';

// Content Blocks
export type ContentBlock = {
  id: number;
  version: number;
  order: number;
  type: ContentBlockType;
  data: any;
  created_at: string;
  updated_at: string;
};


export async function listContentBlocks(): Promise<ContentBlock[]> {
  return apiFetch<ContentBlock[]>('/api/blocks/');
}

export async function createContentBlock(payload: { 
  version: number; 
  type: ContentBlockType; 
  data: any; 
  order: number 
}): Promise<ContentBlock> {
  await ensureCsrf();
  return apiFetch<ContentBlock>('/api/blocks/', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateContentBlock(id: number, payload: Partial<ContentBlock>): Promise<ContentBlock> {
  await ensureCsrf();
  return apiFetch<ContentBlock>(`/api/blocks/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteContentBlock(id: number): Promise<void> {
  await ensureCsrf();
  return apiFetch<void>(`/api/blocks/${id}/`, { method: 'DELETE' });
}

// Review Requests
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ReviewRequest = {
  id: number;
  version: number;
  submitted_by: number;
  reviewer: number | null;
  status: ReviewStatus;
  feedback: string;
  submitted_at: string;
  decided_at: string | null;
};

export async function listReviews(): Promise<ReviewRequest[]> {
  return apiFetch<ReviewRequest[]>('/api/reviews/');
}

export async function getReview(id: number): Promise<ReviewRequest> {
  return apiFetch<ReviewRequest>(`/api/reviews/${id}/`);
}

export async function approveReview(id: number): Promise<ReviewRequest> {
  await ensureCsrf();
  return apiFetch<ReviewRequest>(`/api/reviews/${id}/approve/`, { method: 'POST' });
}

export async function rejectReview(id: number, feedback?: string): Promise<ReviewRequest> {
  await ensureCsrf();
  return apiFetch<ReviewRequest>(`/api/reviews/${id}/reject/`, { 
    method: 'POST', 
    body: JSON.stringify({ feedback: feedback || '' }) 
  });
}

// Audit Logs
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'PUBLISH' | 'ROLLBACK';

export type AuditLog = {
  id: number;
  manual: number;
  version: number | null;
  action: AuditAction;
  actor: number;
  timestamp: string;
  details: any;
};

export async function listAuditLogs(): Promise<AuditLog[]> {
  return apiFetch<AuditLog[]>('/api/audit/');
}

export async function getAuditLog(id: number): Promise<AuditLog> {
  return apiFetch<AuditLog>(`/api/audit/${id}/`);
}

// User Registration
export async function registerUser(payload: { 
  username: string; 
  email: string; 
  password: string; 
  role?: string; 
  department?: string 
}): Promise<User> {
  await ensureCsrf();
  return apiFetch<User>('/api/auth/register/', { method: 'POST', body: JSON.stringify(payload) });
}

// Convenience API object for easier usage
export const api = {
  // Authentication
  auth: {
    register: registerUser,
    login: loginApi,
    logout: logoutApi,
    me: meApi,
    updateProfile: updateProfileApi,
    changePassword: changePasswordApi,
  },

  // Manuals
  manuals: {
    list: listManuals,
    get: getManual,
    create: createManual,
    update: updateManual,
    delete: deleteManual,
    submit: submitManualForReview,
    publish: publishManual,
    rollback: rollbackManual,
  },

  // Categories
  categories: {
    list: listCategories,
    create: createCategory,
    update: updateCategory,
    delete: deleteCategory,
  },

  // Tags
  tags: {
    list: listTags,
    create: createTag,
    update: updateTag,
    delete: deleteTag,
  },

  // Versions
  versions: {
    list: listVersions,
    get: getVersion,
    create: createVersion,
    preview: previewVersion,
  },

  // Content Blocks
  blocks: {
    list: listContentBlocks,
    create: createContentBlock,
    update: updateContentBlock,
    delete: deleteContentBlock,
  },

  // Reviews
  reviews: {
    list: listReviews,
    get: getReview,
    approve: approveReview,
    reject: rejectReview,
  },

  // Audit Logs
  audit: {
    list: listAuditLogs,
    get: getAuditLog,
  },
};


