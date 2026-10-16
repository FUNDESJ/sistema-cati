import {
  apiPost,
  clearAdminSession,
  hasAdminSession,
  setAdminSession,
  type AdminSession,
} from './api';

interface LoginResponse {
  success: boolean;
  token: string;
  admin: AdminSession;
}

export async function login(email: string, password: string): Promise<void> {
  const response = await apiPost<LoginResponse>('/admin/auth/login', { email, password });
  setAdminSession(response.token, response.admin);
}

export async function logout(): Promise<void> {
  try {
    if (hasAdminSession()) {
      await apiPost<void>('/admin/auth/logout', undefined, true);
    }
  } catch {
    // Logout no servidor é melhor esforço — a sessão local é encerrada de qualquer forma.
  } finally {
    clearAdminSession();
  }
}
