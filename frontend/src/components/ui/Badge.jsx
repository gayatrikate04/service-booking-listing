import { cn } from '@/utils/cn';

const variants = {
  blue:   'bg-blue-50   text-blue-700   border-blue-200',
  green:  'bg-green-50  text-green-700  border-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  red:    'bg-red-50    text-red-700    border-red-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  gray:   'bg-gray-50   text-gray-600   border-gray-200',
};

export function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variants[variant], className
    )}>
      {children}
    </span>
  );
}