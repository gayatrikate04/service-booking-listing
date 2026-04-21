// Displays filled/empty stars for any rating value.
// Used on provider cards, review cards, and detail pages.

export function StarRating({ rating, size = 'sm', showValue = false }) {
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`${sizes[size]} text-amber-400`}>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className={i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}>
            ★
          </span>
        ))}
      </span>
      {showValue && (
        <span className={`${sizes[size]} font-medium text-gray-900`}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </span>
  );
}