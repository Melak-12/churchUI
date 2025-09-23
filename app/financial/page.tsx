"use client";

import { AppShell } from "@/components/layout/app-shell";
import { FinancialDashboard } from "@/components/financial/financial-dashboard";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function FinancialPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <AppShell>
        <FinancialDashboard />
      </AppShell>
    </AuthGuard>
  );
}

