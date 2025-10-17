"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { getDocumentId } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Square,
  BarChart3,
  Users,
  Clock,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
} from "lucide-react";
import Link from "next/link";

export default function VoteManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [vote, setVote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchVote = async () => {
      try {
        setLoading(true);
        console.log("Fetching vote with ID:", params.id);
        const voteData = await apiClient.getVote(params.id as string);
        console.log("Fetched vote data:", voteData);
        console.log("Vote options:", voteData.options);
        console.log("Vote results:", voteData.results);
        console.log("Vote title:", voteData.title);
        console.log("Vote status:", voteData.status);
        setVote(voteData);
      } catch (err: any) {
        console.error("Failed to fetch vote:", err);
        console.error("Error details:", err);
        setError(err.message || "Failed to load vote");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVote();
    }
  }, [params.id]);

  const fetchParticipants = async () => {
    if (!vote || vote.anonymous) return;

    try {
      setParticipantsLoading(true);
      setParticipantsError(null);
      const participantsData = await apiClient.getVoteParticipants(
        params.id as string
      );
      setParticipants(participantsData);
    } catch (err: any) {
      console.error("Failed to fetch participants:", err);
      setParticipantsError(err.message || "Failed to load participants");
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleStartVote = async () => {
    try {
      setActionLoading("start");
      // Get the vote ID, handling both _id and id fields (MongoDB compatibility)
      const voteId = getDocumentId(vote);
      const updatedVote = await apiClient.startVote(voteId);
      setVote(updatedVote);
      toast({
        title: "Vote Started",
        description: "The vote is now active and accepting votes.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to start vote",
        description:
          err.message || "An error occurred while starting the vote.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopVote = async () => {
    try {
      setActionLoading("stop");
      // Get the vote ID, handling both _id and id fields (MongoDB compatibility)
      const voteId = getDocumentId(vote);
      const updatedVote = await apiClient.stopVote(voteId);
      setVote(updatedVote);
      toast({
        title: "Vote Stopped",
        description:
          "The vote has been closed and is no longer accepting votes.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to stop vote",
        description:
          err.message || "An error occurred while stopping the vote.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteVote = async () => {
    try {
      setActionLoading("delete");
      // Get the vote ID, handling both _id and id fields (MongoDB compatibility)
      const voteId = getDocumentId(vote);
      await apiClient.deleteVote(voteId);
      toast({
        title: "Vote Deleted",
        description: "The vote has been successfully deleted.",
      });
      router.push("/voting");
    } catch (err: any) {
      toast({
        title: "Failed to delete vote",
        description:
          err.message || "An error occurred while deleting the vote.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4" />;
      case "SCHEDULED":
        return <Clock className="h-4 w-4" />;
      case "CLOSED":
        return <Square className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEdit = vote?.status === "SCHEDULED";
  const canStart = vote?.status === "SCHEDULED";
  const canStop = vote?.status === "ACTIVE";
  const canDelete = vote?.status === "SCHEDULED";

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/voting">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Votes
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="text-center py-12">
              <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading vote...
              </h3>
              <p className="text-gray-500">
                Please wait while we fetch the vote details.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (error || !vote) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/voting">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Votes
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error loading vote
              </h3>
              <p className="text-gray-500">{error || "Vote not found"}</p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  // Additional safety check for vote properties
  if (!vote || typeof vote !== "object") {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/voting">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Votes
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Invalid vote data
              </h3>
              <p className="text-gray-500">
                The vote data is not in the expected format.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-gray-600 hover:text-gray-900"
          >
            <Link href="/voting">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>

        {/* Main Content with Integrated Header */}
        <Tabs defaultValue="overview" className="space-y-4">
          {/* Integrated Header with Tabs */}
          <div className="space-y-4">
            {/* Title and Actions Row */}
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl leading-tight break-words hyphens-auto">
                    {vote.title}
                  </h1>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={getStatusColor(vote.status)}>
                      {getStatusIcon(vote.status)}
                      <span className="ml-1">{vote.status}</span>
                    </Badge>
                    {vote.anonymous && (
                      <Badge variant="outline">Anonymous</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {canEdit && (
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                  >
                    <Link
                      href={`/voting/${getDocumentId(vote)}/edit`}
                      className="flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                  </Button>
                )}

                {canStart && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleStartVote}
                    disabled={actionLoading === "start"}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading === "start" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    <span className="hidden sm:inline">Start Vote</span>
                    <span className="sm:hidden">Start</span>
                  </Button>
                )}

                {canStop && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStopVote}
                    disabled={actionLoading === "stop"}
                  >
                    {actionLoading === "stop" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Square className="h-4 w-4 mr-2" />
                    )}
                    <span className="hidden sm:inline">Stop Vote</span>
                    <span className="sm:hidden">Stop</span>
                  </Button>
                )}

                {canDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === "delete"}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                      >
                        {actionLoading === "delete" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Vote</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this vote? This action
                          cannot be undone. The vote &quot;{vote.title}&quot;
                          will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteVote}>
                          Delete Vote
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Tabs Navigation */}
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Description - Clean and prominent */}
            {vote.description && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-700 leading-relaxed">
                    {vote.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Vote Options - Simplified */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Vote Options</CardTitle>
              </CardHeader>
              <CardContent>
                {vote.options && vote.options.length > 0 ? (
                  <div className="space-y-3">
                    {vote.options.map((option: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-900">
                          {option}
                        </span>
                        {vote.results && vote.results[option] !== undefined && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {vote.results[option]} votes
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No options available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Info - Clean grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {vote.eligibleCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Eligible Members
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {vote.participationCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Votes Cast</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {vote.participationPercent || 0}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Participation Rate
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vote Details - Minimal */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Vote Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Vote Type
                    </div>
                    <div className="text-sm text-gray-900">
                      {vote.type === "SINGLE_CHOICE"
                        ? "Single Choice (Election)"
                        : "Yes/No (Approval)"}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Timeline
                    </div>
                    <div className="text-sm text-gray-900">
                      {vote.startAt && vote.endAt ? (
                        <span>
                          {formatDate(vote.startAt)} - {formatDate(vote.endAt)}
                        </span>
                      ) : (
                        <span className="text-gray-500">Not scheduled</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {vote.status === "CLOSED" || vote.participationCount > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Vote Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vote.results && Object.keys(vote.results).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(vote.results)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([option, count]) => {
                          const percentage =
                            vote.participationCount &&
                            vote.participationCount > 0
                              ? Math.round(
                                  ((count as number) /
                                    vote.participationCount) *
                                    100
                                )
                              : 0;
                          return (
                            <div key={option} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{option}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">
                                    {count as number} votes
                                  </span>
                                  <Badge variant="outline">{percentage}%</Badge>
                                </div>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Results Yet
                      </h3>
                      <p className="text-gray-500">
                        {vote.status === "CLOSED"
                          ? "No votes were cast for this election."
                          : "Results will appear here once votes are cast."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Results Not Available
                  </h3>
                  <p className="text-gray-500">
                    Results will be available after the vote closes or when
                    votes are cast.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent
            value="participants"
            className="space-y-6"
            onFocus={fetchParticipants}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Vote Participants</span>
                </CardTitle>
                <CardDescription>
                  {vote.anonymous
                    ? "This is an anonymous vote. Individual votes cannot be tracked."
                    : `${vote.participationCount || 0} member${
                        (vote.participationCount || 0) !== 1 ? "s have" : " has"
                      } voted so far.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vote.anonymous ? (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Anonymous Voting
                    </h3>
                    <p className="text-gray-500">
                      Individual votes are not tracked to maintain anonymity.
                    </p>
                  </div>
                ) : participantsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">Loading participants...</p>
                  </div>
                ) : participantsError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Error Loading Participants
                    </h3>
                    <p className="text-gray-500 mb-4">{participantsError}</p>
                    <Button
                      onClick={fetchParticipants}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Participants Yet
                    </h3>
                    <p className="text-gray-500">
                      No one has voted yet. Participants will appear here once
                      votes are cast.
                    </p>
                    <Button
                      onClick={fetchParticipants}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Showing {participants.length} participant
                        {participants.length !== 1 ? "s" : ""}
                      </p>
                      <Button
                        onClick={fetchParticipants}
                        variant="outline"
                        size="sm"
                      >
                        Refresh
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Voted At
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {participants.map((participant, index) => (
                            <tr
                              key={participant.voterId || index}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {participant.voterName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {participant.voterEmail && (
                                    <div>{participant.voterEmail}</div>
                                  )}
                                  {participant.voterPhone && (
                                    <div>{participant.voterPhone}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(participant.votedAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
