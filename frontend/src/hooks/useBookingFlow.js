// Custom hook that encapsulates the multi-step booking flow.
// Keeps BookingPage.jsx lean by moving all state + logic here.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookingService } from '@/services/bookingService';
import { useUser } from '@/store/authStore';

export function useBookingFlow(provider, service) {
  const user   = useUser();
  const router = useRouter();

  const [step,    setStep]    = useState(1); // 1=date, 2=slot, 3=confirm
  const [date,    setDate]    = useState('');
  const [slot,    setSlot]    = useState(null);
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  function nextStep() {
    if (step < 3) setStep(step + 1);
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  function selectDate(d) {
    setDate(d);
    setSlot(null); // reset slot when date changes
  }

  async function confirm() {
    if (!user) { router.push('/login'); return; }
    setLoading(true);
    setError('');

    try {
      await bookingService.create({
        provider_id:  provider.id,
        time_slot_id: slot.id,
        service_id:   service.id,
        notes:        notes.trim() || null,
      });
      router.push(
        `/booking/success?provider=${encodeURIComponent(provider.full_name)}&service=${encodeURIComponent(service.name)}&date=${date}&time=${slot.start_time}&amount=${service.price_per_hour}`
      );
    } catch (err) {
      if (err.code === 'SLOT_UNAVAILABLE') {
        setError('This slot was just booked. Please select another time.');
        setStep(2);
        setSlot(null);
      } else {
        setError(err.message || 'Booking failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const canProceed = step === 1 ? !!date : step === 2 ? !!slot : true;

  return {
    step, date, slot, notes, loading, error, canProceed,
    setNotes, nextStep, prevStep, selectDate, selectSlot: setSlot, confirm,
  };
}