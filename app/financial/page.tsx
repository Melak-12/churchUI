"use client";

import { AppShell } from "@/components/layout/app-shell";
import { FinancialDashboard } from "@/components/financial/financial-dashboard";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FeatureGuard } from "@/components/feature-guard";

export default function FinancialPage() {
  return (
    <FeatureGuard feature="financial">
      <AuthGuard requiredRole="ADMIN">
        <AppShell>
          <FinancialDashboard />
        </AppShell>
      </AuthGuard>
    </FeatureGuard>
  );
}
