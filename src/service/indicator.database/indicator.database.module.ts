import { Module } from '@nestjs/common';
import { indicatorProviders } from './indicator.providers';
import { IndicatorDatabaseService } from './indicator.database.service';
import { ConfigModule } from './../config/config.module';
import { DatabaseModule } from './../database/database.module';
@Module({
  imports: [
    ConfigModule,
    DatabaseModule
  ],
  providers: [
    ...indicatorProviders,
    IndicatorDatabaseService
  ],
  exports: [
    IndicatorDatabaseService
  ]
})
export class IndicatorDatabaseModule { }
