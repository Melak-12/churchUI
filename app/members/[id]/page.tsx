'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { MemberForm } from '@/components/members/member-form';
import { Member } from '@/types';
import apiClient from '@/lib/api';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const memberId = params.id as string;

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Check if memberId is valid
        if (!memberId || memberId === 'undefined') {
          setError('Invalid member ID');
          return;
        }
        
        const memberData = await apiClient.getMember(memberId);
        console.log('Member data from API:', memberData);
        console.log('Member ID field:', memberData.id);
        console.log('Member _id field:', memberData._id);
        setMember(memberData);
      } catch (err: any) {
        setError(err.message || 'Failed to load member');
        console.error('Member fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchMember();
    }
  }, [memberId]);

  const handleSuccess = () => {
    // Refresh the member data after successful update
    if (memberId) {
      apiClient.getMember(memberId).then(memberData => {
        setMember(memberData);
      }).catch(console.error);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading member...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/members">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Members
              </Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!member) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">Member not found</p>
            <Button asChild>
              <Link href="/members">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Members
              </Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
              <Link href="/members">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {member.firstName} {member.lastName}
            </h1>
            <p className="text-gray-500 mt-1">Edit member information</p>
          </div>
        </div>

        {/* Member Form */}
        <MemberForm member={member} onSuccess={handleSuccess} />
      </div>
    </AppShell>
  );
}