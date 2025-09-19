'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api';
import { Communication, Recipient } from '@/types';
import { getDocumentId } from '@/lib/utils';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  Users,
  Calendar,
  User
} from 'lucide-react';
import Link from 'next/link';

export default function CommunicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [communication, setCommunication] = useState<Communication | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunication = async () => {
      try {
        setLoading(true);
        const comm = await apiClient.getCommunication(params.id as string);
        setCommunication(comm);
        
        // Fetch recipients if communication exists
        if (comm) {
          const communicationId = getDocumentId(comm);
          const recipientData = await apiClient.getCommunicationRecipients(communicationId);
          setRecipients(recipientData.recipients);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load communication');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCommunication();
    }
  }, [params.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'SENDING':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'DRAFT':
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'SENDING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecipientStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !communication) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/communications">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Communication Not Found</h1>
              <p className="text-gray-600">The communication you're looking for doesn't exist</p>
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </AppShell>
    );
  }

  const deliveryRate = communication.sent > 0 
    ? Math.round((communication.delivered / communication.sent) * 100) 
    : 0;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
              <Link href="/communications">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{communication.name}</h1>
            <p className="text-gray-500 mt-1">SMS Campaign Details</p>
          </div>
        </div>

        {/* Status and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {getStatusIcon(communication.status)}
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(communication.status)}>
                {communication.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communication.sent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{communication.delivered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveryRate}%</div>
              <Progress value={deliveryRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Audience</label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {communication.audience.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">{communication.body}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1 text-sm">
                    {formatDate(communication.createdAt)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sent</label>
                  <div className="mt-1 text-sm">
                    {communication.sentAt ? formatDate(communication.sentAt) : 'Not sent'}
                  </div>
                </div>
              </div>

              {communication.scheduledAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Scheduled</label>
                  <div className="mt-1 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(communication.scheduledAt)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recipient Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Recipients</span>
                  <span className="font-semibold">{recipients.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">
                    {recipients.filter(r => r.status === 'PENDING').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sent</span>
                  <span className="font-semibold text-blue-600">
                    {recipients.filter(r => r.status === 'SENT').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delivered</span>
                  <span className="font-semibold text-green-600">
                    {recipients.filter(r => r.status === 'DELIVERED').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Failed</span>
                  <span className="font-semibold text-red-600">
                    {recipients.filter(r => r.status === 'FAILED').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recipients Table */}
        {recipients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recipients</CardTitle>
              <CardDescription>
                Individual delivery status for each recipient
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Delivered At</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((recipient, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {recipient.member.firstName} {recipient.member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {recipient.member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {recipient.phone}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRecipientStatusIcon(recipient.status)}
                          <Badge 
                            variant={recipient.status === 'DELIVERED' ? 'default' : 'outline'}
                            className={
                              recipient.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              recipient.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                              recipient.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {recipient.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {recipient.sentAt ? formatDate(recipient.sentAt) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {recipient.deliveredAt ? formatDate(recipient.deliveredAt) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-red-600">
                        {recipient.errorMessage || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
