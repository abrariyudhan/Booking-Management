import { validate } from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';
import { UpdateBookingStatusDto } from './update-booking-status.dto';

describe('CreateBookingDto', () => {
  const valid = {
    customerName: 'Alice',
    customerEmail: 'alice@example.com',
    serviceId: 1,
    startTime: '2026-08-20T10:00:00.000Z',
    endTime: '2026-08-20T10:45:00.000Z',
  };

  it('passes validation for valid input', async () => {
    const dto = Object.assign(new CreateBookingDto(), valid);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const dto = Object.assign(new CreateBookingDto(), valid, {
      customerEmail: 'not-an-email',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerEmail')).toBe(true);
  });

  it('rejects a missing required field', async () => {
    const dto = Object.assign(new CreateBookingDto(), valid, {
      customerName: undefined,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerName')).toBe(true);
  });

  it('rejects endTime before startTime', async () => {
    const dto = Object.assign(new CreateBookingDto(), valid, {
      endTime: '2026-08-20T09:00:00.000Z',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'endTime')).toBe(true);
  });

  it('rejects a non-integer serviceId', async () => {
    const dto = Object.assign(new CreateBookingDto(), valid, {
      serviceId: 1.5,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'serviceId')).toBe(true);
  });
});

describe('UpdateBookingStatusDto', () => {
  it('passes validation for a valid status', async () => {
    const dto = Object.assign(new UpdateBookingStatusDto(), {
      status: 'CONFIRMED',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid status value', async () => {
    const dto = Object.assign(new UpdateBookingStatusDto(), {
      status: 'PAID',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });
});
