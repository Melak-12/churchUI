"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { EligibilityBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { getDocumentId } from "@/lib/utils";
import { isAuthenticated } from "@/lib/auth";
import {
  Vote as VoteIcon,
  Clock,
  AlertCircle,
  Check,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function BallotPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [vote, setVote] = useState<any>(null);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        if (!isAuthenticated()) {
          setError("You must be logged in to vote");
          return;
        }

        // Fetch vote data (includes hasVoted flag from backend)
        const voteData = await apiClient.getVote(params.id as string);
        setVote(voteData);

        // Check if user has already voted
        setHasVoted(voteData.hasVoted || false);

        // Fetch current user/member data
        const userData = await apiClient.getCurrentUser();
        setCurrentMember(userData);
      } catch (err: any) {
        console.error("Failed to fetch vote:", err);
        setError(err.message || "Failed to load vote");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Loading Vote...
            </h2>
            <p className="text-gray-600">
              Please wait while we load the vote details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Error Loading Vote
            </h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!vote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Vote Not Found
            </h2>
            <p className="text-gray-600">
              The requested vote could not be found or may have expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show "Already Voted" message if user has already cast their vote
  if (hasVoted && vote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              You&apos;ve Already Voted
            </h2>
            <p className="text-gray-600 mb-4">
              You have already cast your vote in: <strong>{vote.title}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {vote.status === "CLOSED"
                ? "The voting period has ended. Check the results below."
                : "Your vote has been recorded. Results will be available after the voting period ends."}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => (window.location.href = "/votes")}
                className="w-full"
              >
                Return to Votes
              </Button>
              {vote.status === "CLOSED" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `/voting/${getDocumentId(vote)}`)
                  }
                  className="w-full"
                >
                  View Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Vote Submitted!
            </h2>
            <p className="text-gray-600 mb-4">
              Thank you for participating in: <strong>{vote.title}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Results will be available after the voting period ends.
            </p>
            <Button
              onClick={() => (window.location.href = "/votes")}
              className="w-full"
            >
              Return to Votes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeRemaining = Math.max(
    0,
    new Date(vote.endAt).getTime() - new Date().getTime()
  );
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption && currentMember.eligibility === "ELIGIBLE") {
      try {
        // Get the vote ID, handling both _id and id fields (MongoDB compatibility)
        const voteId = getDocumentId(vote);
        await apiClient.castVote(voteId, selectedOption);
        setSubmitted(true);
      } catch (err: any) {
        console.error("Failed to cast vote:", err);
        setError(err.message || "Failed to submit vote");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <VoteIcon className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{vote.title}</CardTitle>
          {vote.description && (
            <CardDescription className="text-base mt-2">
              {vote.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Vote Status & Countdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {daysRemaining > 0 ? `${daysRemaining} days, ` : ""}
                {hoursRemaining} hours remaining
              </span>
            </div>
            <Badge className="bg-green-100 text-green-800">{vote.status}</Badge>
          </div>

          {/* Eligibility Status */}
          <Card
            className={`border-2 ${
              currentMember.eligibility === "ELIGIBLE"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <EligibilityBadge
                  eligibility={currentMember.eligibility}
                  reason={currentMember.eligibilityReason}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">Voting Eligibility</div>
                  {currentMember.eligibilityReason && (
                    <div className="text-xs text-gray-600 mt-1">
                      {currentMember.eligibilityReason}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ballot Options */}
          {currentMember.eligibility === "ELIGIBLE" ? (
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Cast Your Vote</CardTitle>
                  <CardDescription>Select your choice below</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedOption}
                    onValueChange={setSelectedOption}
                    className="space-y-3"
                  >
                    {vote.type === "YES_NO" ? (
                      <>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="Yes" id="yes" />
                          <Label
                            htmlFor="yes"
                            className="flex-1 cursor-pointer"
                          >
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="No" id="no" />
                          <Label htmlFor="no" className="flex-1 cursor-pointer">
                            No
                          </Label>
                        </div>
                      </>
                    ) : (
                      vote.options.map((option: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <RadioGroupItem
                            value={option}
                            id={`option-${index}`}
                          />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))
                    )}
                  </RadioGroup>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    disabled={!selectedOption}
                  >
                    Submit Vote
                  </Button>
                </CardContent>
              </Card>
            </form>
          ) : (
            <Card className="border-red-200">
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Unable to Vote
                </h3>
                <p className="text-gray-600">
                  {currentMember.eligibilityReason ||
                    "You are not eligible to participate in this vote."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Vote Information */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Vote ends on {new Date(vote.endAt).toLocaleDateString()} at{" "}
              {new Date(vote.endAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {vote.anonymous && (
              <p className="mt-1">
                This is an anonymous vote - your choice will not be linked to
                your identity.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
