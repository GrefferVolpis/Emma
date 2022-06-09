import { Module } from '@nestjs/common';
import { IndicatorActiveService } from './indicator.active.service';
import { IndicatorRequestService } from './indicator.request.service';
import { IndicatorPrepareService } from './indicator.prepare.service';
import { ConfigModule } from './../config/config.module';
import { DatabaseModule } from './../database/database.module';
import { IndicatorDatabaseModule } from './../indicator.database/indicator.database.module';
import { TestingIndicatorDatabaseModule } from './../testing.indicator.database/testing.indicator.database.module';
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    IndicatorDatabaseModule,
    TestingIndicatorDatabaseModule
  ],
  providers: [
    IndicatorActiveService,
    IndicatorRequestService,
    IndicatorPrepareService,
  ],
  exports: [
    IndicatorActiveService,
    IndicatorRequestService,
    IndicatorPrepareService,
  ]
})
export class IndicatorModule { }
