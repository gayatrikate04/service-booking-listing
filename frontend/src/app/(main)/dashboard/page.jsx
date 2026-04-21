'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingCard } from '@/components/booking/BookingCard';
import { BookingTimeline } from '@/components/booking/BookingTimeline';
import { Modal } from '@/components/ui/Modal';
import { ReviewForm } from '@/components/review/ReviewForm';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MOCK_BOOKINGS } from '@/data/mock';
import { bookingService } from '@/services/bookingService';
import { useUser } from '@/store/authStore';

// ── REAL API CONNECTION POINT ──
// Replace MOCK_BOOKINGS with:
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
//
// const { data, isLoading } = useQuery({
//   queryKey: ['my-bookings'],
//   queryFn: () => bookingService.getMyBookings({ page: 1, pageSize: 20 }),
// });
// const bookings = data?.bookings || [];

const TABS = [
  { key: 'all',         label: 'All Bookings' },
  { key: 'requested',   label: 'Pending' },
  { key: 'confirmed',   label: 'Confirmed' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed',   label: 'Completed' },
  { key: 'cancelled',   label: 'Cancelled' },
];

export default function DashboardPage() {
  const user   = useUser();
  const router = useRouter();

  const [activeTab,      setActiveTab]      = useState('all');
  const [bookings,       setBookings]       = useState(MOCK_BOOKINGS);
  const [cancelModal,    setCancelModal]    = useState(null);  // bookingId
  const [cancelReason,   setCancelReason]   = useState('');
  const [reviewModal,    setReviewModal]    = useState(null);  // booking object
  const [timelineModal,  setTimelineModal]  = useState(null);  // booking object
  const [cancelling,     setCancelling]     = useState(false);
  const [successMsg,     setSuccessMsg]     = useState('');

  if (!user) {
    router.push('/login');
    return null;
  }

  const filtered = activeTab === 'all'
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  const tabCounts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all'
      ? bookings.length
      : bookings.filter((b) => b.status === t.key).length;
    return acc;
  }, {});

  async function handleCancel() {
    if (!cancelReason.trim()) return;
    setCancelling(true);

    try {
      // REAL API CALL — PATCH /bookings/:id/status
      await bookingService.updateStatus(cancelModal, {
        status: 'cancelled',
        cancel_reason: cancelReason.trim(),
      });

      // Update local state (in production, React Query invalidation handles this)
      setBookings((prev) =>
        prev.map((b) => b.id === cancelModal ? { ...b, status: 'cancelled' } : b)
      );
      setCancelModal(null);
      setCancelReason('');
      setSuccessMsg('Booking cancelled successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  }

  function handleReviewSuccess() {
    setReviewModal(null);
    setSuccessMsg('Review submitted! Thank you for your feedback.');
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, <strong className="text-gray-700">{user.full_name}</strong>
          </p>
        </div>
        <Button variant="primary" onClick={() => router.push('/providers')}>
          + New Booking
        </Button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          ✓ {successMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',       count: bookings.length,                             color: 'bg-blue-50   text-blue-700' },
          { label: 'Upcoming',    count: bookings.filter(b => b.status==='confirmed').length, color: 'bg-green-50  text-green-700' },
          { label: 'Pending',     count: bookings.filter(b => b.status==='requested').length, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Completed',   count: bookings.filter(b => b.status==='completed').length, color: 'bg-purple-50 text-purple-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-xs font-medium mt-0.5 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-5 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tabCounts[tab.key] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tabCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Booking list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No bookings yet"
          message={activeTab === 'all' ? "You haven't made any bookings yet." : `No ${activeTab} bookings.`}
          action={() => router.push('/providers')}
          actionLabel="Browse Providers"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} onClick={() => setTimelineModal(booking)} className="cursor-pointer">
              <BookingCard
                booking={booking}
                onCancel={(id) => { setCancelModal(id); setCancelReason(''); }}
                onReview={(b)  => setReviewModal(b)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── CANCEL MODAL ── */}
      <Modal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel Booking"
        footer={
          <>
            <Button variant="outline" onClick={() => setCancelModal(null)} disabled={cancelling}>
              Keep Booking
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              loading={cancelling}
              disabled={!cancelReason.trim()}
            >
              Cancel Booking
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">
            Reason for cancellation <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason..."
            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
      </Modal>

      {/* ── REVIEW MODAL ── */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title="Leave a Review"
      >
        {reviewModal && (
          <ReviewForm
            booking={reviewModal}
            onSuccess={handleReviewSuccess}
            onCancel={() => setReviewModal(null)}
          />
        )}
      </Modal>

      {/* ── TIMELINE MODAL ── */}
      <Modal
        isOpen={!!timelineModal}
        onClose={() => setTimelineModal(null)}
        title="Booking Timeline"
        footer={
          <Button variant="outline" onClick={() => setTimelineModal(null)}>Close</Button>
        }
      >
        {timelineModal && (
          <div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
              <span className="text-2xl">{timelineModal.category_icon || '🔧'}</span>
              <div>
                <p className="text-sm font-semibold">{timelineModal.provider_name}</p>
                <p className="text-xs text-gray-500">{timelineModal.service_name}</p>
              </div>
            </div>
            {/* REAL API: fetch events from bookingService.getById(timelineModal.id).events */}
            <BookingTimeline events={[
              { id: 1, from_status: null,        to_status: 'requested', actor_name: 'You',      actor_role: 'customer', created_at: timelineModal.slot_date, notes: '' },
              { id: 2, from_status: 'requested', to_status: timelineModal.status, actor_name: 'Provider', actor_role: 'provider', created_at: timelineModal.slot_date, notes: '' },
            ]} />
          </div>
        )}
      </Modal>
    </div>
  );
}