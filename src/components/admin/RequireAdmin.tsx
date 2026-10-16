import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAdminSession, onAuthChange } from '../../services/api';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(onAuthChange, getAdminSession);
  const location = useLocation();

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
