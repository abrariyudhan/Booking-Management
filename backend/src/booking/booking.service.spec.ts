import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '../../generated/prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';

const baseBooking = {
  id: 1,
  customerName: 'Alice',
  customerEmail: 'alice@example.com',
  serviceId: 1,
  startTime: new Date('2026-08-20T10:00:00.000Z'),
  endTime: new Date('2026-08-20T10:45:00.000Z'),
  status: BookingStatus.PENDING,
  createdAt: new Date(),
  updatedAt: new Date(),
  service: { id: 1, name: 'Haircut', duration: 45 },
};

describe('BookingService', () => {
  let service: BookingService;
  let prisma: {
    service: { findUnique: jest.Mock };
    booking: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      service: { findUnique: jest.fn() },
      booking: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(BookingService);
  });

  describe('create', () => {
    it('creates a booking when the service exists', async () => {
      prisma.service.findUnique.mockResolvedValue({
        id: 1,
        name: 'Haircut',
        duration: 45,
      });
      prisma.booking.create.mockResolvedValue(baseBooking);

      const dto: CreateBookingDto = {
        customerName: 'Alice',
        customerEmail: 'alice@example.com',
        serviceId: 1,
        startTime: '2026-08-20T10:00:00.000Z',
        endTime: '2026-08-20T10:45:00.000Z',
      };

      const result = await service.create(dto);

      expect(prisma.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerName: 'Alice',
            customerEmail: 'alice@example.com',
            serviceId: 1,
          }),
        }),
      );
      expect(result.id).toBe(1);
    });

    it('throws NotFoundException when the service does not exist', async () => {
      prisma.service.findUnique.mockResolvedValue(null);

      const dto: CreateBookingDto = {
        customerName: 'Alice',
        customerEmail: 'alice@example.com',
        serviceId: 999,
        startTime: '2026-08-20T10:00:00.000Z',
        endTime: '2026-08-20T10:45:00.000Z',
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(prisma.booking.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns all bookings ordered by startTime', async () => {
      prisma.booking.findMany.mockResolvedValue([baseBooking]);

      const result = await service.findAll();

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ service: expect.anything() }),
        }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns the booking when found', async () => {
      prisma.booking.findUnique.mockResolvedValue(baseBooking);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
    });

    it('throws NotFoundException when booking is missing', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('rejects an update to a missing booking', async () => {
      prisma.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(1, { status: BookingStatus.CONFIRMED }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.booking.update).not.toHaveBeenCalled();
    });

    it.each([
      [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      [BookingStatus.PENDING, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    ])('allows %s -> %s transition', async (from, to) => {
      prisma.booking.findUnique.mockResolvedValue({
        ...baseBooking,
        status: from,
      });
      prisma.booking.update.mockResolvedValue({ ...baseBooking, status: to });

      const result = await service.updateStatus(1, { status: to });

      expect(result.status).toBe(to);
      expect(prisma.booking.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: to },
        }),
      );
    });

    it.each([
      [BookingStatus.PENDING, BookingStatus.COMPLETED],
      [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      [BookingStatus.COMPLETED, BookingStatus.CONFIRMED],
      [BookingStatus.CANCELLED, BookingStatus.PENDING],
      [BookingStatus.CANCELLED, BookingStatus.CONFIRMED],
    ])('rejects %s -> %s transition with 400', async (from, to) => {
      prisma.booking.findUnique.mockResolvedValue({
        ...baseBooking,
        status: from,
      });

      await expect(service.updateStatus(1, { status: to })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.booking.update).not.toHaveBeenCalled();
    });

    it('rejects setting the same status', async () => {
      prisma.booking.findUnique.mockResolvedValue({
        ...baseBooking,
        status: BookingStatus.CONFIRMED,
      });

      await expect(
        service.updateStatus(1, { status: BookingStatus.CONFIRMED }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
