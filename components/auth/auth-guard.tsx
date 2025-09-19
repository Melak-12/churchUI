'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackRoute?: string;
}

export function AuthGuard({ 
  children, 
  requiredRole = 'GUEST',
  fallbackRoute = '/login' 
}: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      const user = getCurrentUser();
      const roleHierarchy: Record<UserRole, number> = {
        'GUEST': 0,
        'MEMBER': 1,
        'ADMIN': 2
      };

      const hasPermission = roleHierarchy[user.role] >= roleHierarchy[requiredRole];
      
      if (!hasPermission) {
        router.push(fallbackRoute);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, requiredRole, fallbackRoute]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}