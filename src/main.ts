import { join } from 'path';
import { parse } from 'dotenv';
import { readFileSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import * as morgan from 'morgan';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { ValidationException } from './../shared/filter/validation.exception';
import { IConfig } from './../interfaces/config.interface';

async function bootstrap() {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const config: IConfig = parse(
      readFileSync(join(__dirname, '..', `/.env.${process.env.NODE_ENV}`))
    ) as any;

    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const options = new DocumentBuilder()
      .addBasicAuth()
      .setTitle('Emma')
      .setDescription('The service API description')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('swagger', app, document);

    app.use(
      morgan(function (tokens, req, res) {
        return [
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'),
          '-',
          tokens['response-time'](req, res),
          'ms'
        ].join(' ');
      })
    );
    app.use(compression());
    app.use(cookieParser());

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        exceptionFactory: (errors: ValidationError[]) => {
          const messages = errors.map(
            error =>
              `${error.property} has wrong value ${error.value
              }, ${Object.values(error.constraints).join(', ')}`
          );

          console.log(messages);
          return new ValidationException(messages);
        }
      })
    );

    process.on('uncaughtException', function (err: Error) {
      console.error('uncaughtException: ', err.message);
    });

    process.on('unhandledRejection', function (err: Error) {
      console.error('unhandledRejection: ',err.message);
    });

    process.on('SIGTERM', () => {
      console.log('Signal is SIGTERM');
      app.close();
    });

    process.on('SIGUSR2', () => {
      console.log('Signal is SIGUSR2');
      app.close();
    });

    app.listen(isNaN(+config.PORT) ? 3000 : +config.PORT);
  } catch (error) {
    console.log(error);

    process.exit(0);
  }
}
bootstrap();
