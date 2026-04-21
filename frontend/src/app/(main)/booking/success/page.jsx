'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { formatDate, formatTime } from '@/utils/format';
import { PageLoader } from '@/components/ui/Spinner';

function SuccessContent() {
  const params    = useSearchParams();
  const provider  = params.get('provider')  || 'the provider';
  const service   = params.get('service')   || 'the service';
  const date      = params.get('date')      || '';
  const time      = params.get('time')      || '';
  const amount    = params.get('amount')    || '';
  const bookingId = `BK${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">

        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your request has been sent to <strong className="text-gray-700">{provider}</strong>.
          You'll be notified once they confirm.
        </p>

        {/* Details card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6 text-left mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Booking Details
          </p>

          {[
            ['Booking ID', bookingId],
            ['Provider',   provider],
            ['Service',    service],
            ['Date',       formatDate(date)],
            ['Time',       formatTime(time)],
            ['Amount',     amount ? `$${amount}` : '—'],
            ['Status',     'Requested'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">{k}</span>
              <span className={`text-sm font-medium ${k === 'Status' ? 'text-blue-600' : 'text-gray-900'}`}>
                {v}
              </span>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-6">
          <p className="text-sm text-blue-800">
            <strong>What happens next?</strong> The provider will review your request and confirm within a few hours.
            You can track your booking status in the dashboard.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1">
            <Button variant="primary" fullWidth>View My Bookings</Button>
          </Link>
          <Link href="/providers" className="flex-1">
            <Button variant="outline" fullWidth>Book Another</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SuccessContent />
    </Suspense>
  );
}