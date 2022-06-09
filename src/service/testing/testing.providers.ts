import { Connection } from 'typeorm';
import { Testing } from '../../entity/Testing';
import { 
  DATABASE_CONNECTION, 
  TESTING_REPOSITORY
} from '../../constants';

export const testingProviders = [
  {
    provide: TESTING_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(Testing),
    inject: [DATABASE_CONNECTION],
  },
];