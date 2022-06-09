import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { testingProviders } from './testing.providers';
import { TestingPriceService } from './testing.price.service';
import { TestingOrderService } from './testing.order.service';
import { TestingLogicService } from './testing.logic.service';
import { TestingRemoveService } from './testing.remove.service';
import { TestingWeightService } from './testing.weight.service';
import { TestingAnalysService } from './testing.analys.service';
import { TestingDatabaseService } from './testing.database.service';
import { TestingInspectionService } from './testing.inspection.service';
import { TestingCombinationService } from './testing.combination.service';
import { ConfigModule } from './../config/config.module';
import { DatabaseModule } from './../database/database.module';
import { IndicatorModule } from './../indicator/indicator.module';
import { IndicatorDatabaseModule } from './../indicator.database/indicator.database.module';
import { TestingIndicatorDatabaseModule } from './../testing.indicator.database/testing.indicator.database.module';
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    IndicatorModule,
    IndicatorDatabaseModule,
    TestingIndicatorDatabaseModule,
    ScheduleModule.forRoot()
  ],
  providers: [
    ...testingProviders,
    TestingPriceService,
    TestingOrderService,
    TestingLogicService,
    TestingRemoveService,
    TestingWeightService,
    TestingAnalysService,
    TestingDatabaseService,
    TestingInspectionService,
    TestingCombinationService
  ],
  exports: [
    TestingPriceService,
    TestingOrderService,
    TestingLogicService,
    TestingRemoveService,
    TestingWeightService,
    TestingAnalysService,
    TestingDatabaseService,
    TestingInspectionService,
    TestingCombinationService
  ]
})
export class TestingModule { }
