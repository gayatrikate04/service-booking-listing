// tests/unit/booking.service.test.js
// Unit tests for booking business logic.
// ALL external dependencies mocked — no DB, no network.

import { jest } from '@jest/globals';

// Mock the entire db module before importing anything that uses it
jest.unstable_mockModule('../../src/config/db.js', () => ({
  withTransaction: jest.fn(async (fn) => {
    const mockConn = {};
    return fn(mockConn);
  }),
}));

jest.unstable_mockModule('../../src/modules/bookings/booking.repository.js', () => ({
  bookingRepository: {
    findSlotForUpdate:          jest.fn(),
    findProviderServiceForShare: jest.fn(),
    createBooking:              jest.fn(),
    markSlotBooked:             jest.fn(),
    markSlotAvailable:          jest.fn(),
    insertBookingEvent:         jest.fn(),
    createPaymentRecord:        jest.fn(),
    findBookingByIdForUpdate:   jest.fn(),
    updateBookingStatus:        jest.fn(),
    findBookingById:            jest.fn(),
  }
}));

const { bookingService }    = await import('../../src/modules/bookings/booking.service.js');
const { bookingRepository } = await import('../../src/modules/bookings/booking.repository.js');

describe('bookingService.createBooking', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws SLOT_UNAVAILABLE when slot is already booked', async () => {
    bookingRepository.findSlotForUpdate.mockResolvedValue(null);

    await expect(
      bookingService.createBooking({
        customerId: 1, providerId: 2, timeSlotId: 99, serviceId: 5
      })
    ).rejects.toMatchObject({ code: 'SLOT_UNAVAILABLE', statusCode: 409 });

    expect(bookingRepository.createBooking).not.toHaveBeenCalled();
  });

  it('throws SERVICE_NOT_FOUND when service does not belong to provider', async () => {
    bookingRepository.findSlotForUpdate.mockResolvedValue({
      id: 99, start_time: '10:00:00', end_time: '11:00:00'
    });
    bookingRepository.findProviderServiceForShare.mockResolvedValue(null);

    await expect(
      bookingService.createBooking({
        customerId: 1, providerId: 2, timeSlotId: 99, serviceId: 5
      })
    ).rejects.toMatchObject({ code: 'SERVICE_NOT_FOUND' });
  });

  it('creates booking and returns bookingId when slot is available', async () => {
    bookingRepository.findSlotForUpdate.mockResolvedValue({
      id: 99, start_time: '10:00:00', end_time: '11:00:00'
    });
    bookingRepository.findProviderServiceForShare.mockResolvedValue({
      price_per_hour: 500, min_booking_hours: 1, service_name: 'Plumbing'
    });
    bookingRepository.createBooking.mockResolvedValue(42);
    bookingRepository.markSlotBooked.mockResolvedValue();
    bookingRepository.insertBookingEvent.mockResolvedValue();
    bookingRepository.createPaymentRecord.mockResolvedValue();

    const result = await bookingService.createBooking({
      customerId: 1, providerId: 2, timeSlotId: 99, serviceId: 5, notes: 'Please be on time'
    });

    expect(result.bookingId).toBe(42);
    expect(result.totalAmount).toBe(500);
    expect(bookingRepository.markSlotBooked).toHaveBeenCalledWith(99, expect.anything());
    expect(bookingRepository.insertBookingEvent).toHaveBeenCalled();
    expect(bookingRepository.createPaymentRecord).toHaveBeenCalledWith(42, 500, expect.anything());
  });

  it('calculates totalAmount correctly for multi-hour slots', async () => {
    bookingRepository.findSlotForUpdate.mockResolvedValue({
      id: 99, start_time: '09:00:00', end_time: '12:00:00' // 3 hours
    });
    bookingRepository.findProviderServiceForShare.mockResolvedValue({
      price_per_hour: 400, min_booking_hours: 1, service_name: 'Cleaning'
    });
    bookingRepository.createBooking.mockResolvedValue(1);
    bookingRepository.markSlotBooked.mockResolvedValue();
    bookingRepository.insertBookingEvent.mockResolvedValue();
    bookingRepository.createPaymentRecord.mockResolvedValue();

    const result = await bookingService.createBooking({
      customerId: 1, providerId: 2, timeSlotId: 99, serviceId: 3
    });

    expect(result.totalAmount).toBe(1200); // 400 * 3
  });
});

describe('bookingService.updateBookingStatus — state machine', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws INVALID_TRANSITION for impossible state change', async () => {
    bookingRepository.findBookingByIdForUpdate.mockResolvedValue({
      id: 1, status: 'completed', customer_id: 1, provider_id: 2, time_slot_id: 99
    });

    await expect(
      bookingService.updateBookingStatus({
        bookingId: 1, targetStatus: 'requested',
        actorId: 2, actorRole: 'provider'
      })
    ).rejects.toMatchObject({ code: 'INVALID_TRANSITION' });
  });

  it('throws UNAUTHORIZED_TRANSITION when customer tries to confirm', async () => {
    bookingRepository.findBookingByIdForUpdate.mockResolvedValue({
      id: 1, status: 'requested', customer_id: 1, provider_id: 2, time_slot_id: 99
    });

    await expect(
      bookingService.updateBookingStatus({
        bookingId: 1, targetStatus: 'confirmed',
        actorId: 1, actorRole: 'customer'
      })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED_TRANSITION' });
  });

  it('allows provider to confirm a requested booking', async () => {
    bookingRepository.findBookingByIdForUpdate.mockResolvedValue({
      id: 1, status: 'requested', customer_id: 1, provider_id: 2, time_slot_id: 99
    });
    bookingRepository.updateBookingStatus.mockResolvedValue();
    bookingRepository.insertBookingEvent.mockResolvedValue();

    const result = await bookingService.updateBookingStatus({
      bookingId: 1, targetStatus: 'confirmed',
      actorId: 2, actorRole: 'provider'
    });

    expect(result.to).toBe('confirmed');
    expect(bookingRepository.markSlotAvailable).not.toHaveBeenCalled();
  });

  it('releases slot when booking is cancelled', async () => {
    bookingRepository.findBookingByIdForUpdate.mockResolvedValue({
      id: 1, status: 'confirmed', customer_id: 1, provider_id: 2, time_slot_id: 99
    });
    bookingRepository.updateBookingStatus.mockResolvedValue();
    bookingRepository.markSlotAvailable.mockResolvedValue();
    bookingRepository.insertBookingEvent.mockResolvedValue();

    await bookingService.updateBookingStatus({
      bookingId: 1, targetStatus: 'cancelled',
      actorId: 1, actorRole: 'customer', cancelReason: 'Changed my mind'
    });

    expect(bookingRepository.markSlotAvailable).toHaveBeenCalledWith(99, expect.anything());
  });
});