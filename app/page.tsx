'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getDefaultRoute, isAuthenticated } from '@/lib/auth';
import { useTheme } from '@/components/theme-provider';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();

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
        <div className="w-24 h-12 mx-auto mb-6">
          <Image 
            src={theme === "dark" ? "/worshiply-dark.png" : "/worshiply-logo.png"} 
            alt="Worshiply" 
            width={96}
            height={48}
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}