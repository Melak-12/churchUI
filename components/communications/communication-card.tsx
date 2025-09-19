import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Communication } from '@/types';
import { getDocumentId } from '@/lib/utils';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Trash2, 
  Send,
  Users,
  Calendar,
  Phone,
  Edit
} from 'lucide-react';
import Link from 'next/link';

interface CommunicationCardProps {
  communication: Communication;
  onSend?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CommunicationCard({ communication, onSend, onDelete }: CommunicationCardProps) {
  // Get the communication ID, handling both _id and id fields (MongoDB compatibility)
  const communicationId = getDocumentId(communication);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'SENDING':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'FAILED':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'SCHEDULED':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'DRAFT':
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SENDING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SCHEDULED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatScheduledDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Less than 1 hour';
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)} hours`;
    } else {
      const days = Math.floor(diffInHours / 24);
      const remainingHours = Math.round(diffInHours % 24);
      return `${days}d ${remainingHours}h`;
    }
  };

  const deliveryRate = communication.sent > 0 
    ? Math.round((communication.delivered / communication.sent) * 100) 
    : 0;

  return (
    <Card className={`hover:shadow-md transition-shadow ${
      communication.status === 'SCHEDULED' 
        ? 'border-orange-200 bg-orange-50/30' 
        : communication.status === 'SENT' 
        ? 'border-green-200 bg-green-50/30' 
        : ''
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg truncate">{communication.name}</CardTitle>
              {communication.status === 'SCHEDULED' && (
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                  <Calendar className="h-3 w-3 mr-1" />
                  SCHEDULED
                </Badge>
              )}
              {communication.status === 'SENT' && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  SENT
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2">
              {communication.body}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {getStatusIcon(communication.status)}
            <Badge className={`${getStatusColor(communication.status)} border`}>
              {communication.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Audience and Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <Badge variant="outline">
              {communication.audience.replace('_', ' ')}
            </Badge>
          </div>
          <div className="text-right">
            {communication.status === 'SCHEDULED' ? (
              <div className="text-orange-600 font-medium">
                Ready to send
              </div>
            ) : communication.status === 'SENT' ? (
              <>
                <div className="font-medium">{communication.sent} sent</div>
                <div className="text-green-600">{communication.delivered} delivered</div>
                {communication.failed > 0 && (
                  <div className="text-red-600">{communication.failed} failed</div>
                )}
              </>
            ) : (
              <div className="text-gray-500">
                {communication.status.toLowerCase()}
              </div>
            )}
          </div>
        </div>

        {/* Delivery Rate */}
        {communication.sent > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Delivery Rate</span>
              <span className="font-medium">{deliveryRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${deliveryRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Date Information */}
        <div className="space-y-2">
          {communication.status === 'SCHEDULED' && communication.scheduledAt && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-orange-800">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Scheduled in:</span>
              </div>
              <div className="text-orange-700 font-semibold text-lg mt-1">
                {formatScheduledDate(communication.scheduledAt)}
              </div>
            </div>
          )}
          
          {communication.status === 'SENT' && communication.sentAt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Sent on:</span>
              </div>
              <div className="text-green-700 font-semibold mt-1">
                {formatDate(communication.sentAt)}
              </div>
            </div>
          )}
          
          {communication.status === 'DRAFT' && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MessageSquare className="h-4 w-4" />
              <span>Created: {formatDate(communication.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Created By */}
        {communication.createdBy && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>
              By {communication.createdBy.firstName} {communication.createdBy.lastName}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/communications/${communicationId}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          
          {(communication.status === 'DRAFT' || communication.status === 'SCHEDULED') && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/communications/${communicationId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
          
          {communication.status === 'DRAFT' && onSend && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSend(communicationId)}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </Button>
          )}
          
          {(communication.status === 'DRAFT' || communication.status === 'SCHEDULED') && onDelete && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(communicationId)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
