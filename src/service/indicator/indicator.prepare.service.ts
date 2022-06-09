import { Injectable, Inject } from '@nestjs/common';
import { OHLCV } from 'ccxt';
import { Indicator } from './../../entity/Indicator';
import { IndicatorActiveService } from './indicator.active.service';
import { IndicatorRequestService } from './indicator.request.service';
import { IndicatorDatabaseService } from './../indicator.database/indicator.database.service';
import { TestingIndicatorDatabaseService } from './../testing.indicator.database/testing.indicator.database.service';
import { TestingIndicator } from './../../entity/TestingIndicator';
import { IIndicator } from './../../../interfaces/indicator.interface';
import { CODE_ORDER } from './../../../interfaces/enum/code.order.enum';
import { CODE_INDICATOR } from './../../../interfaces/enum/code.indicator.enum';
import { TYPE_INDICATOR } from './../../../interfaces/enum/type.indicator.enum';

@Injectable()
export class IndicatorPrepareService {
  /**
   * Constructor IndicatorPrepareService
   * @param {IndicatorActiveService}          @Inject('IndicatorActiveService')          private indicatorActiveService
   * @param {IndicatorRequestService}         @Inject('IndicatorRequestService')         private indicatorRequestService
   * @param {IndicatorDatabaseService}        @Inject('IndicatorDatabaseService')        private indicatorDatabaseService
   * @param {TestingIndicatorDatabaseService} @Inject('TestingIndicatorDatabaseService') private testingIndicatorDatabaseService
   */
  constructor(
    @Inject(IndicatorActiveService)
    private readonly indicatorActiveService: IndicatorActiveService,
    @Inject(IndicatorRequestService)
    private readonly indicatorRequestService: IndicatorRequestService,
    @Inject(IndicatorDatabaseService)
    private readonly indicatorDatabaseService: IndicatorDatabaseService,
    @Inject(TestingIndicatorDatabaseService)
    private readonly testingIndicatorDatabaseService: TestingIndicatorDatabaseService
  ) { }
  /**
   * Get indicators
   * @returns {Promise<IIndicator[]>}
   */
  public async getIndicators(): Promise<IIndicator[]> {
    try {
      return this.indicatorDatabaseService.getIndicators()
        .then((data: Indicator[]) => {
          if (Array.isArray(data) && data.length > 0) {
            const indicators: IIndicator[] = [];

            for (let i: number = 0; i < data.length; i++) {
              if (data[i].hasOwnProperty('name')) {
                const fn_active: Function = this.getActiveFunctionIndicator(data[i].name);
                const fn_request: Function = this.getRequestFunctionIndicator(data[i].name);
                if (fn_active && fn_request) {
                  indicators.push({
                    ...data[i],
                    fn_active,
                    fn_request,
                    weight: 100,
                    signals: [],
                    indicator_values: []
                  });
                } else {
                  throw Error('fn_active is null or fn_request is null');
                }
              } else {
                throw Error('data[i].name is null');
              }
            }

            return indicators;
          } else {
            throw Error('getIndicators is null');
          }
        });
    } catch (err) {
      console.error('getIndicators: ', err.message);

      return null;
    }
  }
  /**
   * Get indicators by testing id
   * @param   {string} id
   * @returns {Promise<IIndicator[]>}
   */
  public async getIndicatorsByTestingId(id: string): Promise<IIndicator[]> {
    try {
      return this.testingIndicatorDatabaseService.getTestingIndicatorById(id)
        .then((data: TestingIndicator[]) => {
          if (Array.isArray(data) && data.length > 0) {
            const indicators: IIndicator[] = [];

            for (let i: number = 0; i < data.length; i++) {
              if (data[i].indicator.hasOwnProperty('name')) {
                const fn_active: Function = this.getActiveFunctionIndicator(data[i].indicator.name);
                const fn_request: Function = this.getRequestFunctionIndicator(data[i].indicator.name);
                if (fn_active && fn_request) {
                  indicators.push({
                    ...data[i].indicator,
                    fn_active,
                    fn_request,
                    value: data[i].value,
                    weight: data[i].weight,
                    signals: [],
                    indicator_values: []
                  });
                } else {
                  throw Error('fn_active is null or fn_request is null');
                }
              } else {
                throw Error('data[i].indicator.name is null');
              }
            }

            return indicators;
          } else {
            throw Error('getIndicators is null');
          }
        });
    } catch (err) {
      console.error('getIndicatorsByTestingId: ', err.message);

      return null;
    }
  }
  /**
   * Get indicator siganls
   * @param   {string}       symbol
   * @param   {string}       period
   * @param   {number}       retention
   * @param   {IIndicator[]} indicators
   * @returns {Promise<number[]>}
   */
  public async getIndicatorSiganls(
    symbol: string,
    period: string,
    retention: number,
    indicators: IIndicator[]
  ): Promise<IIndicator[]> {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        const indicator_values: IIndicator[] = await this.getIndicatorValues(
          symbol,
          period,
          indicators
        );

        const amount_values: number =
          this.getCountIndicatorValues(indicator_values);

        const line_indicators: IIndicator[] =
          await this.getLineIndicatorSiganls(
            amount_values,
            indicator_values
          );
        const trend_indicators: IIndicator[] =
          await this.getTrendIndicatorSiganls(
            symbol,
            period,
            amount_values,
            indicator_values
          );
        const osicillator_indicators: IIndicator[] =
          await this.getOsicillatorIndicatorSiganls(
            retention,
            amount_values,
            indicator_values
          );

        return [
          ...line_indicators,
          ...trend_indicators,
          ...osicillator_indicators
        ];
      } else {
        throw Error('indicators is null');
      }
    } catch (err) {
      console.error('getIndicatorSiganls: ', err.message);
    }
  }
  /**
   * Get line indicator siganls
   * @param   {number}       amount_values
   * @param   {IIndicator[]} indicators
   * @returns {Promise<number[]>}
   */
  public async getLineIndicatorSiganls(
    amount_values: number,
    indicators: IIndicator[]
  ): Promise<IIndicator[]> {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        const update_indicators: IIndicator[] = [];

        const sma_fast: IIndicator = this.getIndicatorByName(CODE_INDICATOR.SMA_FAST, indicators);
        const sma_slow: IIndicator = this.getIndicatorByName(CODE_INDICATOR.SMA_SLOW, indicators);

        const signals: CODE_ORDER[] = await sma_fast.fn_active(
          amount_values,
          sma_fast.indicator_values,
          sma_slow.indicator_values
        );

        update_indicators.push({
          ...sma_fast,
          signals: signals
        });

        update_indicators.push({
          ...sma_slow,
          signals: signals
        });

        return update_indicators;
      } else {
        throw Error('indicators is null');
      }
    } catch (err) {
      console.error('getLineIndicatorSiganls: ', err.message);
    }
  }
  /**
   * Get trend indicator siganls
   * @param   {number}       symbol
   * @param   {number}       period
   * @param   {number}       amount_values
   * @param   {IIndicator[]} indicators
   * @returns {Promise<number[]>}
   */
  public async getTrendIndicatorSiganls(
    symbol: string,
    period: string,
    amount_values: number,
    indicators: IIndicator[]
  ): Promise<IIndicator[]> {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        const update_indicators: IIndicator[] = [];
        const prices: OHLCV[] =
          await this.indicatorRequestService.getPrices(symbol, period);

        const trend: IIndicator[] = this.getIndicatorByType(TYPE_INDICATOR.TREND, indicators);

        for (let i: number = 0; i < trend.length; i++) {
          const signals: CODE_ORDER[] = await trend[i]
            .fn_active(
              amount_values,
              prices,
              trend[i].indicator_values
            );

          update_indicators.push({
            ...trend[i],
            signals: signals
          });
        };

        return update_indicators;
      } else {
        throw Error('indicators is null');
      }
    } catch (err) {
      console.error('getTrendIndicatorSiganls: ', err.message);
    }
  }
  /**
   * Get osicillator indicator siganls
   * @param   {number}       retention
   * @param   {number}       amount_values
   * @param   {IIndicator[]} indicators
   * @returns {Promise<number[]>}
   */
  public async getOsicillatorIndicatorSiganls(
    retention: number,
    amount_values: number,
    indicators: IIndicator[]
  ): Promise<IIndicator[]> {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        const update_indicators: IIndicator[] = [];

        const osicillator: IIndicator[] = this.getIndicatorByType(
          TYPE_INDICATOR.OSCILLATOR, 
          indicators
        );

        for (let i: number = 0; i < osicillator.length; i++) {
          const signals: CODE_ORDER[] = await osicillator[i]
            .fn_active(
              retention,
              amount_values,
              osicillator[i].indicator_values
            );

          update_indicators.push({
            ...osicillator[i],
            signals: signals
          });
        };

        return update_indicators;
      } else {
        throw Error('indicators is null');
      }
    } catch (err) {
      console.error('getOsicillatorIndicatorSiganls: ', err.message);
    }
  }
  /**
   * Get indicator values
   * @param   {string}        symbol
   * @param   {string}        period
   * @param   {IIndicators[]} indicators
   * @returns {Promise<IIndicator[]>}
   */
  public async getIndicatorValues(
    symbol: string,
    period: string,
    indicators: IIndicator[]
  ): Promise<IIndicator[]> {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        const update_indicators: IIndicator[] = [];

        for (let i: number = 0; i < indicators.length; i++) {
          if (
            indicators[i].hasOwnProperty('value') &&
            Array.isArray(indicators[i].value) &&
            indicators[i].value.length > 0
          ) {
            const indicator_values: any[] = await indicators[i]
              .fn_request(...indicators[i].value, symbol, period);

            update_indicators.push({
              ...indicators[i],
              indicator_values: indicator_values
            });
          } else {
            throw Error('indicators[i].value is null');
          }
        }

        return update_indicators;
      } else {
        throw Error('indicators is null');
      }
    } catch (err) {
      console.error('getIndicatorValues: ', err.message);
    }
  }
  /**
   * Get amount indicator values
   * @param   {IIndicator[]} indicators
   * @returns {number}
   */
  public getCountIndicatorValues(indicators: IIndicator[]): number {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        let amount_values: number = 0;

        for (let i: number = 0; i < indicators.length; i++) {
          if (
            indicators[i].hasOwnProperty('indicator_values') &&
            Array.isArray(indicators[i].indicator_values)
          ) {
            if (amount_values === 0) {
              amount_values = indicators[i].indicator_values.length;
            } else if (indicators[i].indicator_values.length < amount_values) {
              amount_values = indicators[i].indicator_values.length;
            }
          } else {
            throw Error('this.indicators[i].signals is null');
          }
        }

        return amount_values;
      } else {
        throw Error('this.indicators is null');
      }
    } catch (err) {
      console.error('getCountIndicatorValues: ', err.message);
    }
  }
  /**
   * Get indicator by name
   * @param   {CODE_INDICATOR} name
   * @param   {IIndicator[]}   indicators
   * @returns {IIndicator}
   */
  public getIndicatorByName(
    name: CODE_INDICATOR,
    indicators: IIndicator[]
  ): IIndicator {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        for (let i: number = 0; i < indicators.length; i++) {
          if (indicators[i].hasOwnProperty('name')) {
            if (indicators[i].name === name) {
              return indicators[i];
            }
          } else {
            throw Error('this.indicators[i].name is null');
          }
        }

        return null
      } else {
        throw Error('indicators is null');
      }
    } catch (err) {
      console.error('getIndicatorByName: ', err.message);

      return null;
    }
  }
  /**
   * Get indicator by type
   * @param   {TYPE_INDICATOR} type
   * @param   {IIndicator[]}   indicators
   * @returns {IIndicator[]}
   */
  public getIndicatorByType(
    type: TYPE_INDICATOR,
    indicators: IIndicator[]
  ): IIndicator[] {
    try {
      if (Array.isArray(indicators) && indicators.length > 0) {
        const type_indicators: IIndicator[] = [];

        for (let i: number = 0; i < indicators.length; i++) {
          if (indicators[i].hasOwnProperty('type')) {
            if (indicators[i].type === type) {
              type_indicators.push(indicators[i]);
            }
          } else {
            throw Error('this.indicators[i].type is null');
          }
        }

        return type_indicators
      } else {
        throw Error('indicators is null');
      }
    } catch (err) {
      console.error('getIndicatorByType: ', err.message);

      return null;
    }
  }
  /**
   * Get active function indicator
   * @param   {CODE_INDICATOR} name
   * @returns {Function}
   */
  public getActiveFunctionIndicator(name: CODE_INDICATOR): Function {
    try {
      if (name === CODE_INDICATOR.SMA_FAST) {
        return this.indicatorActiveService.actionSMA;
      } else if (name === CODE_INDICATOR.SMA_SLOW) {
        return this.indicatorActiveService.actionSMA;
      } else if (name === CODE_INDICATOR.BB) {
        return this.indicatorActiveService.actionBB;
      } else if (name === CODE_INDICATOR.RSI) {
        return this.indicatorActiveService.actionRSI;
      } else if (name === CODE_INDICATOR.MACD) {
        return this.indicatorActiveService.actionMACD;
      } else if (name === CODE_INDICATOR.STOCH_RSI) {
        return this.indicatorActiveService.actionStochRSI;
      } else {
        return null;
      }
    } catch (err) {
      console.error('getActiveFunctionIndicator: ', err.message);

      return null;
    }
  }
  /**
   * Get request function indicator
   * @param   {CODE_INDICATOR} name
   * @returns {Function}
   */
  public getRequestFunctionIndicator(name: CODE_INDICATOR): Function {
    try {
      if (name === CODE_INDICATOR.SMA_FAST) {
        return this.indicatorRequestService.getSMA;
      } else if (name === CODE_INDICATOR.SMA_SLOW) {
        return this.indicatorRequestService.getSMA;
      } else if (name === CODE_INDICATOR.BB) {
        return this.indicatorRequestService.getBB;
      } else if (name === CODE_INDICATOR.RSI) {
        return this.indicatorRequestService.getRSI;
      } else if (name === CODE_INDICATOR.MACD) {
        return this.indicatorRequestService.getMACD;
      } else if (name === CODE_INDICATOR.STOCH_RSI) {
        return this.indicatorRequestService.getStochasticRSI;
      } else {
        return null;
      }
    } catch (err) {
      console.error('getRequestFunctionIndicator: ', err.message);

      return null;
    }
  }
}
