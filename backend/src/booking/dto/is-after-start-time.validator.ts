import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAfterStartTime', async: false })
export class IsAfterStartTime implements ValidatorConstraintInterface {
  validate(endTime: string, args: ValidationArguments): boolean {
    const startTime = (args.object as { startTime?: string }).startTime;
    if (!startTime) {
      return true;
    }
    return new Date(endTime).getTime() > new Date(startTime).getTime();
  }

  defaultMessage(): string {
    return 'endTime must be after startTime';
  }
}
