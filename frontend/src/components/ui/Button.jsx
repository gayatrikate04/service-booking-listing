// Reusable button with all variants, sizes, loading state.
// Never write inline button styles in pages — use this.

import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

export function Button({
  children, onClick, type = 'button',
  variant = 'primary', size = 'md',
  disabled = false, loading = false,
  className = '', fullWidth = false,
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
    outline:   'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost:     'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success:   'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
    >
      {loading && <Spinner size="sm" className="border-current border-t-transparent" />}
      {children}
    </button>
  );
}