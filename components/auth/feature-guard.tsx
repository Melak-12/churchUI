"use client";

import { useFeatures } from "@/contexts/features-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface FeatureGuardProps {
  feature:
    | "events"
    | "financial"
    | "communications"
    | "voting"
    | "memberPortal"
    | "ministries"
    | "attendance";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGuard({
  feature,
  children,
  fallback,
}: FeatureGuardProps) {
  const { features } = useFeatures();
  const router = useRouter();

  useEffect(() => {
    if (!features[feature]) {
      router.push("/dashboard");
    }
  }, [features, feature, router]);

  if (!features[feature]) {
    return fallback || null;
  }

  return <>{children}</>;
}
