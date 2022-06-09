import { Injectable, Inject } from '@nestjs/common';
import { OHLCV } from 'ccxt';
import { InsertResult } from 'typeorm';
import { TestingPriceService } from './testing.price.service';
import { TestingDatabaseService } from './testing.database.service';
import { IndicatorRequestService } from './../indicator/indicator.request.service';
import { IndicatorPrepareService } from './../indicator/indicator.prepare.service';
import { IndicatorDatabaseService } from './../indicator.database/indicator.database.service';
import { TestingIndicatorDatabaseService } from './../testing.indicator.database/testing.indicator.database.service';
import { Testing } from './../../entity/Testing';
import { Indicator } from './../../entity/Indicator';
import { IOrder } from './../../../interfaces/order.interface';
import { ITesting } from './../../../interfaces/testing.interface';
import { IHistory } from './../../../interfaces/history.interface';
import { IIndicator } from './../../../interfaces/indicator.interface';
import { IIndicatorTesting } from './../../../interfaces/indicator.testing.interface';
import { IIndicatorSetting } from './../../../interfaces/indicator.settings.interface';
import { TYPE_INDICATOR } from './../../../interfaces/enum/type.indicator.enum';
import { CODE_INDICATOR } from './../../../interfaces/enum/code.indicator.enum';
import { CODE_ORDER } from 'interfaces/enum/code.order.enum';

@Injectable()
export class TestingOrderService {
  /**
   * Constructor TestingOrderService
   * @param {TestingPriceService}              @Inject('TestingPriceService')              private testingPriceService
   * @param {TestingDatabaseService}           @Inject('TestingDatabaseService')           private testingDatabaseService
   * @param {IndicatorRequestService}          @Inject('IndicatorRequestService')          private indicatorRequestService
   * @param {IndicatorPrepareService}          @Inject('IndicatorPrepareService')          private indicatorPrepareService
   * @param {IndicatorDatabaseService}         @Inject('IndicatorDatabaseService')         private indicatorDatabaseService
   * @param {TestingIndicatorDatabaseService}  @Inject('TestingIndicatorDatabaseService')  private testingIndicatorDatabaseService
   */
  constructor(
    @Inject(TestingPriceService)
    private readonly testingPriceService: TestingPriceService,
    @Inject(TestingDatabaseService)
    private readonly testingDatabaseService: TestingDatabaseService,
    @Inject(IndicatorRequestService)
    private readonly indicatorRequestService: IndicatorRequestService,
    @Inject(IndicatorPrepareService)
    private readonly indicatorPrepareService: IndicatorPrepareService,
    @Inject(IndicatorDatabaseService)
    private readonly indicatorDatabaseService: IndicatorDatabaseService,
    @Inject(TestingIndicatorDatabaseService)
    private readonly testingIndicatorDatabaseService: TestingIndicatorDatabaseService,
  ) { }
  /**
   * Testing
   * @param   {string}       symbol
   * @param   {string}       period
   * @param   {number}       weight
   * @param   {number}       retention
   * @param   {IIndicator[]} indicators
   * @returns {Promise<ITesting>}
   */
  public async testing(
    symbol: string,
    period: string,
    weight: number,
    retention: number,
    indicators: IIndicator[]
  ): Promise<ITesting> {
    try {
      if (symbol) {
        const history: IHistory[] = await this.getHistorySignals(
          symbol,
          period,
          weight,
          indicators
        );
        if (Array.isArray(history) && history.length > 0) {
          const orders: IOrder[] = await this.getOrders(history, symbol);

          if (Array.isArray(orders) && orders.length > 0) {
            const testing_result: IIndicatorTesting = this.getTestingResult(orders, indicators);

            if (
              testing_result.hasOwnProperty('profits') &&
              testing_result.hasOwnProperty('bad_deals') &&
              testing_result.hasOwnProperty('good_deals')
            ) {
              if (testing_result.profits !== 0) {
                const profits: number = Math.round(testing_result.profits);
                const insert_testing: InsertResult = await this.testingDatabaseService.setTesting(
                  weight,
                  profits,
                  retention,
                  testing_result.bad_deals,
                  testing_result.good_deals
                );
                if (insert_testing.hasOwnProperty('raw')) {
                  await this.setTestingIndicator(insert_testing.raw[0].id, testing_result);

                  return {
                    profits: Math.round(testing_result.profits),
                    bad_deals: testing_result.bad_deals,
                    good_deals: testing_result.good_deals,
                  };
                } else {
                  throw Error('insert_testing is null');
                }
              }
            } else {
              throw Error('testing_result is null');
            }
          }
        }

        return null;
      } else {
        throw Error('symbol is null');
      }
    } catch (err) {
      console.error('testing: ', err.message);

      return null;
    }
  }
  /**
   * Set testing indicator
   * @param   {string}            id
   * @param   {IIndicatorTesting} testing_result
   * @returns {Promise<void>}
   */
  public async setTestingIndicator(
    id: string,
    testing_result: IIndicatorTesting
  ): Promise<void> {
    try {
      if (id) {
        if (
          testing_result.hasOwnProperty('indicator_settings') &&
          Array.isArray(testing_result.indicator_settings) &&
          testing_result.indicator_settings.length > 0
        ) {
          for (let i: number = 0; i < testing_result.indicator_settings.length; i++) {
            if (
              testing_result.indicator_settings[i].hasOwnProperty('id') &&
              testing_result.indicator_settings[i].hasOwnProperty('value') &&
              testing_result.indicator_settings[i].hasOwnProperty('weight')
            ) {
              const testing: Testing =
                await this.testingDatabaseService.getTestingById(id);

              if (testing) {
                const indicator: Indicator =
                  await this.indicatorDatabaseService.getIndicatorById(testing_result.indicator_settings[i].id);

                if (indicator) {
                  await this.testingIndicatorDatabaseService.setTestingIndicator(
                    testing_result.indicator_settings[i].value,
                    testing_result.indicator_settings[i].weight,
                    testing,
                    indicator
                  );
                } else {
                  throw Error('indicator is null');
                }
              } else {
                throw Error('testing is null');
              }
            } else {
              throw Error('testing_result.indicator_settings[i] is null');
            }
          }
        } else {
          throw Error('testing_result.indicator_settings is null');
        }
      } else {
        throw Error('id is null');
      }
    } catch (err) {
      console.error('setTestingIndicator: ', err.message);
    }
  }
  /**
   * Get history signals
   * @param   {string}       symbol
   * @param   {string}       period
   * @param   {number}       weight
   * @param   {IIndicator[]} indicators
   * @returns {IHistory[]}
   */
  private async getHistorySignals(
    symbol: string,
    period: string,
    weight: number,
    indicators: IIndicator[]
  ): Promise<IHistory[]> {
    try {
      const amount_values: number =
        this.indicatorPrepareService.getCountIndicatorValues(indicators);
      if (amount_values > 0) {
        const line: IIndicator =
          this.indicatorPrepareService.getIndicatorByName(
            CODE_INDICATOR.SMA_FAST,
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
            const prices: OHLCV[] =
              await this.indicatorRequestService.getPrices(symbol, period);

            if (Array.isArray(prices) && prices.length > 0) {
              return this.getActionHistorySignals(
                amount_values,
                weight,
                prices,
                [line, ...trend],
                oscillator
              )
            } else {
              throw Error('prices is null');
            }
          } else {
            throw Error('oscillator is null');
          }
        } else {
          throw Error('line is null or trend is null');
        }
      } else {
        throw Error('amount_values < 0');
      }
    } catch (err) {
      console.error('getHistorySignals: ', err.message);

      return [];
    }
  }
  /**
   * Get orders
   * @param   {IHistory[]} history
   * @param   {string}     symbol
   * @returns {IOrder[]}
   */
  private async getOrders(history: IHistory[], symbol: string): Promise<IOrder[]> {
    try {
      const orders: IOrder[] = [];

      if (Array.isArray(history)) {
        for (let i: number = 0; i < history.length; i++) {
          const order: IOrder = await this.testingPriceService
            .getOrder(history[i], symbol);

          if (order) {
            if (order.hasOwnProperty('profit')) {
              orders.push(order);
            } else {
              throw Error('order.profit is null');
            }
          }
        }
      }

      return orders;
    } catch (err) {
      console.error('getOrders: ', err.message);

      return [];
    }
  }
  /**
   * Get action history signals
   * @param   {number}       amount_values
   * @param   {number}       weight
   * @param   {OHLCV}        prices
   * @param   {IIndicator[]} action
   * @param   {IIndicator[]} additional
   * @returns {IHistory[]}
   */
  private async getActionHistorySignals(
    amount_values: number,
    weight: number,
    prices: OHLCV[],
    action: IIndicator[],
    additional: IIndicator[]
  ): Promise<IHistory[]> {
    try {
      if (amount_values > 0) {
        if (
          Array.isArray(action) &&
          Array.isArray(additional) &&
          action.length > 0 &&
          additional.length > 0
        ) {
          const history_signals: IHistory[] = [];

          for (let i: number = 0; i < action.length; i++) {
            for (let j: number = 0; j < amount_values; j++) {
              if (
                action[i].signals[j] === CODE_ORDER.BUY ||
                action[i].signals[j] === CODE_ORDER.SELL
              ) {
                if (action[i].hasOwnProperty('weight')) {
                  let sum_points: number = action[i].weight;

                  for (let q: number = 0; q < additional.length; q++) {
                    if (
                      additional[q].signals[j] === CODE_ORDER.BUY ||
                      additional[q].signals[j] === CODE_ORDER.SELL
                    ) {
                      sum_points += additional[q].weight;
                    }
                  }

                  if (sum_points >= weight) {
                    history_signals.push({
                      type: action[i].signals[j],
                      close: prices[j][4],
                      points: sum_points,
                      timestamp: prices[j][0]
                    });
                  }
                } else {
                  throw Error('action[i].weight is null');
                }
              }
            }
          }

          return history_signals;
        } else {
          throw Error('action is null or additional is null');
        }
      } else {
        throw Error('amount_values < 0');
      }
    } catch (err) {
      console.error('getActionHistorySignals: ', err.message);

      return [];
    }
  }
  /**
   * Get testing result
   * @param   {IOrder[]}     orders
   * @param   {IIndicator[]} indicators
   * @returns {void}
   */
  private getTestingResult(
    orders: IOrder[],
    indicators: IIndicator[]
  ): IIndicatorTesting {
    try {
      if (Array.isArray(orders)) {
        let profits: number = 0;
        let bad_deals: number = 0;
        let good_deals: number = 0;

        for (let i: number = 0; i < orders.length; i++) {
          if (orders[i].hasOwnProperty('profit')) {
            if (orders[i].profit < 0) {
              profits += orders[i].profit;
              bad_deals++;
            } else {
              profits += orders[i].profit;
              good_deals++;
            }
          } else {
            throw Error('orders[i].profit is null');
          }
        }

        const indicator_settings: IIndicatorSetting[] = [];
        for (let i: number = 0; i < indicators.length; i++) {
          if (
            indicators[i].hasOwnProperty('id') &&
            indicators[i].hasOwnProperty('name') &&
            indicators[i].hasOwnProperty('type') &&
            indicators[i].hasOwnProperty('value') &&
            indicators[i].hasOwnProperty('weight')
          ) {
            indicator_settings.push({
              id: indicators[i].id,
              name: indicators[i].name,
              type: indicators[i].type,
              value: indicators[i].value,
              weight: indicators[i].weight
            });
          } else {
            throw Error('indicators[i] is null');
          }
        }

        return {
          profits: profits,
          good_deals: good_deals,
          bad_deals: bad_deals,
          indicator_settings
        }
      } else {
        throw Error('orders is null');
      }
    } catch (err) {
      console.error('getTestingResult: ', err.message);

      return null;
    }
  }
}
