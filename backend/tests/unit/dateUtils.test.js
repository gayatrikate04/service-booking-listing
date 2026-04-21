// tests/unit/dateUtils.test.js

import {
  timeToMinutes, minutesToTime, durationHours,
  intervalsOverlap, generateSlotWindows,
  toDateString, addDays, getDayOfWeek
} from '../../src/utils/dateUtils.js';

describe('timeToMinutes', () => {
  it('converts 09:00 to 540', () => expect(timeToMinutes('09:00')).toBe(540));
  it('converts 00:00 to 0',   () => expect(timeToMinutes('00:00')).toBe(0));
  it('converts 23:59 to 1439',() => expect(timeToMinutes('23:59')).toBe(1439));
});

describe('intervalsOverlap', () => {
  it('detects overlap when intervals share time', () => {
    expect(intervalsOverlap('09:00','10:00','09:30','10:30')).toBe(true);
  });
  it('returns false for adjacent non-overlapping slots', () => {
    expect(intervalsOverlap('09:00','10:00','10:00','11:00')).toBe(false);
  });
  it('detects overlap when one interval contains the other', () => {
    expect(intervalsOverlap('08:00','12:00','09:00','11:00')).toBe(true);
  });
  it('returns false for completely separate intervals', () => {
    expect(intervalsOverlap('09:00','10:00','11:00','12:00')).toBe(false);
  });
});

describe('generateSlotWindows', () => {
  it('generates correct number of 60-min slots', () => {
    const slots = generateSlotWindows('09:00', '12:00', 60);
    expect(slots).toHaveLength(3);
    expect(slots[0]).toEqual({ start_time: '09:00', end_time: '10:00' });
    expect(slots[2]).toEqual({ start_time: '11:00', end_time: '12:00' });
  });

  it('generates 30-min slots correctly', () => {
    const slots = generateSlotWindows('10:00', '11:30', 30);
    expect(slots).toHaveLength(3);
  });

  it('returns empty array when duration does not fit', () => {
    const slots = generateSlotWindows('10:00', '10:30', 60);
    expect(slots).toHaveLength(0);
  });
});