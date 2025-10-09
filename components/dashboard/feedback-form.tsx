"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Star, Send, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FeedbackFormProps {
  onSubmit?: (data: {
    rating: number;
    category: string;
    feedback: string;
  }) => Promise<void>;
  compact?: boolean;
  isSubmitting?: boolean;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  compact = false,
  isSubmitting: externalSubmitting = false,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [category, setCategory] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isSubmitting = externalSubmitting;

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (onSubmit) {
      try {
        await onSubmit({ rating, category, feedback });
        // Only on success, reset form and show success message
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setRating(0);
          setCategory("");
          setFeedback("");
        }, 3000);
      } catch (error) {
        // Error is handled by parent component (toast notification)
        // Don't show success message on error
        console.error("Form submission error:", error);
      }
    }
  };

  if (submitted) {
    return (
      <Card className='border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800'>
        <CardContent className='p-8'>
          <div className='flex flex-col items-center justify-center space-y-4 text-center'>
            <div className='rounded-full bg-green-100 dark:bg-green-900 p-3'>
              <CheckCircle className='h-12 w-12 text-green-600 dark:text-green-400' />
            </div>
            <div>
              <h3 className='text-xl font-semibold text-green-900 dark:text-green-100'>
                Thank you for your feedback!
              </h3>
              <p className='text-green-700 dark:text-green-300 mt-2'>
                We appreciate your input and will use it to improve our
                services.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CardWrapper = compact ? "div" : Card;
  const contentProps = compact ? {} : { className: "space-y-6 p-6" };

  return (
    <CardWrapper>
      {!compact && (
        <CardHeader>
          <CardTitle>Share Your Feedback</CardTitle>
          <CardDescription>
            Help us improve by sharing your thoughts and experiences
          </CardDescription>
        </CardHeader>
      )}
      <CardContent {...contentProps}>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Rating */}
          <div className='space-y-2'>
            <Label className='text-base font-semibold'>
              How would you rate your experience?
            </Label>
            <div className='flex items-center space-x-2'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type='button'
                  key={star}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className='transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded'
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className='ml-3 text-sm text-muted-foreground'>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Category */}
          <div className='space-y-2'>
            <Label htmlFor='category' className='text-base font-semibold'>
              Feedback Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id='category'>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='general'>General Feedback</SelectItem>
                <SelectItem value='worship'>Worship Services</SelectItem>
                <SelectItem value='events'>Events & Programs</SelectItem>
                <SelectItem value='facilities'>Church Facilities</SelectItem>
                <SelectItem value='communication'>Communication</SelectItem>
                <SelectItem value='website'>Website/App</SelectItem>
                <SelectItem value='suggestion'>Suggestion</SelectItem>
                <SelectItem value='complaint'>Complaint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback Text */}
          <div className='space-y-2'>
            <Label htmlFor='feedback' className='text-base font-semibold'>
              Your Feedback
            </Label>
            <Textarea
              id='feedback'
              className='min-h-[120px] resize-none'
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder='Please share your thoughts, suggestions, or concerns...'
              required
            />
            <p className='text-xs text-muted-foreground'>
              {feedback.length} / 500 characters
            </p>
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={
              rating === 0 ||
              !category ||
              feedback.trim() === "" ||
              isSubmitting
            }
          >
            {isSubmitting ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent' />
                Submitting...
              </>
            ) : (
              <>
                <Send className='mr-2 h-4 w-4' />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </CardWrapper>
  );
};

export default FeedbackForm;
