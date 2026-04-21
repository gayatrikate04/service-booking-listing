'use client';
import { MOCK_CATEGORIES } from '@/data/mock';

export function ProviderFilters({ filters, onChange, onApply }) {

  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function toggleCategory(id) {
    update('categoryId', filters.categoryId === id ? null : id);
  }

  return (
    <aside className="w-full max-w-xs shrink-0 h-fit sticky top-24">
      
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-black">Filters</h3>
          <button
            onClick={() => onChange({ categoryId: null, minPrice: 0, maxPrice: 500, minRating: 0, search: '' })}
            className="text-xs text-gray-500 hover:text-black hover:underline transition"
          >
            Clear all
          </button>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Search</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search providers..."
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black placeholder:text-gray-400 transition"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Category</p>

          <div className="space-y-2">
            {MOCK_CATEGORIES.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center justify-between py-2 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.categoryId === cat.id}
                    onChange={() => toggleCategory(cat.id)}
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-black transition">
                    {cat.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{cat.count}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Price Range
          </p>

          <div className="bg-gray-50 p-3 rounded-lg space-y-3">
            <div className="text-sm text-gray-600">
              ${filters.minPrice} – ${filters.maxPrice}+
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                min={0}
                value={filters.minPrice || ''}
                onChange={(e) => update('minPrice', Number(e.target.value) || 0)}
                className="w-full text-center text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              />
              <input
                type="number"
                placeholder="Max"
                min={0}
                value={filters.maxPrice < 500 ? filters.maxPrice : ''}
                onChange={(e) => update('maxPrice', Number(e.target.value) || 500)}
                className="w-full text-center text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              />
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Rating
          </p>

          <div className="space-y-2">
            {[[4.5, '4.5 & up'], [4.0, '4.0 & up'], [3.5, '3.5 & up'], [3.0, '3.0 & up']].map(([val, label]) => (
              <label
                key={val}
                className="flex items-center gap-3 py-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === val}
                  onChange={() => update('minRating', val)}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm text-gray-700 group-hover:text-black transition">
                  {'★'.repeat(Math.floor(val))} {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={onApply}
          className="w-full bg-black text-white text-sm font-medium py-3 rounded-lg hover:bg-gray-900 transition-all duration-200"
        >
          Apply Filters
        </button>

      </div>
    </aside>
  );
}