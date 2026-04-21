import { cn } from '@/utils/cn';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-4' };
  return (
    <div className={cn('animate-spin rounded-full border-gray-200 border-t-blue-600', sizes[size], className)} />
  );
}

// Full-page loading state used at the top of async pages
export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  );
}