// Single card wrapper used everywhere. Consistent shadow, border, radius.
import { cn } from '@/utils/cn';

export function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-xl shadow-card',
      padding && 'p-6',
      hover && 'transition-shadow hover:shadow-card-hover cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
}