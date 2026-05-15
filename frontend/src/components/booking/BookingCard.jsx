'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatTime, getStatusLabel, getStatusColor } from '@/utils/format';

export function BookingCard({ booking, onCancel, onReview }) {
  const {
    id, provider_name, service_name, status,
    slot_date, start_time, total_amount, category_icon,
  } = booking;

  const canCancel  = ['requested', 'confirmed'].includes(status);
  const canReview  = status === 'completed';

 return (
  <div className="bg-white border border-gray-200 rounded-xl shadow-card p-4 flex flex-col sm:flex-row gap-4 overflow-hidden">

    {/* Icon */}
    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
      {category_icon || '🔧'}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">

        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 break-words">
            {provider_name}
          </p>

          <p className="text-xs text-gray-500 break-words">
            {service_name}
          </p>
        </div>

        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 self-start ${getStatusColor(status)}`}
        >
          {getStatusLabel(status)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">

        <span className="break-words">
          📅 {formatDate(slot_date)}
        </span>

        <span className="break-words">
          🕐 {formatTime(start_time)}
        </span>

        <span className="font-medium text-gray-900 break-words">
          ${total_amount}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">

        <Link
          href={`/providers/${booking.provider_id}`}
          className="w-full sm:w-auto"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            View Provider
          </Button>
        </Link>

        {canCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(id)}
            className="w-full sm:w-auto text-red-600 hover:bg-red-50"
          >
            Cancel
          </Button>
        )}

        {canReview && (
          <Button
            variant="success"
            size="sm"
            onClick={() => onReview(booking)}
            className="w-full sm:w-auto"
          >
            Leave Review
          </Button>
        )}
      </div>
    </div>
  </div>
);
}