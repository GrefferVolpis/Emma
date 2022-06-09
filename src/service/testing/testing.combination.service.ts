import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from './../config/config.service';
import { TestingOrderService } from './../testing/testing.order.service';
import { TestingRemoveService } from './testing.remove.service';
import { IndicatorPrepareService } from './../indicator/indicator.prepare.service';
import { IIndicator } from './../../../interfaces/indicator.interface';
import { ICombination } from './../../../interfaces/combination.interface';

@Injectable()
export class TestingCombinationService {
  private SYMBOL: string = '';
  private WEIGHT: number = 0;
  private RETENTION: number = 0;
  private PERIOD_FAST: string = '';
  private PERIOD_SLOW: string = '';
  private COMBINATIONS: number = 0;
  /**
   * Constructor TestingCombinationService
   * @param {ConfigService}           @Iniect('ConfigService')           private configService
   * @param {TestingOrderService}     @Inject('TestingOrderService')     private testingOrderService
   * @param {TestingRemoveService}    @Inject('TestingRemoveService')    private testingRemoveService
   * @param {IndicatorPrepareService} @Inject('IndicatorPrepareService') private indicatorPrepareService
   */
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TestingOrderService)
    private readonly testingOrderService: TestingOrderService,
    @Inject(TestingRemoveService)
    private readonly testingRemoveService: TestingRemoveService,
    @Inject(IndicatorPrepareService)
    private readonly indicatorPrepareService: IndicatorPrepareService,
  ) {
    this.SYMBOL = this.configService.get('SYMBOL');
    this.WEIGHT = +this.configService.get('WEIGHT');
    this.RETENTION = +this.configService.get('RETENTION');
    this.PERIOD_FAST = this.configService.get('PERIOD_FAST');
    this.PERIOD_SLOW = this.configService.get('PERIOD_SLOW');
    this.COMBINATIONS = +this.configService.get('COMBINATIONS');
  }
  /**
   * Pass combinations
   * @param   {IIndicator[]}  indicators
   * @returns {Promise<void>}
   */
  public async passCombinations(indicators: IIndicator[]): Promise<void> {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        let iterator: number = 1;
        const combinations: ICombination[][] = this.getCombinations(this.COMBINATIONS, indicators);

        for (let i: number = 1; i <= this.RETENTION; i++) {
          for (let j: number = 0; j < combinations.length; j++) {
            console.time(`Pass all combination: ${iterator} from: ${this.COMBINATIONS * this.RETENTION}`);

            if (Array.isArray(indicators) && indicators.length > 0) {
              const update_indicators: IIndicator[] = this.getUpdateIndicators(
                indicators,
                combinations[j]
              );

              if (Array.isArray(update_indicators) && update_indicators.length > 0) {
                await this.applyTesting(
                  this.SYMBOL,
                  this.PERIOD_FAST,
                  this.WEIGHT,
                  i,
                  update_indicators
                );
              } else {
                throw Error('update_indicators is null');
              }
            } else {
              throw Error('indicators is null');
            }

            console.timeEnd(`Pass all combination: ${iterator} from: ${this.COMBINATIONS * this.RETENTION}`);
            iterator++;
          }
        }

        await this.testingRemoveService.removeCombinationByProfits();
      } else {
        throw Error('indicators is null');
      }
    } catch (err) {
      console.error('passCombinations: ', err.message);
    }
  }
  /**
   * Apply testing
   * @param   {string}       symbol
   * @param   {string}       period
   * @param   {number}       weight
   * @param   {number}       retention
   * @param   {IIndicator[]} indicators
   * @returns {Promise<void>}
   */
  public async applyTesting(
    symbol: string,
    period: string,
    weight: number,
    retention: number,
    indicators: IIndicator[]
  ): Promise<void> {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        const indicator_siganls: IIndicator[] =
          await this.indicatorPrepareService.getIndicatorSiganls(
            symbol,
            period,
            retention,
            indicators
          );

        if (indicator_siganls) {
          await this.testingOrderService.testing(
            symbol,
            period,
            weight,
            retention,
            indicator_siganls
          );
        } else {
          throw Error('indicator_siganls is null');
        }
      } else {
        throw Error('indicators is null');
      }
    } catch (err) {
      console.error('applyTesting: ', err.message);

      return null;
    }
  }
  /**
   * Get combinations
   * @param   {number}       amount_combinations
   * @param   {IIndicator[]} indicators
   * @returns {ICombination[][]}
   */
  private getCombinations(
    amount_combinations: number,
    indicators: IIndicator[]
  ): ICombination[][] {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        const combinations: ICombination[][] = [];

        for (let i: number = 0; i < amount_combinations; i++) {
          const combination: ICombination[] = [];

          for (let j: number = 0; j < indicators.length; j++) {
            if (
              indicators[j].hasOwnProperty('amount_parameters') &&
              indicators[j].hasOwnProperty('diapason') &&
              indicators[j].amount_parameters &&
              Array.isArray(indicators[j].diapason) &&
              indicators[j].diapason.length === 2
            ) {
              const indicator_values: number[] = [];

              for (let q: number = 0; q < indicators[j].amount_parameters; q++) {
                const random: number = this.getRandomArbitrary(
                  indicators[j].diapason[0],
                  indicators[j].diapason[1]
                );

                indicator_values.push(random);
              }

              combination.push({
                id: indicators[j].id,
                value: indicator_values
              });
            } else {
              throw Error('indicators is null');
            }
          }

          combinations.push(combination);
        }

        return combinations;
      } else {
        throw Error('indicators is null');
      }
    } catch (err) {
      console.error('getCombinations: ', err.message);
    }
  }
  /**
   * Get update indicators
   * @param   {IIndicator[]}   indicators
   * @param   {ICombination[]} combinations
   * @returns {IIndicator[]}
   */
  public getUpdateIndicators(
    indicators: IIndicator[],
    combinations: ICombination[]
  ): IIndicator[] {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        const update_indicators: IIndicator[] = [];

        for (let i: number = 0; i < indicators.length; i++) {
          for (let j: number = 0; j < combinations.length; j++) {
            if (
              indicators[i].hasOwnProperty('id') &&
              indicators[i].hasOwnProperty('value') &&
              indicators[i].id &&
              indicators[i].value
            ) {
              if (
                combinations[j].hasOwnProperty('id') &&
                combinations[j].hasOwnProperty('value') &&
                combinations[j].id &&
                combinations[j].value
              ) {
                if (indicators[i].id === combinations[j].id) {
                  update_indicators.push({
                    ...indicators[i],
                    value: combinations[j].value
                  });

                  break;
                }
              } else {
                throw Error('combinations is null');
              }
            } else {
              throw Error('indicators[i].id is null or indicators[i].value');
            }
          }
        }

        return update_indicators;
      } else {
        throw Error('indicators is null');
      }
    } catch (err) {
      console.error('getUpdateIndicators: ', err.message);
    }
  }
  /**
   * Get random arbitrary
   * @param   {number} min
   * @param   {number} max
   * @returns {number}
   */
  public getRandomArbitrary(min: number, max: number): number {
    try {
      return Math.round(Math.random() * (max - min) + min);
    } catch (err) {
      console.error('getRandomArbitrary: ', err.message);
    }
  }
}
