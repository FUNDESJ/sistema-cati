const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Sessão administrativa em memória (ADR 0002 do backend) — nunca em
// localStorage (risco de XSS) nem em cookie de terceiros (bloqueado).
let adminToken: string | null = null;
let adminSession: AdminSession | null = null;
const authListeners = new Set<() => void>();

function notifyAuthChange() {
  authListeners.forEach((listener) => listener());
}

export function onAuthChange(listener: () => void): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

export function getAdminSession(): AdminSession | null {
  return adminSession;
}

export function hasAdminSession(): boolean {
  return adminToken !== null;
}

export function setAdminSession(token: string, session: AdminSession) {
  adminToken = token;
  adminSession = session;
  notifyAuthChange();
}

export function clearAdminSession() {
  adminToken = null;
  adminSession = null;
  notifyAuthChange();
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

async function request(path: string, options: RequestOptions = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.auth && adminToken) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Tente novamente em alguns instantes.');
  }

  if (!response.ok) {
    // Token expirado/inválido: limpa a sessão e deixa o guard redirecionar ao login.
    if (response.status === 401 && options.auth) {
      clearAdminSession();
    }
    let message = 'Erro na comunicação com o servidor';
    let fields: Record<string, string> | undefined;
    try {
      const payload = (await response.json()) as {
        message?: string;
        errors?: Record<string, string>;
      };
      message = payload.message ?? message;
      fields = payload.errors;
    } catch {
      // resposta sem corpo JSON
    }
    throw new ApiError(response.status, message, fields);
  }

  return response;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  return (text ? (JSON.parse(text) as T) : (undefined as T));
}

export function apiGet<T>(path: string, auth = false): Promise<T> {
  return request(path, { auth }).then(parseJson<T>);
}

export function apiPost<T>(path: string, body?: unknown, auth = false): Promise<T> {
  return request(path, { method: 'POST', body, auth }).then(parseJson<T>);
}

export function apiPatch<T>(path: string, body?: unknown, auth = true): Promise<T> {
  return request(path, { method: 'PATCH', body, auth }).then(parseJson<T>);
}

export function apiDelete(path: string, auth = true): Promise<void> {
  return request(path, { method: 'DELETE', auth }).then(() => undefined);
}

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

// Download autenticado de arquivos (CSV) gerados pelo servidor.
export async function apiDownload(path: string, filename: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), { headers });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Tente novamente em alguns instantes.');
  }

  if (!response.ok) {
    let message = 'Erro ao gerar o arquivo de exportação';
    try {
      const payload = (await response.json()) as { message?: string };
      message = payload.message ?? message;
    } catch {
      // resposta sem corpo JSON
    }
    throw new ApiError(response.status, message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
