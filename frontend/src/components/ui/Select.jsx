export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        {...props}
        className={`w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white
          border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-400' : 'border-gray-300'}
          ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">⚠ {error}</p>}
    </div>
  );
}