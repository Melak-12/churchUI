"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WizardContainer } from "@/components/layout/wizard-container";
import { Button } from "@/components/ui/button";
import { CreateEventRequest } from "@/types";
import apiClient from "@/lib/api";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EventWizard } from "@/components/events/event-wizard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const steps = [
  { id: "title", title: "Event Name", description: "What's the event called?" },
  { id: "description", title: "Description", description: "Tell us more" },
  { id: "type", title: "Event Type", description: "What kind of event?" },
  { id: "location", title: "Location", description: "Where is it?" },
  { id: "start", title: "Start Time", description: "When does it start?" },
  { id: "end", title: "End Time", description: "When does it end?" },
  { id: "registration", title: "Registration", description: "Capacity settings" },
  { id: "recurring", title: "Recurring", description: "Repeat pattern" },
  { id: "resources", title: "Resources", description: "Equipment & rooms" },
  { id: "review", title: "Review", description: "Confirm details" },
];

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [eventData, setEventData] = useState<CreateEventRequest>({
    title: "",
    description: "",
    type: "SERVICE",
    startDate: "",
    endDate: "",
    location: "",
    capacity: undefined,
    registrationRequired: false,
    registrationDeadline: "",
    allowWaitlist: false,
    maxWaitlist: undefined,
    status: "DRAFT",
    isRecurring: false,
    recurrencePattern: undefined,
    recurrenceEndDate: "",
    resources: [],
  });

  const updateEventData = (updates: Partial<CreateEventRequest>) => {
    setEventData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Title
        return eventData.title.trim().length > 0;
      case 1: // Description
        return true; // Optional
      case 2: // Type
        return eventData.type.length > 0;
      case 3: // Location
        return eventData.location.trim().length > 0;
      case 4: // Start Date
        return eventData.startDate.length > 0;
      case 5: // End Date
        return eventData.endDate.length > 0;
      case 6: // Registration
        return true; // Optional
      case 7: // Recurring
        if (eventData.isRecurring) {
          return !!eventData.recurrencePattern && !!eventData.recurrenceEndDate;
        }
        return true;
      case 8: // Resources
        return true; // Optional
      case 9: // Review
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      setError("Please complete all required fields");
      return;
    }

    if (new Date(eventData.endDate) <= new Date(eventData.startDate)) {
      setError("End date must be after start date");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const eventDataToSend = {
        ...eventData,
        resources: eventData.resources || [],
        recurrenceEndDate: eventData.recurrenceEndDate || undefined,
      };

      await apiClient.createEvent(eventDataToSend);

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      setSuccessModalOpen(true);
    } catch (error: any) {
      setError(error.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
    router.push("/events");
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
        title="Create New Event"
        description="Add a new church event, service, or meeting"
        backHref="/events"
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={prevStep}
        canProceed={canProceed()}
        error={error}
        isLastStep={currentStep === steps.length - 1}
        isLoading={loading}
        submitLabel="Create Event"
        submitIcon={<CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />}
      >
        <EventWizard
          step={currentStep}
          data={eventData}
          onUpdate={updateEventData}
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
              Event created successfully!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button onClick={handleSuccessModalClose} className="w-full">
              View Events
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
