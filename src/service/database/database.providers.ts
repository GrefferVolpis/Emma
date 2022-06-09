import { createConnection } from 'typeorm';
import { ConfigService } from './../config/config.service';
import { Testing } from './../../entity/Testing';
import { TestingIndicator } from './../../entity/TestingIndicator';
import { Indicator } from './../../entity/Indicator';
import { DATABASE_CONNECTION } from './../../constants';

export const DatabaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: async (configService: ConfigService) => await createConnection({
      type: 'postgres',
      host: configService.get('DB_HOST'),
      port: +configService.get('DB_PORT'),
      username: configService.get('DB_USER'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_NAME'),
      entities: [
        Testing,
        TestingIndicator,
        Indicator
      ],
      synchronize: true,
      logging: false
    }),
    inject: [ConfigService],
  },
];