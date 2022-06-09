import { Module } from '@nestjs/common';
import { NetworkService } from './network.service';
import { ConfigModule } from './../config/config.module';
import { TestingModule } from './../testing/testing.module';
import { IndicatorModule } from './../indicator/indicator.module';
@Module({
  imports: [
    ConfigModule,
    TestingModule,
    IndicatorModule
  ],
  providers: [
    NetworkService
  ],
  exports: [
    NetworkService
  ]
})
export class NetworkModule { }
