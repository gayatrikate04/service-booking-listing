'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { formatDate, formatTime, getUpcomingDates } from '@/utils/format';
import { MOCK_PROVIDERS, MOCK_SLOTS } from '@/data/mock';
import { bookingService } from '@/services/bookingService';
import { useUser } from '@/store/authStore';

function BookingSteps({ step }) {
  const steps = ['Select Date', 'Choose Time', 'Confirm'];
  return (
    <div className="flex mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const done   = num < step;
        const active = num === step;
        return (
          <div key={label} className="flex-1 flex flex-col items-center relative">
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={`absolute top-3.5 left-1/2 right-0 h-px w-full -z-10 ${done ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mb-1.5 z-10 ${
              done   ? 'bg-blue-600 text-white' :
              active ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                       'bg-gray-100 text-gray-400'
            }`}>
              {done ? '✓' : num}
            </div>
            <span className={`text-xs ${active ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const user         = useUser();

  const providerId = Number(searchParams.get('providerId'));
  const serviceId  = Number(searchParams.get('serviceId'));

  const provider = MOCK_PROVIDERS.find((p) => p.id === providerId);
  const service  = provider?.services.find((s) => s.id === serviceId);

  const [step,     setStep]     = useState(1);
  const [date,     setDate]     = useState('');
  const [slot,     setSlot]     = useState(null);
  const [notes,    setNotes]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const upcomingDates = getUpcomingDates(14);

  if (!provider || !service) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Booking details not found.</p>
        <Button variant="outline" onClick={() => router.push('/providers')} className="mt-4">
          Browse Providers
        </Button>
      </div>
    );
  }

  async function confirmBooking() {
    if (!user) { router.push('/login'); return; }
    setLoading(true);
    setError('');

    try {
      // REAL API CALL — POST /bookings
      // Your backend runs: SELECT FOR UPDATE on time_slot, INSERT booking,
      // UPDATE slot to 'booked', INSERT booking_event, INSERT payment — all atomic
      await bookingService.create({
        provider_id:  provider.id,
        time_slot_id: slot.id,
        service_id:   service.id,
        notes:        notes.trim() || null,
      });

      // Redirect to success page
      router.push(
        `/booking/success?provider=${encodeURIComponent(provider.full_name)}&service=${encodeURIComponent(service.name)}&date=${date}&time=${slot.start_time}&amount=${service.price_per_hour}`
      );
    } catch (err) {
      // SLOT_UNAVAILABLE = someone else just booked it (your locking worked)
      if (err.code === 'SLOT_UNAVAILABLE') {
        setError('This slot was just booked by someone else. Please select another time.');
        setStep(2);
        setSlot(null);
      } else {
        setError(err.message || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-800 mb-6">
        ← Back
      </button>

      <BookingSteps step={step} />

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[1fr_280px] gap-6 items-start">
        {/* Main content */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-card p-6">

          {/* STEP 1: Date */}
          {step === 1 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">Select a date</h2>
              <p className="text-xs text-gray-500 mb-5">Choose your preferred date for the service</p>

              <div className="grid grid-cols-7 gap-2">
                {upcomingDates.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setDate(d.date)}
                    className={`flex flex-col items-center py-2.5 px-1 rounded-xl border text-center transition-all ${
                      date === d.date
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-[10px] opacity-70">{d.dayName}</span>
                    <span className="text-sm font-semibold mt-0.5">{d.dayNum}</span>
                  </button>
                ))}
              </div>

              <Button
                variant="primary" fullWidth
                onClick={() => setStep(2)}
                disabled={!date}
                className="mt-6"
              >
                Continue →
              </Button>
            </div>
          )}

          {/* STEP 2: Time slot */}
          {step === 2 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">Choose a time slot</h2>
              <p className="text-xs text-gray-500 mb-5">
                Available on {formatDate(date)}
              </p>

              {/* REAL API: replace MOCK_SLOTS with availabilityService.getSlots(provider.id, date) */}
              <div className="grid grid-cols-3 gap-3">
                {MOCK_SLOTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSlot(s)}
                    className={`py-3 text-sm font-medium rounded-xl border transition-all ${
                      slot?.id === s.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {formatTime(s.start_time)}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                <Button variant="primary" fullWidth onClick={() => setStep(3)} disabled={!slot}>
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-5">Confirm your booking</h2>

              {/* Provider summary */}
              <div className="flex gap-3 items-start p-4 bg-gray-50 rounded-xl mb-5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-semibold flex-shrink-0">
                  {getInitials(provider.full_name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{provider.full_name}</p>
                  <p className="text-xs text-gray-500">{provider.category} · {provider.city}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-5">
                {[
                  ['Service',  service.name],
                  ['Date',     formatDate(date)],
                  ['Time',     slot ? formatTime(slot.start_time) : ''],
                  ['Duration', '1 hour'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-500">{k}</span>
                    <span className="text-sm font-medium text-gray-900">{v}</span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Notes for provider{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or requirements..."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>
                  ← Back
                </Button>
                <Button variant="primary" fullWidth loading={loading} onClick={confirmBooking}>
                  Confirm & Book
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-card p-5 sticky top-20">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Booking Summary
          </p>

          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <span className="text-2xl">
              {['🧹', '🔧', '⚡', '🌿', '💆', '📚', '🐾', '📦'][provider.category_id - 1] || '🔧'}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">{provider.full_name}</p>
              <p className="text-xs text-gray-500">{provider.category}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Service</span>
              <span className="font-medium text-gray-900">{service.name}</span>
            </div>
            {date && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{formatDate(date)}</span>
              </div>
            )}
            {slot && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">{formatTime(slot.start_time)}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-base font-bold text-blue-600">${service.price_per_hour}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Per {provider.price_unit}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BookingContent />
    </Suspense>
  );
}