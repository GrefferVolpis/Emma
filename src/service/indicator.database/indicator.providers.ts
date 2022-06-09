import { Connection } from 'typeorm';
import { Indicator } from './../../entity/Indicator';
import { 
  DATABASE_CONNECTION, 
  INDICATOR_REPOSITORY
} from './../../constants';

export const indicatorProviders = [
  {
    provide: INDICATOR_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(Indicator),
    inject: [DATABASE_CONNECTION],
  },
];