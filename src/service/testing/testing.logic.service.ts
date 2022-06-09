import { Injectable, Inject } from '@nestjs/common';
import { TestingWeightService } from './testing.weight.service';
import { TestingDatabaseService } from './testing.database.service';
import { TestingAnalysService } from './testing.analys.service';
import { IndicatorPrepareService } from './../indicator/indicator.prepare.service';
import { TestingCombinationService } from './testing.combination.service';
import { Testing } from './../../entity/Testing';
import { IIndicator } from './../../../interfaces/indicator.interface';

@Injectable()
export class TestingLogicService {
  /**
   * Constructor TestingLogicService
   * @param {TestingWeightService}      @Inject('TestingWeightService')      private testingWeightService
   * @param {TestingAnalysService}      @Inject('TestingAnalysService')      private testingAnalysService
   * @param {TestingDatabaseService}    @Inject('TestingDatabaseService')    private testingDatabaseService
   * @param {IndicatorPrepareService}   @Inject('IndicatorPrepareService')   private indicatorPrepareService
   * @param {TestingCombinationService} @Inject('TestingCombinationService') private testingCombinationService
   */
  constructor(
    @Inject(TestingWeightService)
    private readonly testingWeightService: TestingWeightService,
    @Inject(TestingAnalysService)
    private readonly testingAnalysService: TestingAnalysService,
    @Inject(TestingDatabaseService)
    private readonly testingDatabaseService: TestingDatabaseService,
    @Inject(IndicatorPrepareService)
    private readonly indicatorPrepareService: IndicatorPrepareService,
    @Inject(TestingCombinationService)
    private readonly testingCombinationService: TestingCombinationService
  ) { }
  /**
   * Testing
   * @returns {Promise<void>}
   */
  public async testing(): Promise<void> {
    try {
      const indicators: IIndicator[] = await this.indicatorPrepareService.getIndicators();

      if (Array.isArray(indicators) && indicators.length > 0) {
        while (true) {
          await this.testingCombinationService.passCombinations(indicators);
  
          const testing: Testing[] = await this.testingDatabaseService.getTestings();
          if (Array.isArray(testing) && testing.length > 0) {
            await this.testingAnalysService.analysCombinations();
            await this.testingWeightService.weightCombinations();
          }
        }
      } else {
        throw Error('indicator is null');
      }
    } catch (err) {
      console.error('testing: ', err.message);
    }
  }
}
