// Handles label, error message, hint text in one consistent component.
// Every form field uses this — never write raw <input> in pages.

export function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        {...props}
        className={`w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white
          border rounded-lg placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'}
          ${className}`}
      />
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600 flex items-center gap-1">⚠ {error}</p>}
    </div>
  );
}