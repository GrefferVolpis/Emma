import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { Response } from 'express';
import { IError } from './../../interfaces/error.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();

    if (exception instanceof BadRequestException) {
      const err_body: IError = {
        message:
          'Виникла помилка, не всі поля заповнені, або дані вказано не вірно.'
      };
      response.status(HttpStatus.BAD_REQUEST).json(err_body);
    } else if (typeof exception === 'string') {
      const err_status: number = HttpStatus.INTERNAL_SERVER_ERROR;
      const err_body: IError = {
        message: 'Щось пішло не так, спробуйте пізніше',
        error: exception
      };
      response.status(err_status).json(err_body);
    } else if (typeof exception.response === 'string') {
      const err_status: number = exception.status
        ? exception.status
        : exception.statusCode
        ? exception.statusCode
        : HttpStatus.INTERNAL_SERVER_ERROR;
      const err_body: IError = {
        message: 'Щось пішло не так, спробуйте пізніше',
        error: exception.response
      };
      response.status(err_status).json(err_body);
    } else {
      const err_status: number = exception.status
        ? exception.status
        : exception.statusCode
        ? exception.statusCode
        : exception.response?.statusCode
        ? exception.response.statusCode
        : HttpStatus.INTERNAL_SERVER_ERROR;
      const err_body: IError = {
        message: exception.message
          ? exception.message
          : 'Щось пішло не так, спробуйте пізніше',
        error: exception?.error
      };
      response.status(err_status).json(err_body);
    }
  }
}
