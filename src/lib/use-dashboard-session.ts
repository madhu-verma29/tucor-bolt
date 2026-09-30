'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authorizedFetch, dashboardFor, getSession, type AuthRole } from './auth-api';

export function useDashboardSession(role: AuthRole): boolean {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      const session = getSession();
      if (!session) { router.replace('/sign-up-login'); return; }
      try {
        const response = await authorizedFetch('/api/auth/me');
        if (!response.ok) throw new Error('Unable to validate session');
        const user: { role: AuthRole } = await response.json();
        if (user.role !== role) { router.replace(dashboardFor(user.role)); return; }
        if (active) setAuthorized(true);
      } catch (error) {
        if (!active) return;
        toast.error(error instanceof Error ? error.message : 'Unable to validate session');
        router.replace('/sign-up-login');
      }
    })();
    return () => { active = false; };
  }, [role, router]);
  return authorized;
}
