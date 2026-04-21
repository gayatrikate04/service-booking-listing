'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/store/authStore';
import { providerService } from '@/services/providerService';
import { availabilityService } from '@/services/availabilityService';
import { MOCK_CATEGORIES } from '@/data/mock';

const STEPS = ['Basic Info', 'Your Services', 'Availability', 'Complete'];
const DAYS  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
                'Mumbai', 'Pune', 'Delhi', 'Bengaluru', 'Chennai'];

export default function OnboardingPage() {
  const user   = useUser();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Step 1 fields
  const [info, setInfo] = useState({
    bio:              '',
    years_exp:        '',
    city:             user?.city || 'New York',
    service_radius_km: 10,
  });

  // Step 2 — services array
  const [services, setServices] = useState([
    { categoryId: '', name: '', price_per_hour: '', price_unit: 'per_hour', min_booking_hours: 1 }
  ]);

  // Step 3 — availability templates
  const [availability, setAvailability] = useState([
    { day_of_week: 1, start_time: '09:00', end_time: '18:00', slot_duration_min: 60, enabled: true },
    { day_of_week: 2, start_time: '09:00', end_time: '18:00', slot_duration_min: 60, enabled: true },
    { day_of_week: 3, start_time: '09:00', end_time: '18:00', slot_duration_min: 60, enabled: true },
    { day_of_week: 4, start_time: '09:00', end_time: '18:00', slot_duration_min: 60, enabled: true },
    { day_of_week: 5, start_time: '09:00', end_time: '18:00', slot_duration_min: 60, enabled: true },
    { day_of_week: 6, start_time: '09:00', end_time: '14:00', slot_duration_min: 60, enabled: false },
    { day_of_week: 0, start_time: '10:00', end_time: '14:00', slot_duration_min: 60, enabled: false },
  ]);

  // If not logged in as provider, redirect
  if (!user) { router.push('/login'); return null; }
  if (user.role !== 'provider') { router.push('/providers'); return null; }

  function addService() {
    setServices((prev) => [
      ...prev,
      { categoryId: '', name: '', price_per_hour: '', price_unit: 'per_hour', min_booking_hours: 1 }
    ]);
  }

  function removeService(i) {
    setServices((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateService(i, key, value) {
    setServices((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: value } : s));
  }

  function updateAvailability(i, key, value) {
    setAvailability((prev) => prev.map((a, idx) => idx === i ? { ...a, [key]: value } : a));
  }

  // ── STEP 1 SUBMIT ── Update provider profile
  async function submitStep1() {
    if (!info.bio.trim()) { setError('Please add a bio'); return; }
    if (!info.years_exp)  { setError('Please enter years of experience'); return; }
    setLoading(true); setError('');
    try {
      // REAL API CALL — PATCH /providers/me/profile
      await providerService.updateMyProfile({
        bio:               info.bio.trim(),
        years_exp:         Number(info.years_exp),
        service_radius_km: Number(info.service_radius_km),
      });
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  // ── STEP 2 SUBMIT ── Add each service
  async function submitStep2() {
    const valid = services.filter((s) => s.categoryId && s.price_per_hour);
    if (valid.length === 0) { setError('Add at least one service with a category and price'); return; }
    setLoading(true); setError('');
    try {
      // REAL API CALL — POST /providers/me/services for each service
      // Your backend uses INSERT ... ON DUPLICATE KEY UPDATE, so safe to call multiple times
      for (const svc of valid) {
        await providerService.addService({
          service_category_id: Number(svc.categoryId),
          price_per_hour:      Number(svc.price_per_hour),
          price_unit:          svc.price_unit,
          min_booking_hours:   Number(svc.min_booking_hours),
        });
      }
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to save services');
    } finally {
      setLoading(false);
    }
  }

  // ── STEP 3 SUBMIT ── Add availability templates
  async function submitStep3() {
    const enabled = availability.filter((a) => a.enabled);
    if (enabled.length === 0) { setError('Enable at least one working day'); return; }
    setLoading(true); setError('');
    try {
      // REAL API CALL — POST /availability/templates for each enabled day
      // The slot generator job (slotGenerator.js) runs nightly and creates time_slots from these
      for (const avail of enabled) {
        await availabilityService.addTemplate({
          day_of_week:       avail.day_of_week,
          start_time:        avail.start_time,
          end_time:          avail.end_time,
          slot_duration_min: avail.slot_duration_min,
        });
      }
      setStep(4); // Complete!
    } catch (err) {
      setError(err.message || 'Failed to save availability');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Progress */}
      <div className="flex mb-8">
        {STEPS.map((label, i) => {
          const num    = i + 1;
          const done   = num < step;
          const active = num === step;
          return (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              {i < STEPS.length - 1 && (
                <div className={`absolute top-3.5 left-1/2 w-full h-px ${done ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ zIndex: 0 }} />
              )}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold z-10 mb-1.5 ${
                done ? 'bg-blue-600 text-white' :
                active ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                         'bg-gray-100 text-gray-400'
              }`}>
                {done ? '✓' : num}
              </div>
              <span className={`text-xs ${active ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-7">

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── STEP 1: Basic Info ── */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Tell us about yourself</h2>
            <p className="text-sm text-gray-500 mb-6">This info appears on your public profile</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Professional Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={info.bio}
                  onChange={(e) => setInfo((i) => ({ ...i, bio: e.target.value }))}
                  placeholder="Describe your expertise, experience, and what makes you stand out..."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">{info.bio.length}/500</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Years of Experience *"
                  type="number"
                  min={0}
                  max={50}
                  value={info.years_exp}
                  onChange={(e) => setInfo((i) => ({ ...i, years_exp: e.target.value }))}
                  placeholder="e.g. 5"
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">City *</label>
                  <select
                    value={info.city}
                    onChange={(e) => setInfo((i) => ({ ...i, city: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Service Radius</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={5} max={50} step={5}
                    value={info.service_radius_km}
                    onChange={(e) => setInfo((i) => ({ ...i, service_radius_km: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-900 w-16">
                    {info.service_radius_km} km
                  </span>
                </div>
              </div>
            </div>

            <Button variant="primary" fullWidth loading={loading} onClick={submitStep1} className="mt-6">
              Save & Continue →
            </Button>
          </div>
        )}

        {/* ── STEP 2: Services ── */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Add your services</h2>
            <p className="text-sm text-gray-500 mb-6">Add each service you offer with its price</p>

            <div className="space-y-4">
              {services.map((svc, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-xl relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Service {i + 1}</span>
                    {services.length > 1 && (
                      <button
                        onClick={() => removeService(i)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-600">Category *</label>
                      <select
                        value={svc.categoryId}
                        onChange={(e) => updateService(i, 'categoryId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select category...</option>
                        {MOCK_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-600">Price *</label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number"
                            min={1}
                            value={svc.price_per_hour}
                            onChange={(e) => updateService(i, 'price_per_hour', e.target.value)}
                            placeholder="50"
                            className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <select
                          value={svc.price_unit}
                          onChange={(e) => updateService(i, 'price_unit', e.target.value)}
                          className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="per_hour">/ hr</option>
                          <option value="per_visit">/ visit</option>
                          <option value="per_sqft">/ sqft</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600">Min. Booking Hours</label>
                    <select
                      value={svc.min_booking_hours}
                      onChange={(e) => updateService(i, 'min_booking_hours', Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4].map((h) => (
                        <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addService}
              className="mt-3 w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              + Add Another Service
            </button>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
              <Button variant="primary" fullWidth loading={loading} onClick={submitStep2}>
                Save & Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Availability ── */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Set your availability</h2>
            <p className="text-sm text-gray-500 mb-6">
              Enable working days and set hours. Bookable slots are generated automatically each night.
            </p>

            <div className="space-y-2">
              {availability.map((avail, i) => (
                <div
                  key={avail.day_of_week}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
                    avail.enabled
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  {/* Toggle */}
                  <input
                    type="checkbox"
                    checked={avail.enabled}
                    onChange={(e) => updateAvailability(i, 'enabled', e.target.checked)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />

                  {/* Day name */}
                  <span className={`text-sm font-medium w-24 ${avail.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                    {DAYS[avail.day_of_week]}
                  </span>

                  {/* Time range */}
                  {avail.enabled && (
                    <>
                      <input
                        type="time"
                        value={avail.start_time}
                        onChange={(e) => updateAvailability(i, 'start_time', e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-400 text-sm">to</span>
                      <input
                        type="time"
                        value={avail.end_time}
                        onChange={(e) => updateAvailability(i, 'end_time', e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={avail.slot_duration_min}
                        onChange={(e) => updateAvailability(i, 'slot_duration_min', Number(e.target.value))}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 ml-auto"
                      >
                        <option value={30}>30 min</option>
                        <option value={60}>60 min</option>
                        <option value={90}>90 min</option>
                        <option value={120}>2 hrs</option>
                      </select>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <strong>How slots work:</strong> A nightly job generates bookable time slots from your schedule.
              After saving, slots will appear for customers within 24 hours.
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
              <Button variant="primary" fullWidth loading={loading} onClick={submitStep3}>
                Save & Complete →
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Complete ── */}
        {step === 4 && (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">
              🎉
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              You're live on ServiceBook!
            </h2>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Your profile is now visible to customers. Slots will be generated tonight and customers
              can start booking you by tomorrow.
            </p>

            <div className="space-y-3 text-left bg-gray-50 rounded-xl p-5 mb-6 max-w-sm mx-auto">
              {[
                ['Profile', 'Saved ✓', 'green'],
                ['Services', `${services.filter(s => s.categoryId).length} added ✓`, 'green'],
                ['Availability', `${availability.filter(a => a.enabled).length} days set ✓`, 'green'],
                ['Slots', 'Generated tonight', 'yellow'],
              ].map(([k, v, c]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{k}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    c === 'green' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/providers')}>
                View Listing
              </Button>
              <Button variant="primary" onClick={() => router.push('/provider/dashboard')}>
                Go to Dashboard →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}