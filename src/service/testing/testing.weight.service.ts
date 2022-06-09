import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from './../config/config.service';
import { TestingRemoveService } from './testing.remove.service';
import { TestingDatabaseService } from './testing.database.service';
import { IndicatorPrepareService } from './../indicator/indicator.prepare.service';
import { TestingCombinationService } from './testing.combination.service';
import { Testing } from './../../entity/Testing';
import { IIndicator } from './../../../interfaces/indicator.interface';
import { TYPE_INDICATOR } from './../../../interfaces/enum/type.indicator.enum';

@Injectable()
export class TestingWeightService {
  private SYMBOL: string = '';
  private WEIGHT: number = 0;
  private FIT_WEIGHT: number = 0;
  private PERIOD_FAST: string = '';
  private PERIOD_SLOW: string = '';
  /**
   * Constructor TestingWeightService
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
    this.WEIGHT = +this.configService.get('WEIGHT');
    this.FIT_WEIGHT = +this.configService.get('FIT_WEIGHT');
    this.PERIOD_FAST = this.configService.get('PERIOD_FAST');
    this.PERIOD_SLOW = this.configService.get('PERIOD_SLOW');
  }
  /**
   * Weight combinations
   * @returns {Promise<void>}
   */
  public async weightCombinations(): Promise<void> {
    try {
      const testing: Testing[] = await this.testingDatabaseService.getTestings();

      if (Array.isArray(testing) && testing.length > 0) {
        let iterator: number = 1;

        for (let i: number = 0; i < testing.length; i++) {
          console.time(`Weight combinations: ${iterator} from: ${testing.length}`);

          if (
            testing[i].hasOwnProperty('id') &&
            testing[i].hasOwnProperty('weight') &&
            testing[i].hasOwnProperty('retention')
          ) {
            const indicators: IIndicator[] =
              await this.indicatorPrepareService.getIndicatorsByTestingId(testing[i].id);

            if (Array.isArray(indicators) && indicators.length > 0) {
              const line: IIndicator[] =
                this.indicatorPrepareService.getIndicatorByType(
                  TYPE_INDICATOR.LINE,
                  indicators
                );
              const trend: IIndicator[] =
                this.indicatorPrepareService.getIndicatorByType(
                  TYPE_INDICATOR.TREND,
                  indicators
                );
              if (
                (Array.isArray(line) && line.length > 0) ||
                (Array.isArray(trend) && trend.length > 0)
              ) {
                const oscillator: IIndicator[] =
                  this.indicatorPrepareService.getIndicatorByType(
                    TYPE_INDICATOR.OSCILLATOR,
                    indicators
                  );
                if (Array.isArray(oscillator) && oscillator.length > 0) {
                  await this.passCombinations(
                    testing[i].weight,
                    testing[i].retention,
                    [...line, ...trend, ...oscillator]
                  );
                  if (oscillator.length > 1) {
                    const random_oscillator: number = this.testingCombinationService.getRandomArbitrary(
                      0,
                      indicators.length - 1
                    );
                    const slice_oscillator: IIndicator[] = oscillator.splice(random_oscillator, 1);

                    await this.passCombinations(
                      testing[i].weight,
                      testing[i].retention,
                      [...line, ...trend, ...slice_oscillator]
                    );
                  }
                } else {
                  throw Error('oscillator is null');
                }
              } else {
                throw Error('line is null or trend is null');
              }
            } else {
              throw Error('indicators is null');
            }
          } else {
            throw Error('testing[i].id is null');
          }

          console.timeEnd(`Weight combinations: ${iterator} from: ${testing.length}`);
          iterator++;
        }

        await this.testingRemoveService.removeCombinationByProfits();
        await this.testingRemoveService.removeCombinationByAnalys();
      } else {
        throw Error('testing is null');
      }
    } catch (err) {
      console.error('weightCombinations: ', err.message);
    }
  }
  /**
   * Pass combinations
   * @param   {number}       weight
   * @param   {number}       retention
   * @param   {IIndicator[]} indicators
   * @returns {Promise<void>}
   */
  public async passCombinations(
    weight: number,
    retention: number,
    indicators: IIndicator[]
  ): Promise<void> {
    try {
      if (retention > 0) {
        if (Array.isArray(indicators) && indicators.length > 0) {
          let iterator: number = 1;
          const amount_indicator_waight: number = indicators
            .map((item: IIndicator) => item.weight)
            .reduce((previous_waight: number, current_waight: number) => {
              return previous_waight + current_waight
            });

          for (let i: number = 0; i < this.FIT_WEIGHT; i++) {
            console.time(`Pass weight random combinations: ${iterator} from: ${this.FIT_WEIGHT}`);

            const coppy_indicators: IIndicator[] = [];
            for (let j: number = 0; j < indicators.length; j++) {
              const random_indicator_weight: number = this.testingCombinationService.getRandomArbitrary(
                indicators[j].weight - this.WEIGHT,
                indicators[j].weight + this.WEIGHT
              );
              coppy_indicators.push({
                ...indicators[j],
                weight: random_indicator_weight
              });
            }

            const random_action_weight: number = this.testingCombinationService.getRandomArbitrary(
              weight,
              amount_indicator_waight
            );

            await this.testingCombinationService.applyTesting(
              this.SYMBOL,
              this.PERIOD_FAST,
              random_action_weight,
              retention,
              coppy_indicators
            );

            console.timeEnd(`Pass weight random combinations: ${iterator} from: ${this.FIT_WEIGHT}`);
            iterator++;
          }
        } else {
          throw Error('indicators is null');
        }
      } else {
        throw Error('retention < 0');
      }
    } catch (err) {
      console.error('passCombinations: ', err.message);
    }
  }
}
