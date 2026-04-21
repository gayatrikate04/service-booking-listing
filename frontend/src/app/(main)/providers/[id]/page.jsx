'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReviewCard } from '@/components/review/ReviewCard';
import { getInitials, formatTime, formatDate, getUpcomingDates } from '@/utils/format';
import { MOCK_PROVIDERS, MOCK_REVIEWS, MOCK_SLOTS } from '@/data/mock';
import { useUser } from '@/store/authStore';

// ── REAL API CONNECTION POINT ──
// Replace mock data fetching with:
//
// import { useQuery } from '@tanstack/react-query';
// import { providerService } from '@/services/providerService';
// import { reviewService } from '@/services/reviewService';
// import { availabilityService } from '@/services/availabilityService';
//
// const { data: provider } = useQuery({
//   queryKey: ['provider', id],
//   queryFn: () => providerService.getProfile(id),
// });
// const { data: reviewData } = useQuery({
//   queryKey: ['reviews', id],
//   queryFn: () => reviewService.getByProvider(id),
// });
// For slots — fetch when date is selected:
// const { data: slotData, refetch } = useQuery({
//   queryKey: ['slots', id, selectedDate],
//   queryFn: () => availabilityService.getSlots(id, selectedDate),
//   enabled: !!selectedDate,
// });

export default function ProviderDetailPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const user    = useUser();

  const provider = MOCK_PROVIDERS.find((p) => p.id === Number(id));
  const reviews  = MOCK_REVIEWS[Number(id)] || [];

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate,    setSelectedDate]    = useState('');
  const [selectedSlot,    setSelectedSlot]    = useState(null);
  const [showAllReviews,  setShowAllReviews]  = useState(false);

  if (!provider) {
    return (
      <div className="text-center py-20 text-gray-500">
        Provider not found.{' '}
        <button className="text-blue-600 hover:underline" onClick={() => router.back()}>
          Go back
        </button>
      </div>
    );
  }

  // Rating distribution for the summary chart
  const ratingDist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));
  const maxCount = Math.max(...ratingDist.map((d) => d.count), 1);

  const canBook      = !!(selectedService && selectedDate && selectedSlot);
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  function handleBook() {
    if (!user) { router.push('/login'); return; }
    // Pass selection to booking flow page via query params
    router.push(
      `/booking?providerId=${provider.id}&serviceId=${selectedService.id}&date=${selectedDate}&slotId=${selectedSlot.id}`
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1"
      >
        ← Back to listings
      </button>

      <div className="grid grid-cols-[1fr_360px] gap-6 items-start">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5">

          {/* Provider Header Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-card p-6">
            <div className="flex gap-5 items-start">
              {/* Avatar / image */}
              <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-700 overflow-hidden flex-shrink-0">
                {provider.image ? (
                  <img src={provider.image} alt={provider.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : getInitials(provider.full_name)}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-semibold text-gray-900">{provider.full_name}</h1>
                  {provider.is_verified && <Badge variant="blue">✓ Verified</Badge>}
                  {provider.is_featured && <Badge variant="purple">Featured</Badge>}
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {provider.category} · {provider.years_exp} years experience
                </p>
                <div className="flex items-center gap-2">
                  <StarRating rating={provider.avg_rating} size="md" showValue />
                  <span className="text-sm text-gray-500">({provider.total_reviews} reviews)</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">📍 {provider.city}</p>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-gray-900">${provider.price_per_hour}</div>
                <div className="text-sm text-gray-500">per {provider.price_unit}</div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
              {[
                [provider.total_bookings, 'Bookings'],
                [provider.total_reviews,  'Reviews'],
                [`${provider.years_exp}yr`, 'Experience'],
                [provider.avg_rating.toFixed(1), 'Rating'],
              ].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{val}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{provider.bio}</p>
          </div>

          {/* Services */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-card p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Services Offered</h2>
            <div className="space-y-0 divide-y divide-gray-100">
              {provider.services.map((svc) => (
                <div key={svc.id} className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{svc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Professional service · {provider.years_exp} years exp
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-blue-600">
                      ${svc.price_per_hour}/{provider.price_unit}
                    </span>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => {
                        setSelectedService(svc);
                        document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">
                Reviews ({reviews.length})
              </h2>
            </div>

            {reviews.length > 0 ? (
              <>
                {/* Rating summary */}
                <div className="grid grid-cols-[auto_1fr] gap-6 mb-6 pb-6 border-b border-gray-100">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">{provider.avg_rating.toFixed(1)}</div>
                    <StarRating rating={provider.avg_rating} size="lg" />
                    <div className="text-xs text-gray-500 mt-1">{reviews.length} reviews</div>
                  </div>
                  <div className="space-y-1.5">
                    {ratingDist.map((d) => (
                      <div key={d.n} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-3 text-right">{d.n}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${(d.count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-5">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review list */}
                <div>
                  {displayedReviews.map((r) => <ReviewCard key={r.id} review={r} />)}
                </div>

                {reviews.length > 3 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="mt-4 text-sm text-blue-600 hover:underline"
                  >
                    {showAllReviews ? 'Show fewer reviews' : `Show all ${reviews.length} reviews`}
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">💬</div>
                <p className="text-sm">No reviews yet. Book this provider and be the first!</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN — Booking Widget ── */}
        <div id="booking-widget" className="bg-white border border-gray-200 rounded-xl shadow-card p-5 sticky top-20 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Book This Service</h3>
            <p className="text-xs text-gray-500 mt-0.5">Free cancellation up to 2 hours before</p>
          </div>

          {/* Service selection */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Service
            </label>
            <select
              value={selectedService?.id || ''}
              onChange={(e) => {
                const svc = provider.services.find((s) => s.id === Number(e.target.value));
                setSelectedService(svc || null);
              }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a service...</option>
              {provider.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — ${s.price_per_hour}/{provider.price_unit}
                </option>
              ))}
            </select>
          </div>

          {/* Date selection */}
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Slot selection — appears after date picked */}
          {/* REAL API: replace MOCK_SLOTS with availabilityService.getSlots(provider.id, selectedDate) */}
          {selectedDate && (
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                Available Slots
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MOCK_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      selectedSlot?.id === slot.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {formatTime(slot.start_time)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price summary */}
          {selectedService && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price</span>
                <span className="font-medium text-blue-600">${selectedService.price_per_hour}/{provider.price_unit}</span>
              </div>
            </div>
          )}

          {/* Book button */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            disabled={!canBook}
            onClick={handleBook}
          >
            {canBook ? 'Confirm Booking' : 'Select service, date & slot'}
          </Button>

          <div className="flex justify-around pt-2 border-t border-gray-100">
            {['🛡️ Insured', '✓ Verified', '💬 Support'].map((t) => (
              <span key={t} className="text-xs text-gray-500">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}