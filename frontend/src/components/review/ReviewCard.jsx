import { StarRating } from '@/components/ui/StarRating';
import { getInitials, formatDate } from '@/utils/format';

export function ReviewCard({ review }) {
  const { reviewer_name, rating, comment, created_at } = review;

  return (
  <div className="py-4 border-b border-gray-100 last:border-0 overflow-hidden">

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">

      <div className="flex items-start gap-2.5 min-w-0">

        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
          {getInitials(reviewer_name)}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 break-words">
            {reviewer_name}
          </p>

          <StarRating
            rating={rating}
            size="sm"
          />
        </div>
      </div>

      <span className="text-xs text-gray-400 sm:text-right break-words">
        {formatDate(created_at)}
      </span>
    </div>

    {comment && (
      <p className="text-sm text-gray-600 leading-relaxed sm:pl-[2.6rem] break-words">
        {comment}
      </p>
    )}
  </div>
);
}