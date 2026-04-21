'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProviderCard } from '@/components/provider/ProviderCard';
import { ProviderFilters } from '@/components/provider/ProviderFilters';
import { EmptyState } from '@/components/ui/EmptyState';
import { MOCK_PROVIDERS } from '@/data/mock';

// ── REAL API CONNECTION POINT ──
// When ready to go live, replace the mock filtering below with:
//
// import { useQuery } from '@tanstack/react-query';
// import { providerService } from '@/services/providerService';
//
// const { data, isLoading } = useQuery({
//   queryKey: ['providers', filters],
//   queryFn: () => providerService.searchByCategory(
//     filters.categoryId || 1,
//     { city: 'New York', minRating: filters.minRating, page: 1, pageSize: 20 }
//   ),
// });
// Then replace filteredProviders with data?.providers || []

export default function ProvidersPage() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    search:     '',
    categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null,
    minPrice:   0,
    maxPrice:   500,
    minRating:  0,
  });
  const [sort, setSort] = useState('recommended');

  // Client-side filtering — replace with API call in production
  const filteredProviders = useMemo(() => {
    let list = [...MOCK_PROVIDERS];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (filters.categoryId) {
      list = list.filter((p) => p.category_id === filters.categoryId);
    }
    if (filters.minRating) {
      list = list.filter((p) => p.avg_rating >= filters.minRating);
    }
    list = list.filter(
      (p) => p.price_per_hour >= filters.minPrice && p.price_per_hour <= filters.maxPrice
    );

    // Sort
    if (sort === 'rating')      list.sort((a, b) => b.avg_rating - a.avg_rating);
    else if (sort === 'pl')     list.sort((a, b) => a.price_per_hour - b.price_per_hour);
    else if (sort === 'ph')     list.sort((a, b) => b.price_per_hour - a.price_per_hour);
    else list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));

    return list;
  }, [filters, sort]);

  const selectedCat = filters.categoryId
    ? MOCK_PROVIDERS.find((p) => p.category_id === filters.categoryId)?.category
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-[280px_1fr] gap-6 items-start">

        {/* Sidebar */}
        <ProviderFilters
          filters={filters}
          onChange={setFilters}
          onApply={() => {}} // filters apply live — no button needed
        />

        {/* Results */}
        <div>
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {selectedCat && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, categoryId: null }))}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-100"
                >
                  {selectedCat} ✕
                </button>
              )}
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{filteredProviders.length}</span>{' '}
                provider{filteredProviders.length !== 1 ? 's' : ''} available
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="pl">Price: Low to High</option>
                <option value="ph">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filteredProviders.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No providers found"
              message="Try adjusting your filters or search term"
              action={() => setFilters({ search: '', categoryId: null, minPrice: 0, maxPrice: 500, minRating: 0 })}
              actionLabel="Clear all filters"
            />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                {filteredProviders.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
              <div className="text-center mt-8">
                <button className="border border-gray-300 text-sm text-gray-700 px-8 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  Load More Providers
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}