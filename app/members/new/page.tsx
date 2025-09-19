'use client';

import { AppShell } from '@/components/layout/app-shell';
import { MemberForm } from '@/components/members/member-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

export default function NewMemberPage() {
  const handleSuccess = () => {
    // This will be called when member is created successfully
    // The form component will handle the redirect
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex justify-start">
          <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
            <Link href="/members">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>

        {/* Member Form */}
        <MemberForm onSuccess={handleSuccess} />
      </div>
    </AppShell>
  );
}
