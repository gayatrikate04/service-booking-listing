// Shows when a list has no results. Better than a blank screen.
import { Button } from './Button';

export function EmptyState({ icon = '📭', title, message, action, actionLabel }) {
  return (
  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center overflow-hidden">

    <span className="text-4xl sm:text-5xl mb-4 break-words">
      {icon}
    </span>

    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 break-words">
      {title}
    </h3>

    {message && (
      <p className="text-sm text-gray-500 mb-6 max-w-sm leading-relaxed break-words">
        {message}
      </p>
    )}

    {action && actionLabel && (
      <Button
        variant="primary"
        onClick={action}
        className="w-full sm:w-auto"
      >
        {actionLabel}
      </Button>
    )}
  </div>
);
}