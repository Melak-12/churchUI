"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  MessageSquare,
  Calendar,
  DollarSign,
  Search,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  User,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api";

type AudienceType =
  | "ALL"
  | "ELIGIBLE"
  | "DELINQUENT_30"
  | "DELINQUENT_60"
  | "DELINQUENT_90"
  | "CUSTOM";

interface CommunicationData {
  name: string;
  audience: AudienceType;
  customAudience?: string[];
  body: string;
  scheduledAt?: string;
}

interface Member {
  id: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  eligibility: "ELIGIBLE" | "NOT_ELIGIBLE";
  status: "PAID" | "DELINQUENT";
}

interface CommunicationPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CommunicationData;
  memberCount: number;
  estimatedCost: string;
}

export function CommunicationPreview({
  open,
  onOpenChange,
  data,
  memberCount,
  estimatedCost,
}: CommunicationPreviewProps) {
  const [recipients, setRecipients] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch recipients based on audience
  useEffect(() => {
    if (open && data.audience !== "CUSTOM") {
      fetchRecipients();
    } else if (open && data.audience === "CUSTOM" && data.customAudience) {
      fetchCustomRecipients();
    }
  }, [open, data.audience, data.customAudience]);

  const fetchRecipients = async () => {
    setLoading(true);
    setError(null);

    try {
      let queryParams: any = { limit: 100 };

      switch (data.audience) {
        case "ELIGIBLE":
          queryParams.eligibility = "ELIGIBLE";
          break;
        case "DELINQUENT_30":
          queryParams.status = "DELINQUENT";
          // Note: In a real implementation, you'd need to filter by delinquency days
          break;
        case "DELINQUENT_60":
          queryParams.status = "DELINQUENT";
          break;
        case "DELINQUENT_90":
          queryParams.status = "DELINQUENT";
          break;
        default:
          // ALL members
          break;
      }

      const response = await apiClient.getMembers(queryParams);
      setRecipients(response.members);
    } catch (err: any) {
      setError(err.message || "Failed to fetch recipients");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomRecipients = async () => {
    if (!data.customAudience || data.customAudience.length === 0) {
      setRecipients([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const memberPromises = data.customAudience.map((id) =>
        apiClient.getMember(id)
      );
      const members = await Promise.all(memberPromises);
      setRecipients(members);
    } catch (err: any) {
      setError(err.message || "Failed to fetch custom recipients");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipients = recipients.filter(
    (member) =>
      (member.firstName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (member.lastName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      (member.email &&
        member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAudienceDescription = (audience: AudienceType): string => {
    switch (audience) {
      case "ALL":
        return "All members in the database";
      case "ELIGIBLE":
        return "Members who can vote (not delinquent > 90 days)";
      case "DELINQUENT_30":
        return "Members delinquent 0-30 days";
      case "DELINQUENT_60":
        return "Members delinquent 31-60 days";
      case "DELINQUENT_90":
        return "Members delinquent 61-90 days";
      case "CUSTOM":
        return "Custom selection of members";
      default:
        return "";
    }
  };

  const generateMessagePreview = (member: Member): string => {
    let preview = data.body;
    preview = preview.replace(/\{\{firstName\}\}/g, member.firstName || "");
    preview = preview.replace(/\{\{lastName\}\}/g, member.lastName || "");
    preview = preview.replace(/\{\{eligibility\}\}/g, member.eligibility);
    preview = preview.replace(
      /\{\{ballotLink\}\}/g,
      "https://church.app/vote/123"
    );
    preview = preview.replace(
      /\{\{registerLink\}\}/g,
      "https://church.app/register"
    );
    return preview;
  };

  const getEligibilityIcon = (eligibility: string) => {
    return eligibility === "ELIGIBLE" ? (
      <CheckCircle2 className='h-4 w-4 text-green-500' />
    ) : (
      <AlertCircle className='h-4 w-4 text-red-500' />
    );
  };

  const getStatusColor = (status: string) => {
    return status === "PAID"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <MessageSquare className='h-5 w-5' />
            <span>Campaign Preview</span>
          </DialogTitle>
          <DialogDescription>
            Review your campaign details and recipient list before sending
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-4'
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='recipients'>
              Recipients ({memberCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Campaign Details */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Name
                    </Label>
                    <p className='text-sm font-medium'>{data.name}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Audience
                    </Label>
                    <p className='text-sm font-medium'>
                      {getAudienceDescription(data.audience)}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Recipients
                    </Label>
                    <div className='flex items-center space-x-2'>
                      <Users className='h-4 w-4 text-gray-500' />
                      <span className='text-sm font-medium'>
                        {memberCount} members
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Timing
                    </Label>
                    <div className='flex items-center space-x-2'>
                      <Calendar className='h-4 w-4 text-gray-500' />
                      <span className='text-sm font-medium'>
                        {data.scheduledAt
                          ? new Date(data.scheduledAt).toLocaleString()
                          : "Send immediately"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Message Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Message Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='p-3 bg-gray-50 rounded-lg border'>
                    <div className='text-sm whitespace-pre-wrap'>
                      {data.body || "No message content"}
                    </div>
                  </div>
                  <div className='mt-3 flex items-center justify-between text-sm text-gray-500'>
                    <span>{data.body.length}/1600 characters</span>
                    <div className='flex items-center space-x-2'>
                      <DollarSign className='h-4 w-4' />
                      <span className='font-medium'>{estimatedCost}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sample Messages */}
            {recipients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Sample Messages</CardTitle>
                  <CardDescription>
                    How the message will appear to different recipients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {recipients.slice(0, 3).map((member) => (
                      <div key={member.id} className='p-3 border rounded-lg'>
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center space-x-2'>
                            <User className='h-4 w-4 text-gray-500' />
                            <span className='text-sm font-medium'>
                              {member.firstName} {member.lastName}
                            </span>
                            {getEligibilityIcon(member.eligibility)}
                          </div>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </div>
                        <div className='text-sm text-gray-600 bg-gray-50 p-2 rounded'>
                          {generateMessagePreview(member)}
                        </div>
                      </div>
                    ))}
                    {recipients.length > 3 && (
                      <div className='text-sm text-gray-500 text-center py-2'>
                        ... and {recipients.length - 3} more recipients
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value='recipients' className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='flex items-center space-x-2'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                  <span className='text-sm text-gray-500'>
                    Loading recipients...
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search recipients...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>

                {/* Recipients Table */}
                <Card>
                  <CardContent className='p-0'>
                    <div className='max-h-96 overflow-y-auto'>
                      <Table>
                        <TableHeader className='sticky top-0 bg-white'>
                          <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Eligibility</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRecipients.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className='flex items-center space-x-2'>
                                  <User className='h-4 w-4 text-gray-400' />
                                  <div>
                                    <div className='font-medium'>
                                      {member.firstName} {member.lastName}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className='space-y-1'>
                                  <div className='flex items-center space-x-1 text-sm'>
                                    <Phone className='h-3 w-3 text-gray-400' />
                                    <span>{member.phone}</span>
                                  </div>
                                  {member.email && (
                                    <div className='flex items-center space-x-1 text-sm text-gray-500'>
                                      <Mail className='h-3 w-3 text-gray-400' />
                                      <span>{member.email}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(member.status)}
                                >
                                  {member.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className='flex items-center space-x-1'>
                                  {getEligibilityIcon(member.eligibility)}
                                  <span className='text-sm'>
                                    {member.eligibility}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {filteredRecipients.length === 0 && !loading && (
                  <div className='text-center py-8 text-gray-500'>
                    <Users className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                    <p>No recipients found</p>
                    {searchTerm && (
                      <p className='text-sm'>Try adjusting your search terms</p>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className='flex justify-end space-x-2 pt-4 border-t'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
