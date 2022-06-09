import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from './../config/config.service';
import { TestingRemoveService } from './testing.remove.service';
import { TestingDatabaseService } from './testing.database.service';
import { IndicatorPrepareService } from './../indicator/indicator.prepare.service';
import { TestingCombinationService } from './testing.combination.service';
import { Testing } from './../../entity/Testing';
import { IIndicator } from './../../../interfaces/indicator.interface';

@Injectable()
export class TestingAnalysService {
  private SYMBOL: string = '';
  private FIT_VALUE: number = 0;
  private PERIOD_FAST: string = '';
  private PERIOD_SLOW: string = '';
  private ANALYS_TESTING: number = 0;
  /**
   * Constructor TestingAnalysService
   * @param {ConfigService}             @Iniect('ConfigService')             private configService
   * @param {TestingRemoveService}      @Inject('TestingRemoveService')      private testingRemoveService
   * @param {TestingDatabaseService}    @Inject('TestingDatabaseService')    private testingDatabaseService
   * @param {IndicatorPrepareService}   @Inject('IndicatorPrepareService')   private indicatorPrepareService
   * @param {TestingCombinationService} @Inject('TestingCombinationService') private testingCombinationService
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
    this.FIT_VALUE = +this.configService.get('FIT_VALUE');
    this.PERIOD_FAST = this.configService.get('PERIOD_FAST');
    this.PERIOD_SLOW = this.configService.get('PERIOD_SLOW');
    this.ANALYS_TESTING = +this.configService.get('ANALYS_TESTING');
  }
  /**
   * Analys combinations
   * @returns {Promise<void>}
   */
  public async analysCombinations(): Promise<void> {
    try {
      const testing: Testing[] = await this.testingDatabaseService.getTestings();

      if (Array.isArray(testing) && testing.length > 0) {
        let iterator: number = 1;

        for (let i: number = 0; i < testing.length && i < this.ANALYS_TESTING; i++) {
          if (
            testing[i].hasOwnProperty('id') &&
            testing[i].hasOwnProperty('weight') &&
            testing[i].hasOwnProperty('retention')
          ) {
            const indicators: IIndicator[] =
              await this.indicatorPrepareService.getIndicatorsByTestingId(testing[i].id);

            console.time(`Analysis combinations: ${iterator} from: ${this.ANALYS_TESTING * indicators.length}`);

            if (Array.isArray(indicators) && indicators.length > 0) {
              await this.passCombinations(
                this.SYMBOL,
                this.PERIOD_FAST,
                testing[i].weight,
                testing[i].retention,
                indicators
              );
            } else {
              throw Error('indicators is null');
            }

            console.timeEnd(`Analysis combinations: ${iterator} from: ${this.ANALYS_TESTING * indicators.length}`);
            iterator++;
          } else {
            throw Error('testing[i] is null');
          }
        }

        await this.testingRemoveService.removeCombinationByProfits();
        await this.testingRemoveService.removeCombinationByAnalys();
      } else {
        throw Error('testing is null');
      }
    } catch (err) {
      console.error('analysisCombinations: ', err.message);
    }
  }
  /**
   * Pass combinations
   * @param   {string}       symbol
   * @param   {string}       period
   * @param   {number}       weight
   * @param   {number}       retention
   * @param   {IIndicator[]} indicators
   * @returns {Promise<void>}
   */
  public async passCombinations(
    symbol: string,
    period: string,
    weight: number,
    retention: number,
    indicators: IIndicator[]
  ): Promise<void> {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        for (let i: number = 0; i < indicators.length; i++) {
          console.time(`Pass analysis random combinations: ${i} from: ${indicators.length}`);

          const random_line: number = this.testingCombinationService.getRandomArbitrary(
            0,
            indicators[i].value.length - 1
          );

          await this.randomCombinations(
            symbol,
            period,
            weight,
            retention,
            i,
            random_line,
            indicators
          );

          console.timeEnd(`Pass analysis random combinations: ${i} from: ${indicators.length}`);
        }
      } else {
        throw Error('testing_indicators is null');
      }
    } catch (err) {
      console.error('passCombinations: ', err.message);
    }
  }
  /**
   * Random combinations
   * @param   {string}       symbol
   * @param   {string}       period
   * @param   {number}       weight
   * @param   {number}       retention
   * @param   {number}       indicator
   * @param   {number}       line
   * @param   {IIndicator[]} indicators
   * @returns {Promise<void>}
   */
  public async randomCombinations(
    symbol: string,
    period: string,
    weight: number,
    retention: number,
    indicator: number,
    line: number,
    indicators: IIndicator[]
  ): Promise<void> {
    try {
      if (indicators.length > indicator) {
        const random_value: number = this.testingCombinationService.getRandomArbitrary(
          indicators[indicator].value[line] - this.FIT_VALUE,
          indicators[indicator].value[line] + this.FIT_VALUE
        );
        indicators[indicator].value[line] = random_value;

        await this.testingCombinationService.applyTesting(
          symbol,
          period,
          weight,
          retention,
          indicators
        );
      } else {
        throw Error('this.indicatorPrepareService.indicators is null');
      }
    } catch (err) {
      console.error('randomCombinations: ', err.message);
    }
  }
}
