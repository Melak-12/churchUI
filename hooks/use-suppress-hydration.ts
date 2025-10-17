import { useEffect, useState } from "react";

/**
 * Hook to suppress hydration warnings caused by browser extensions
 * that add attributes to DOM elements after initial render
 */
export function useSuppressHydration() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook specifically for input elements that are commonly targeted by password managers
 */
export function useInputHydrationFix() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Small delay to allow browser extensions to finish their modifications
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return isHydrated;
}
