// Merges Tailwind class strings, filters out falsy values.
// Usage: cn('px-4 py-2', isActive && 'bg-blue-600', className)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}