'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { reviewService } from '@/services/reviewService';

export function ReviewForm({ booking, onSuccess, onCancel }) {
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit() {
    if (!rating) { setError('Please select a rating'); return; }
    setLoading(true);
    setError('');

    try {
      // REAL API CALL — POST /reviews
      // Your backend enforces: booking must be completed, one review per booking
      await reviewService.create({
        booking_id: booking.id,
        rating,
        comment: comment.trim() || null,
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Provider info */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-5">
        <span className="text-2xl">{booking.category_icon || '🔧'}</span>
        <div>
          <p className="text-sm font-medium text-gray-900">{booking.provider_name}</p>
          <p className="text-xs text-gray-500">{booking.service_name}</p>
        </div>
      </div>

      {/* Star rating selector */}
      <div className="mb-5">
        <p className="text-sm font-medium text-gray-700 mb-2">Your rating</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-3xl transition-transform hover:scale-110 ${
                star <= rating ? 'text-amber-400' : 'text-gray-200'
              }`}
            >
              ★
            </button>
          ))}
          <span className="text-sm text-gray-500 self-center ml-1">
            {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
          </span>
        </div>
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Comment <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this provider..."
          className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">{comment.length}/2000</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          Submit Review
        </Button>
      </div>
    </div>
  );
}