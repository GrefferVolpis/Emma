import { Module } from '@nestjs/common';
import { TestingModule } from './service/testing/testing.module';
import { IndicatorModule } from './service/indicator/indicator.module';
import { NetworkModule } from './service/network/network.module';
import { IndicatorDatabaseModule } from './service/indicator.database/indicator.database.module';
import { IndicatorController } from './controllers/indicator.controller';

@Module({
  imports: [
    TestingModule,
    NetworkModule,
    IndicatorModule,
    IndicatorDatabaseModule
  ],
  controllers: [
    IndicatorController
  ],
  providers: [],
})
export class AppModule { }
