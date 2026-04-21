// src/utils/dateUtils.js
// Date and time utility functions used across availability, booking,
// and slot generation modules. All functions are pure — no side effects,
// no DB calls, fully testable in isolation.

/**
 * Converts a TIME string "HH:MM:SS" or "HH:MM" to total minutes from midnight.
 * Used for duration calculation and overlap detection.
 */
export function timeToMinutes(timeStr) {
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

/**
 * Converts total minutes from midnight back to "HH:MM" string.
 */
export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Returns the duration in hours between two TIME strings.
 * Example: durationHours("09:00", "10:30") => 1.5
 */
export function durationHours(startTime, endTime) {
  return (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60;
}

/**
 * Checks whether two time intervals overlap.
 * Intervals are [start, end) — end-exclusive so adjacent slots don't overlap.
 * Classic interval overlap: A.start < B.end AND B.start < A.end
 */
export function intervalsOverlap(startA, endA, startB, endB) {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return sA < eB && sB < eA;
}

/**
 * Generates an array of time slot windows from a start time to end time
 * with a fixed duration per slot.
 *
 * Example: generateSlotWindows("09:00", "12:00", 60)
 * => [{ start: "09:00", end: "10:00" }, { start: "10:00", end: "11:00" }, ...]
 *
 * Used by the slot generator job to expand availability templates into
 * concrete time_slots rows.
 */
export function generateSlotWindows(startTime, endTime, durationMinutes) {
  const slots = [];
  let current = timeToMinutes(startTime);
  const end   = timeToMinutes(endTime);

  while (current + durationMinutes <= end) {
    slots.push({
      start_time: minutesToTime(current),
      end_time:   minutesToTime(current + durationMinutes),
    });
    current += durationMinutes;
  }

  return slots;
}

/**
 * Returns a DATE string "YYYY-MM-DD" for a given Date object.
 * Always uses local date, not UTC, to avoid off-by-one day errors.
 */
export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Adds N days to a given Date and returns a new Date.
 * Does not mutate the input.
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Returns the day-of-week integer (0=Sunday, 6=Saturday) for a Date object.
 * Matches the availability_templates.day_of_week column convention.
 */
export function getDayOfWeek(date) {
  return date.getDay();
}

/**
 * Returns true if a given DATE string is today or in the future.
 * Prevents creating bookings in the past.
 */
export function isFutureOrToday(dateStr) {
  const today = toDateString(new Date());
  return dateStr >= today;
}

/**
 * Returns an array of DATE strings for the next N days starting from tomorrow.
 * Used by the slot generator to know which dates need slot generation.
 */
export function getUpcomingDates(daysAhead = 30) {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= daysAhead; i++) {
    dates.push(toDateString(addDays(today, i)));
  }
  return dates;
}

/**
 * Formats a slot for display: "Mon, 15 Apr 2025 · 10:00 AM – 11:00 AM"
 */
export function formatSlotDisplay(slotDate, startTime, endTime) {
  const date = new Date(`${slotDate}T${startTime}`);
  const dateLabel = date.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
  const start = formatTime12h(startTime);
  const end   = formatTime12h(endTime);
  return `${dateLabel} · ${start} – ${end}`;
}

/**
 * Converts "HH:MM:SS" 24h format to "HH:MM AM/PM" 12h format.
 */
export function formatTime12h(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}