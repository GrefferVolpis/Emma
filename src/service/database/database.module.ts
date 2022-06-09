import { Module } from '@nestjs/common';
import { DatabaseProviders } from './database.providers';
import { ConfigModule } from './../config/config.module';
@Module({
  imports: [ConfigModule],
  providers: [
    ...DatabaseProviders
  ],
  exports: [
    ...DatabaseProviders
  ]
})
export class DatabaseModule { }
