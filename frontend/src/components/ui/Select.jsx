export function Select({ label, error, children, className = '', ...props }) {
  return (
  <div className="flex flex-col gap-1.5 w-full min-w-0 overflow-hidden">

    {label && (
      <label className="text-sm font-medium text-gray-700 break-words">
        {label}
      </label>
    )}

    <select
      {...props}
      className={`w-full max-w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white
        border rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        break-words
        ${error ? 'border-red-400' : 'border-gray-300'}
        ${className}`}
    >
      {children}
    </select>

    {error && (
      <p className="text-xs text-red-600 flex items-start gap-1 break-words leading-relaxed">
        <span className="flex-shrink-0">
          ⚠
        </span>

        <span>
          {error}
        </span>
      </p>
    )}
  </div>
);
}