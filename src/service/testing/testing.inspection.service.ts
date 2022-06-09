import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from './../config/config.service';
import { TestingRemoveService } from './testing.remove.service';
import { TestingDatabaseService } from './testing.database.service';
import { IndicatorPrepareService } from './../indicator/indicator.prepare.service';
import { TestingCombinationService } from './testing.combination.service';
import { Testing } from './../../entity/Testing';
import { IIndicator } from './../../../interfaces/indicator.interface';

@Injectable()
export class TestingInspectionService {
  private SYMBOL: string = '';
  private PERIOD_FAST: string = '';
  private PERIOD_SLOW: string = '';
  /**
   * Constructor TestingInspectionService
   * @param {ConfigService}                   @Iniect('ConfigService')                   private configService
   * @param {TestingRemoveService}            @Inject('TestingRemoveService')            private testingRemoveService
   * @param {TestingDatabaseService}          @Inject('TestingDatabaseService')          private testingDatabaseService
   * @param {IndicatorPrepareService}         @Inject('IndicatorPrepareService')         private indicatorPrepareService
   * @param {TestingCombinationService}       @Inject('TestingCombinationService')       private testingCombinationService
   */
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TestingRemoveService)
    private readonly testingRemoveService: TestingRemoveService,
    @Inject(TestingDatabaseService)
    private readonly testingDatabaseService: TestingDatabaseService,
    @Inject(IndicatorPrepareService)
    private readonly indicatorPrepareService: IndicatorPrepareService,
    @Inject(TestingCombinationService)
    private readonly testingCombinationService: TestingCombinationService
  ) {
    this.SYMBOL = this.configService.get('SYMBOL');
    this.PERIOD_FAST = this.configService.get('PERIOD_FAST');
    this.PERIOD_SLOW = this.configService.get('PERIOD_SLOW');
  }

  /**
   * Inspection is old combinations
   * @returns {Promise<void>}
   */
  public async inspectionOldCombinations(): Promise<void> {
    try {
      const testing: Testing[] = await this.testingDatabaseService.getTestings();

      if (Array.isArray(testing) && testing.length > 0) {
        let iterator: number = 1;

        for (let i: number = 0; i < testing.length; i++) {
          console.time(`Inspection is older combinations: ${iterator}`);

          if (
            testing[i].hasOwnProperty('id') &&
            testing[i].hasOwnProperty('weight') &&
            testing[i].hasOwnProperty('retention')
          ) {
            const indicators: IIndicator[] =
              await this.indicatorPrepareService.getIndicatorsByTestingId(testing[i].id);

            if (Array.isArray(indicators) && indicators.length > 0) {
              await this.testingCombinationService.applyTesting(
                this.SYMBOL,
                this.PERIOD_FAST,
                testing[i].weight,
                testing[i].retention,
                indicators
              );

              await this.testingDatabaseService.deleteTestingById(testing[i].id);
            } else {
              throw Error('indicators is null');
            }
          } else {
            throw Error('testing[i] is null');
          }

          console.timeEnd(`Inspection is older combinations: ${iterator}`);
          iterator++;
        }

        await this.testingRemoveService.removeCombinationByProfits();
        await this.testingRemoveService.removeCombinationByAnalys();
      } else {
        throw Error('testing is null');
      }
    } catch (err) {
      console.error('inspectionOldCombinations: ', err.message);
    }
  }
}
