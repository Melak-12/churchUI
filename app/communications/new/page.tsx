'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight, Users, Send, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { CommunicationWizard } from '@/components/communications/communication-wizard';
import { CommunicationPreview } from '@/components/communications/communication-preview';

type AudienceType = 'ALL' | 'ELIGIBLE' | 'DELINQUENT_30' | 'DELINQUENT_60' | 'DELINQUENT_90' | 'CUSTOM';

interface CommunicationData {
  name: string;
  audience: AudienceType;
  customAudience?: string[];
  body: string;
  scheduledAt?: string;
}

interface MemberStats {
  total: number;
  eligible: number;
  delinquentBreakdown: {
    '0-30': number;
    '31-60': number;
    '61-90': number;
    '90+': number;
  };
}

const steps = [
  { id: 'details', title: 'Campaign Details', description: 'Name your campaign' },
  { id: 'audience', title: 'Select Audience', description: 'Choose recipients' },
  { id: 'message', title: 'Compose Message', description: 'Write your message' },
  { id: 'schedule', title: 'Schedule & Send', description: 'Choose timing' },
  { id: 'preview', title: 'Preview & Confirm', description: 'Review before sending' }
];

export default function NewCommunicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [communicationData, setCommunicationData] = useState<CommunicationData>({
    name: '',
    audience: 'ELIGIBLE',
    body: ''
  });
  const [memberStats, setMemberStats] = useState<MemberStats>({
    total: 0,
    eligible: 0,
    delinquentBreakdown: { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Debug current step
  useEffect(() => {
    console.log('Current step:', currentStep, 'Steps length:', steps.length, 'Should show button:', currentStep === steps.length - 1);
  }, [currentStep]);

  // Fetch member statistics
  useEffect(() => {
    const fetchMemberStats = async () => {
      try {
        const stats = await apiClient.getMemberStats();
        setMemberStats({
          total: stats.total || 0,
          eligible: stats.eligible || 0,
          delinquentBreakdown: {
            '0-30': stats.delinquentBreakdown?.['0-30'] || 0,
            '31-60': stats.delinquentBreakdown?.['31-60'] || 0,
            '61-90': stats.delinquentBreakdown?.['61-90'] || 0,
            '90+': stats.delinquentBreakdown?.['90+'] || 0
          }
        });
      } catch (err) {
        console.error('Error fetching member stats:', err);
        setError('Failed to load member statistics');
        // Set default values to prevent crashes
        setMemberStats({
          total: 0,
          eligible: 0,
          delinquentBreakdown: { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchMemberStats();
  }, []);

  const getMemberCount = (audience: AudienceType): number => {
    switch (audience) {
      case 'ALL':
        return memberStats.total || 0;
      case 'ELIGIBLE':
        return memberStats.eligible || 0;
      case 'DELINQUENT_30':
        return memberStats.delinquentBreakdown?.['0-30'] || 0;
      case 'DELINQUENT_60':
        return memberStats.delinquentBreakdown?.['31-60'] || 0;
      case 'DELINQUENT_90':
        return memberStats.delinquentBreakdown?.['61-90'] || 0;
      case 'CUSTOM':
        return communicationData.customAudience?.length || 0;
      default:
        return 0;
    }
  };

  const estimatedCost = `$${(getMemberCount(communicationData.audience) * 0.0075).toFixed(2)}`;

  const updateCommunicationData = useCallback((updates: Partial<CommunicationData>) => {
    setCommunicationData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Details
        return communicationData.name.trim().length > 0;
      case 1: // Audience
        return communicationData.audience !== 'CUSTOM' || (communicationData.customAudience && communicationData.customAudience.length > 0) || false;
      case 2: // Message
        return communicationData.body.trim().length > 0;
      case 3: // Schedule
        return true; // Optional step
      case 4: // Preview
        return true;
      default:
        return false;
    }
  };

  const handleSend = async () => {
    console.log('handleSend called!');
    console.log('canProceed():', canProceed());
    console.log('communicationData:', communicationData);
    
    if (!canProceed()) {
      console.log('Cannot proceed - showing error');
      setError('Please complete all required fields');
      return;
    }

    console.log('Starting to send communication...');
    setLoading(true);
    setError(null);

    try {
      console.log('Creating communication with data:', communicationData);
      const communication = await apiClient.createCommunication(communicationData);
      console.log('Created communication:', communication);
      console.log('Communication ID:', communication.id);
      console.log('Communication _id:', communication._id);
      
      if (communicationData.scheduledAt) {
        console.log('Scheduling communication with ID:', communication.id, 'at:', communicationData.scheduledAt);
        if (!communication.id) {
          throw new Error('Communication ID is missing from the response');
        }
        await apiClient.scheduleCommunication(communication.id, communicationData.scheduledAt);
        console.log('Schedule API call completed successfully');
        setSuccessMessage('Communication scheduled successfully! It will be sent at the specified time.');
        setSuccessModalOpen(true);
      } else {
        console.log('Sending communication with ID:', communication.id);
        if (!communication.id) {
          throw new Error('Communication ID is missing from the response');
        }
        await apiClient.sendCommunication(communication.id);
        console.log('Send API call completed successfully');
        setSuccessMessage('Communication sent successfully!');
        setSuccessModalOpen(true);
      }
    } catch (err: any) {
      console.error('Error in handleSend:', err);
      console.error('Error details:', err);
      setError(err.message || 'Failed to create communication');
    } finally {
      console.log('handleSend finally block - setting loading to false');
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  const handleSuccessModalClose = () => {
    console.log('handleSuccessModalClose called');
    setSuccessModalOpen(false);
    console.log('Modal closed, attempting router.push to /communications');
    try {
      router.push('/communications');
      console.log('router.push called');
    } catch (routerError) {
      console.error('Router push failed:', routerError);
      console.log('Falling back to window.location.href');
      window.location.href = '/communications';
    }
  };


  if (initialLoading) {
    return (
      <AppShell>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
                <Link href="/communications">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create SMS Campaign</h1>
              <p className="text-gray-500 mt-1">Send targeted messages to your community members</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-gray-600">Loading campaign creator...</span>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
              <Link href="/communications">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create SMS Campaign</h1>
            <p className="text-gray-500 mt-1">Send targeted messages to your community members</p>
          </div>
        </div>


        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}


        {/* Step Content */}
        <div className="min-h-[300px]">
          <CommunicationWizard
            step={currentStep}
            data={communicationData}
            memberStats={memberStats}
            onUpdate={updateCommunicationData}
            onPreview={handlePreview}
          />
        </div>

        {/* Navigation */}
        <div className="space-y-4 pt-4 border-t">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{steps[currentStep]?.title}</span>
            <span>{currentStep + 1} of {steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="flex items-center space-x-6">
              {/* Campaign Summary */}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{getMemberCount(communicationData.audience)} recipients</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Est. cost: {estimatedCost}</span>
                </div>
              </div>

              {/* Action Button */}
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={() => {
                    console.log('Button clicked!');
                    console.log('loading:', loading);
                    console.log('canProceed():', canProceed());
                    handleSend();
                  }}
                  disabled={loading || !canProceed()}
                  className="flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {communicationData.scheduledAt ? 'Schedule Campaign' : 'Send Now'}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <CommunicationPreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          data={communicationData}
          memberCount={getMemberCount(communicationData.audience)}
          estimatedCost={estimatedCost}
        />
      </div>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Done!
            </DialogTitle>
            <DialogDescription className="text-center py-4">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button 
              onClick={() => {
                console.log('View Communications button clicked');
                handleSuccessModalClose();
              }} 
              className="w-full"
            >
              View Communications
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}