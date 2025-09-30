import React, { useState } from "react";

interface FeedbackFormProps {
  onSubmit?: (rating: number, feedback: string) => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(rating, feedback);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className='p-4 bg-green-50 border border-green-200 rounded-none text-green-800 text-center'>
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 p-4 border rounded-none bg-background'
    >
      <div>
        <label className='block text-sm font-medium mb-1'>
          Rate your experience:
        </label>
        <div className='flex space-x-1'>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type='button'
              key={star}
              onClick={() => handleRating(star)}
              className={`text-2xl focus:outline-none ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor='feedback' className='block text-sm font-medium mb-1'>
          Feedback
        </label>
        <textarea
          id='feedback'
          className='w-full border rounded-none p-2 min-h-[80px] bg-background'
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder='Let us know your thoughts...'
          required
        />
      </div>
      <button
        type='submit'
        className='bg-blue-600 text-white px-4 py-2 rounded-none hover:bg-blue-700 transition-colors w-full'
        disabled={rating === 0 || feedback.trim() === ""}
      >
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedbackForm;
