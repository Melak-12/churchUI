"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Scroll to top when route changes
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
