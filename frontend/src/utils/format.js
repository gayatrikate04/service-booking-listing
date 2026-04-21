// Pure formatting functions — no side effects, fully testable

export function formatPrice(amount, unit = 'hr') {
  return `$${amount}/${unit}`;
}

export function formatRating(rating) {
  return Number(rating).toFixed(1);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function getStatusLabel(status) {
  const map = {
    requested:   'Requested',
    confirmed:   'Confirmed',
    in_progress: 'In Progress',
    completed:   'Completed',
    cancelled:   'Cancelled',
    rejected:    'Rejected',
  };
  return map[status] || status;
}

export function getStatusColor(status) {
  const map = {
    requested:   'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed:   'bg-blue-50   text-blue-700   border-blue-200',
    in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
    completed:   'bg-green-50  text-green-700  border-green-200',
    cancelled:   'bg-red-50    text-red-700    border-red-200',
    rejected:    'bg-gray-50   text-gray-600   border-gray-200',
  };
  return map[status] || 'bg-gray-50 text-gray-600';
}

// Returns next N days from today as { date, dayName, dayNum }
export function getUpcomingDates(count = 14) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  const today  = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      date:    d.toISOString().slice(0, 10),
      dayName: days[d.getDay()],
      dayNum:  d.getDate(),
    });
  }
  return result;
}