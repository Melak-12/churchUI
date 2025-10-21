"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardContainer } from "@/components/layout/wizard-container";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { CheckCircle, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VotingWizard } from "@/components/voting/voting-wizard";
import { useToast } from "@/hooks/use-toast";

interface VoteFormData {
  title: string;
  description?: string;
  type: "SINGLE_CHOICE" | "YES_NO";
  options: string[];
  startAt: string;
  endAt: string;
  anonymous: boolean;
}

const steps = [
  { id: "title", title: "Vote Title", description: "What's the vote about?" },
  { id: "description", title: "Description", description: "Add details" },
  { id: "start", title: "Start Date", description: "When does it start?" },
  { id: "end", title: "End Date", description: "When does it end?" },
  { id: "type", title: "Vote Type", description: "Choose type" },
  { id: "options", title: "Options", description: "Add choices" },
  { id: "anonymous", title: "Privacy", description: "Anonymous?" },
  { id: "review", title: "Review", description: "Confirm details" },
];

export default function NewVotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibleMembersCount, setEligibleMembersCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: any }>({});

  const [voteData, setVoteData] = useState<VoteFormData>({
    title: "",
    description: "",
    type: "SINGLE_CHOICE",
    options: ["Option 1", "Option 2"],
    startAt: "",
    endAt: "",
    anonymous: false,
  });

  // Load eligible members count
  useEffect(() => {
    const loadEligibleMembers = async () => {
      try {
        const response = await apiClient.getMembers({
          eligibility: "ELIGIBLE",
          limit: 1,
        });

        if (response && response.pagination && typeof response.pagination.total === "number") {
          setEligibleMembersCount(response.pagination.total);
        } else if (response && Array.isArray(response.members)) {
          setEligibleMembersCount(response.members.length);
        } else {
          setEligibleMembersCount(0);
        }
      } catch (error) {
        console.error("Failed to load eligible members count:", error);
        setEligibleMembersCount(0);
      }
    };

    loadEligibleMembers();
  }, []);

  const updateVoteData = (updates: Partial<VoteFormData>) => {
    setVoteData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    // Skip options step if YES_NO type
    if (currentStep === 4 && voteData.type === "YES_NO") {
      setCurrentStep(6); // Skip to anonymous step
    } else if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    // Skip options step backwards if YES_NO type
    if (currentStep === 6 && voteData.type === "YES_NO") {
      setCurrentStep(4); // Go back to type step
    } else if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const validateOptions = (options: string[]) => {
    if (!options || options.length < 2) {
      return "At least 2 options are required";
    }
    if (options.some((option) => !option.trim())) {
      return "All options must be filled in";
    }
    return true;
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Title
        return voteData.title.trim().length > 0;
      case 1: // Description
        return true; // Optional
      case 2: // Start Date
        return voteData.startAt.length > 0;
      case 3: // End Date
        return voteData.endAt.length > 0;
      case 4: // Type
        return true;
      case 5: // Options (SINGLE_CHOICE only)
        return voteData.type === "YES_NO" || validateOptions(voteData.options) === true;
      case 6: // Anonymous
        return true;
      case 7: // Review
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    // Validate dates
    const startDate = new Date(voteData.startAt);
    const endDate = new Date(voteData.endAt);

    if (startDate >= endDate) {
      setError("End date must be after start date");
      return;
    }

    if (startDate <= new Date()) {
      setError("Start date must be in the future");
      return;
    }

    // Validate options
    const optionsValidation = validateOptions(voteData.options);
    if (optionsValidation !== true) {
      setError(optionsValidation);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const votePayload = {
        ...voteData,
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        status: "SCHEDULED" as const,
      };

      await apiClient.createVote(votePayload);

      setSuccessModalOpen(true);
    } catch (error: any) {
      setError(error.message || "Failed to create vote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
    router.push("/voting");
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  return (
    <>
      <WizardContainer
        title="Create New Vote"
        description="Set up a new vote or election for your community"
        backHref="/voting"
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={prevStep}
        canProceed={canProceed()}
        error={error}
        isLastStep={currentStep === steps.length - 1}
        isLoading={isSubmitting}
        submitLabel="Create Vote"
        submitIcon={<CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />}
        additionalInfo={
          <>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{eligibleMembersCount} eligible voters</span>
            </div>
          </>
        }
      >
        <VotingWizard
          step={currentStep}
          data={voteData}
          onUpdate={updateVoteData}
          eligibleMembersCount={eligibleMembersCount}
          errors={errors}
        />
      </WizardContainer>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Done!
            </DialogTitle>
            <DialogDescription className="text-center py-4">
              Vote created successfully!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button onClick={handleSuccessModalClose} className="w-full">
              View Votes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
