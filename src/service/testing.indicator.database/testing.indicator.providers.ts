import { Connection } from 'typeorm';
import { TestingIndicator } from './../../entity/TestingIndicator';
import { 
  DATABASE_CONNECTION, 
  TESTING_INDICATOR_REPOSITORY 
} from './../../constants';

export const testingIndicatorProviders = [
  {
    provide: TESTING_INDICATOR_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(TestingIndicator),
    inject: [DATABASE_CONNECTION],
  },
];