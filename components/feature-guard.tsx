"use client";

import { useFeatures } from "@/contexts/features-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface FeatureGuardProps {
  feature: keyof ReturnType<typeof useFeatures>["features"];
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
      // Redirect to dashboard if feature is disabled
      router.push("/dashboard");
    }
  }, [features, feature, router]);

  if (!features[feature]) {
    return (
      fallback || (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">
              Feature Not Available
            </h2>
            <p className="text-muted-foreground">
              This feature has been disabled in the settings.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
