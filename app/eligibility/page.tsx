import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EligibilityBadge, StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { mockMembers } from '@/lib/mock-data';
import { 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Vote,
  Info
} from 'lucide-react';

export default function EligibilityPage() {
  // Mock: assume current user is first member
  const currentMember = mockMembers[0];

  const eligibilityFactors = [
    {
      title: 'Payment Status',
      value: currentMember.status,
      status: currentMember.status === 'PAID' ? 'good' : 'warning',
      description: currentMember.status === 'PAID' 
        ? 'Your payments are current'
        : `${currentMember.delinquencyDays} days behind on payments`,
      icon: DollarSign
    },
    {
      title: 'Membership Duration',
      value: 'Active',
      status: 'good',
      description: `Member since ${new Date(currentMember.createdAt).toLocaleDateString()}`,
      icon: Calendar
    },
    {
      title: 'Communication Consent',
      value: currentMember.consent ? 'Granted' : 'Not Granted',
      status: currentMember.consent ? 'good' : 'warning',
      description: currentMember.consent 
        ? 'You have consented to receive communications'
        : 'Consent required for some features',
      icon: CheckCircle
    }
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Eligibility</h1>
          <p className="text-gray-600">Your voting eligibility status and requirements</p>
        </div>

        {/* Current Eligibility Status */}
        <Card className={`border-2 ${
          currentMember.eligibility === 'ELIGIBLE' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              {currentMember.eligibility === 'ELIGIBLE' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              )}
              <span>Current Voting Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <EligibilityBadge 
                eligibility={currentMember.eligibility}
                reason={currentMember.eligibilityReason}
              />
              {currentMember.eligibility === 'ELIGIBLE' ? (
                <span className="text-green-700 font-medium">You can participate in votes</span>
              ) : (
                <span className="text-red-700 font-medium">Voting restricted</span>
              )}
            </div>
            {currentMember.eligibilityReason && (
              <div className="text-sm text-gray-700">
                {currentMember.eligibilityReason}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Eligibility Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Requirements</CardTitle>
            <CardDescription>
              Factors that determine your voting eligibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {eligibilityFactors.map((factor, index) => {
              const Icon = factor.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    factor.status === 'good' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      factor.status === 'good' ? 'text-green-600' : 'text-yellow-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">{factor.title}</span>
                      <Badge 
                        variant={factor.status === 'good' ? 'default' : 'secondary'}
                        className={factor.status === 'good' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {factor.value}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {factor.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Voting Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>Voting Rules</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Members must not be delinquent for more than 90 days</p>
              <p>• Each member gets one vote per ballot</p>
              <p>• Votes cannot be changed once submitted</p>
              <p>• Some votes may be anonymous, others may record voter identity</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}