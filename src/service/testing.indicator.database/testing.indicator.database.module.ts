import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { testingIndicatorProviders } from './testing.indicator.providers';
import { TestingIndicatorDatabaseService } from './testing.indicator.database.service';
import { DatabaseModule } from './../database/database.module';
@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot()
  ],
  providers: [
    ...testingIndicatorProviders,
    TestingIndicatorDatabaseService
  ],
  exports: [
    TestingIndicatorDatabaseService
  ]
})
export class TestingIndicatorDatabaseModule { }
