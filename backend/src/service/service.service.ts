import { Injectable } from '@nestjs/common';
import { Service } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Service[]> {
    return this.prisma.service.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
