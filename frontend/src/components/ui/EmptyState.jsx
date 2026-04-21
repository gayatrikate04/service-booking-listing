// Shows when a list has no results. Better than a blank screen.
import { Button } from './Button';

export function EmptyState({ icon = '📭', title, message, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {message && <p className="text-sm text-gray-500 mb-6 max-w-sm">{message}</p>}
      {action && actionLabel && (
        <Button variant="primary" onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
}