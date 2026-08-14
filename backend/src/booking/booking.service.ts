import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking, BookingStatus, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
};

const serviceSelection: Prisma.BookingInclude = {
  service: {
    select: { id: true, name: true, duration: true },
  },
};

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service with id ${dto.serviceId} not found`);
    }

    return this.prisma.booking.create({
      data: {
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        serviceId: dto.serviceId,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
      },
      include: serviceSelection,
    });
  }

  async findAll(): Promise<Booking[]> {
    return this.prisma.booking.findMany({
      orderBy: { startTime: 'asc' },
      include: serviceSelection,
    });
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: serviceSelection,
    });

    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }

    return booking;
  }

  async updateStatus(
    id: number,
    dto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id);
    this.assertAllowedTransition(booking.status, dto.status);

    return this.prisma.booking.update({
      where: { id },
      data: { status: dto.status },
      include: serviceSelection,
    });
  }

  private assertAllowedTransition(
    current: BookingStatus,
    next: BookingStatus,
  ): void {
    if (current === next) {
      throw new BadRequestException(`Booking is already ${current}`);
    }

    if (!ALLOWED_TRANSITIONS[current].includes(next)) {
      throw new BadRequestException(
        `Cannot transition booking status from ${current} to ${next}`,
      );
    }
  }
}
