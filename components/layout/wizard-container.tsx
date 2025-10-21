"use client";

import React, { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, AlertCircle, X } from "lucide-react";
import Link from "next/link";

interface Step {
  id: string;
  title: string;
  description: string;
}

interface WizardContainerProps {
  children: ReactNode;
  title: string;
  description: string;
  backHref: string;
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
  error?: string | null;
  isLastStep?: boolean;
  isLoading?: boolean;
  submitLabel?: string;
  submitIcon?: ReactNode;
  additionalInfo?: ReactNode;
}

export function WizardContainer({
  children,
  title,
  description,
  backHref,
  steps,
  currentStep,
  onNext,
  onPrev,
  canProceed,
  error,
  isLastStep = false,
  isLoading = false,
  submitLabel = "Create",
  submitIcon,
  additionalInfo,
}: WizardContainerProps) {
  return (
    <AppShell>
      <div className="flex flex-col h-full sm:h-auto max-w-3xl mx-auto">
        {/* Header */}
        <div className="space-y-2 sm:space-y-3 flex-shrink-0 pt-2 sm:pt-4 md:pt-6 px-4 sm:px-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-0.5 sm:mt-1">
              {description}
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="py-2 flex-shrink-0 mx-4 sm:mx-6 mt-2 sm:mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Step Content - Scrollable */}
        <div className="flex-1 sm:flex-none overflow-y-auto py-2 sm:py-4 md:py-6 pb-32 sm:pb-0 px-4 sm:px-6 flex flex-col justify-center sm:block sm:justify-start">
          {children}
        </div>

        {/* Navigation - Fixed on mobile */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto flex-shrink-0 space-y-2 sm:space-y-3 pt-2 sm:pt-4 md:pt-6 px-4 sm:px-6 pb-4 sm:pb-6 md:pb-8 border-t bg-white dark:bg-gray-900 shadow-lg sm:shadow-none z-50">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
            <span className="truncate">{steps[currentStep]?.title}</span>
            <span className="whitespace-nowrap ml-2">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Additional Info (e.g., recipient count, cost estimate) */}
          {additionalInfo && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs lg:text-sm text-gray-500">
              {additionalInfo}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex flex-row items-center justify-between gap-2">
            {/* Exit Button */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 h-10 sm:h-11 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Link href={backHref}>
                <X className="h-3.5 w-3.5 mr-1" />
                Exit
              </Link>
            </Button>

            {/* Back and Next Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                onClick={onPrev}
                disabled={currentStep === 0}
                className="flex items-center justify-center text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 h-10 sm:h-11 text-sm px-3 sm:px-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>

              <Button
                onClick={onNext}
                disabled={isLoading || !canProceed}
                className="flex items-center justify-center h-10 sm:h-11 text-sm font-medium px-4 sm:px-6"
              >
                {isLoading ? (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2 animate-spin" />
                    {isLastStep ? "Creating..." : "Loading..."}
                  </>
                ) : (
                  <>
                    {isLastStep ? (
                      <>
                        {submitIcon}
                        {submitLabel}
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

