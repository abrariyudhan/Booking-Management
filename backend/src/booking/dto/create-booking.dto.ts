import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsDateString,
  MinLength,
  Validate,
} from 'class-validator';
import { IsAfterStartTime } from './is-after-start-time.validator';

export class CreateBookingDto {
  @IsNotEmpty({ message: 'customerName is required' })
  @MinLength(1)
  customerName: string;

  @IsNotEmpty({ message: 'customerEmail is required' })
  @IsEmail({}, { message: 'customerEmail must be a valid email' })
  customerEmail: string;

  @IsInt({ message: 'serviceId must be an integer' })
  @IsPositive({ message: 'serviceId must be a positive integer' })
  serviceId: number;

  @IsDateString({}, { message: 'startTime must be a valid ISO-8601 datetime' })
  startTime: string;

  @IsDateString({}, { message: 'endTime must be a valid ISO-8601 datetime' })
  @Validate(IsAfterStartTime, {
    message: 'endTime must be after startTime',
  })
  endTime: string;
}
