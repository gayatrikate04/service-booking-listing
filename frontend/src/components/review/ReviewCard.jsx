import { StarRating } from '@/components/ui/StarRating';
import { getInitials, formatDate } from '@/utils/format';

export function ReviewCard({ review }) {
  const { reviewer_name, rating, comment, created_at } = review;

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
            {getInitials(reviewer_name)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{reviewer_name}</p>
            <StarRating rating={rating} size="sm" />
          </div>
        </div>
        <span className="text-xs text-gray-400">{formatDate(created_at)}</span>
      </div>
      {comment && (
        <p className="text-sm text-gray-600 leading-relaxed pl-[2.6rem]">{comment}</p>
      )}
    </div>
  );
}