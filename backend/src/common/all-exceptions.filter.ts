import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface HttpErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const body = this.resolveBody(exception);
    if (body.statusCode >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(body.statusCode).json(body);
  }

  private resolveBody(exception: unknown): HttpErrorBody {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return {
          statusCode: status,
          message: res,
          error: this.errorFor(status),
        };
      }
      const body = res as { message?: string | string[]; error?: string };
      return {
        statusCode: status,
        message: Array.isArray(body.message)
          ? body.message.join('; ')
          : (body.message ?? exception.message),
        error: body.error ?? this.errorFor(status),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private errorFor(status: number): string {
    return status === 400
      ? 'Bad Request'
      : status === 404
        ? 'Not Found'
        : status === 409
          ? 'Conflict'
          : status === 422
            ? 'Unprocessable Entity'
            : 'Error';
  }
}
