'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { CommunicationEditForm } from '@/components/communications/communication-edit-form';
import { Communication } from '@/types';
import apiClient from '@/lib/api';
import { getDocumentId } from '@/lib/utils';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CommunicationEditPage() {
  const params = useParams();
  const router = useRouter();
  const [communication, setCommunication] = useState<Communication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const communicationId = params.id as string;

  useEffect(() => {
    const fetchCommunication = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Check if communicationId is valid
        if (!communicationId || communicationId === 'undefined') {
          setError('Invalid communication ID');
          return;
        }

        const fetchedCommunication = await apiClient.getCommunication(communicationId);
        console.log('Fetched communication:', fetchedCommunication);
        console.log('Communication ID:', fetchedCommunication.id);
        console.log('Communication _id:', fetchedCommunication._id);
        setCommunication(fetchedCommunication);
      } catch (err: any) {
        console.error('Error fetching communication:', err);
        setError(err.message || 'Failed to load communication');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunication();
  }, [communicationId]);

  const handleSave = async (communicationData: Partial<Communication>) => {
    if (!communication) return;

    console.log('handleSave called with communication:', communication);
    console.log('communication.id:', communication.id);
    console.log('communication._id:', communication._id);
    console.log('communicationData:', communicationData);

    try {
      setSaving(true);
      setError('');

      // Use getDocumentId to properly extract the ID
      const idToUse = getDocumentId(communication) || communicationId;
      console.log('Using ID for update:', idToUse);

      if (!idToUse || idToUse === 'undefined') {
        throw new Error('Invalid communication ID');
      }

      // Update the communication
      const updatedCommunication = await apiClient.updateCommunication(idToUse, communicationData);
      
      // Redirect back to communications list with success message
      router.push('/communications?message=updated');
    } catch (err: any) {
      console.error('Error updating communication:', err);
      setError(err.message || 'Failed to update communication');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/communications');
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading communication...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/communications">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Communications
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Error Loading Communication</h3>
                <p className="text-gray-600 mt-2">{error}</p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!communication) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Communication Not Found</h3>
              <p className="text-gray-600 mt-2">The communication you're looking for doesn't exist.</p>
            </div>
            <Button asChild>
              <Link href="/communications">
                Back to Communications
              </Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Check if communication can be edited
  if (communication.status === 'SENT' || communication.status === 'SENDING') {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/communications">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Communications
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cannot Edit Communication</h3>
                <p className="text-gray-600 mt-2">
                  This communication has already been sent and cannot be edited.
                </p>
              </div>
              <Button asChild>
                <Link href="/communications">
                  Back to Communications
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/communications">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communications
            </Link>
          </Button>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Communication</h1>
          <p className="text-gray-600 mt-1">Update your SMS campaign details</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Communication Edit Form */}
        <CommunicationEditForm
          initialData={{
            name: communication.name,
            audience: communication.audience,
            customAudience: communication.customAudience || [],
            body: communication.body,
            scheduledAt: communication.scheduledAt ? new Date(communication.scheduledAt).toISOString() : undefined
          }}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={saving}
        />
      </div>
    </AppShell>
  );
}
