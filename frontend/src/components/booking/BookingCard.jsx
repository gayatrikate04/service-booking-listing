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
    <div className="bg-white border border-gray-200 rounded-xl shadow-card p-4 flex gap-4">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">
        {category_icon || '🔧'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className="text-sm font-semibold text-gray-900 truncate">{provider_name}</p>
            <p className="text-xs text-gray-500">{service_name}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>📅 {formatDate(slot_date)}</span>
          <span>🕐 {formatTime(start_time)}</span>
          <span className="font-medium text-gray-900">${total_amount}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Link href={`/providers/${booking.provider_id}`}>
            <Button variant="outline" size="sm">View Provider</Button>
          </Link>
          {canCancel && (
            <Button variant="ghost" size="sm" onClick={() => onCancel(id)}
              className="text-red-600 hover:bg-red-50">
              Cancel
            </Button>
          )}
          {canReview && (
            <Button variant="success" size="sm" onClick={() => onReview(booking)}>
              Leave Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}