'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getDefaultRoute, isAuthenticated } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      const defaultRoute = getDefaultRoute(user.role);
      router.push(defaultRoute);
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Community Church</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}