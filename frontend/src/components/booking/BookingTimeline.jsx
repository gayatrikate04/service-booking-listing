import { formatDate } from '@/utils/format';

export function BookingTimeline({ events = [] }) {
  if (!events.length) {
    return (
      <p className="text-sm text-gray-500 py-4">No history available yet.</p>
    );
  }

  return (
    <div className="relative pl-5">
      {/* Vertical line */}
      <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />

      {events.map((event, i) => (
        <div key={event.id || i} className="relative pb-5 last:pb-0">
          {/* Dot */}
          <div className="absolute -left-3 top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white" />

          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {event.from_status
                ? `${event.from_status} → ${event.to_status}`
                : event.to_status}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              By {event.actor_name || event.actor_role}
              {event.notes && ` · "${event.notes}"`}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(event.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}