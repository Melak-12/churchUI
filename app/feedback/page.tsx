"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";
import { FeedbackForm } from "@/components/dashboard/feedback-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MessageCircle, TrendingUp, Users, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function FeedbackPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async (data: {
    rating: number;
    category: string;
    feedback: string;
  }) => {
    setIsSubmitting(true);
    try {
      await apiClient.submitFeedback({
        rating: data.rating,
        category: data.category,
        feedback: data.feedback,
      });

      toast({
        title: "Feedback Submitted!",
        description:
          "Thank you for your feedback. We'll review it and get back to you soon.",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className='space-y-6'>
          {/* Header */}
          <div className='bg-card rounded-xl p-6 border shadow-sm'>
            <div className='flex items-center space-x-3 mb-2'>
              <div className='p-2 bg-blue-500 rounded-lg shadow-md'>
                <MessageCircle className='h-6 w-6 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-foreground'>
                Feedback & Suggestions
              </h1>
            </div>
            <p className='text-muted-foreground'>
              Your voice matters! Share your thoughts to help us serve you
              better
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Main Feedback Form */}
            <div className='lg:col-span-2'>
              <FeedbackForm
                onSubmit={handleFeedbackSubmit}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* Sidebar Information */}
            <div className='space-y-6'>
              {/* Why Your Feedback Matters */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Why Share Feedback?</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-start space-x-3'>
                    <div className='p-2 bg-blue-100 dark:bg-blue-900 rounded-lg'>
                      <TrendingUp className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-sm'>
                        Continuous Improvement
                      </h4>
                      <p className='text-xs text-muted-foreground'>
                        Help us enhance our services and programs
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='p-2 bg-green-100 dark:bg-green-900 rounded-lg'>
                      <Users className='h-5 w-5 text-green-600 dark:text-green-400' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-sm'>Community Voice</h4>
                      <p className='text-xs text-muted-foreground'>
                        Your input shapes our church community
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='p-2 bg-purple-100 dark:bg-purple-900 rounded-lg'>
                      <Calendar className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-sm'>Better Events</h4>
                      <p className='text-xs text-muted-foreground'>
                        Help us plan events that meet your needs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Tips for Great Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 text-sm text-muted-foreground'>
                    <li className='flex items-start'>
                      <span className='mr-2'>✓</span>
                      <span>Be specific about what you experienced</span>
                    </li>
                    <li className='flex items-start'>
                      <span className='mr-2'>✓</span>
                      <span>
                        Include both positive and constructive comments
                      </span>
                    </li>
                    <li className='flex items-start'>
                      <span className='mr-2'>✓</span>
                      <span>Suggest solutions when pointing out issues</span>
                    </li>
                    <li className='flex items-start'>
                      <span className='mr-2'>✓</span>
                      <span>Be respectful and considerate</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className='bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800'>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    Need Immediate Help?
                  </CardTitle>
                  <CardDescription>
                    For urgent matters, please visit our Support page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href='/support'
                    className='inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    Go to Support
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
