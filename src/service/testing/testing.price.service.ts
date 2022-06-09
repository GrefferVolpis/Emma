import { Injectable, Inject } from '@nestjs/common';
import { OHLCV } from 'ccxt';
import { ConfigService } from './../config/config.service';
import { IndicatorRequestService } from './../indicator/indicator.request.service';
import { IOrder } from './../../../interfaces/order.interface';
import { IHistory } from './../../../interfaces/history.interface';
import { CODE_ORDER } from './../../../interfaces/enum/code.order.enum';

@Injectable()
export class TestingPriceService {
  private STOP_LOSS: number = 0;
  private TAKE_PROFIT: number = 0;
  /**
   * Constructor TestingLogicService
   * @param {ConfigService}           @Iniect('ConfigService')           private configService
   * @param {IndicatorRequestService} @Iniect('IndicatorRequestService') private indicatorRequestService
   */
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(IndicatorRequestService)
    private readonly indicatorRequestService: IndicatorRequestService
  ) {
    this.STOP_LOSS = +this.configService.get('STOP_LOSS');
    this.TAKE_PROFIT = +this.configService.get('TAKE_PROFIT');
  }
  /**
   * Get order
   * @param   {IHistory} history
   * @param   {string}   symbol
   * @returns {Promise<IOrder>}
   */
  public async getOrder(history: IHistory, symbol: string): Promise<IOrder> {
    try {
      if (history.type === CODE_ORDER.BUY || history.type === CODE_ORDER.SELL) {
        let stop_loss: number = this.getStopLoss(history.type, history.close);
        let take_profit: number = this.getTakeProfit(history.type, history.close);

        if (
          stop_loss !== 0 &&
          take_profit !== 0
        ) {
          const prices: OHLCV[] = await this.indicatorRequestService
            .getPrices(symbol, '1m', history.timestamp);

          if (
            Array.isArray(prices) &&
            prices.length > 0
          ) {
            return this.getTracingOrder(
              stop_loss,
              take_profit,
              prices,
              history
            );
          } else {
            throw Error('prices is null');
          }
        } else {
          throw Error('stop_loss is null && take_profit is null');
        }
      } else {
        return null;
      }
    } catch (err) {
      console.error('getOrder: ', err.message);

      return null;
    }
  }
  /**
   * Get tracing order
   * @param   {number}   stop_loss
   * @param   {number}   take_profit
   * @param   {OHLCV[]}  prices
   * @param   {IHistory} history
   * @returns {Promise<IOrder>}
   */
  public async getTracingOrder(
    stop_loss: number,
    take_profit: number,
    prices: OHLCV[],
    history: IHistory
  ): Promise<IOrder> {
    try {
      if (
        history.hasOwnProperty('type') &&
        history.hasOwnProperty('close') &&
        history.hasOwnProperty('points')
      ) {
        for (let i: number = 1; i < prices.length; i++) {
          if (history.type === CODE_ORDER.BUY) {
            if (
              prices[i][4] > take_profit ||
              prices[i][4] > prices[i - 1][4]
            ) {
              stop_loss = this.getStopLoss(history.type, prices[i][4]);
              take_profit = this.getTakeProfit(history.type, prices[i][4]);
            } else if (prices[i][4] < stop_loss) {
              return {
                open: history.close,
                close: prices[i][4],
                type: history.type,
                profit: history.close - prices[i][4],
                points: history.points
              }
            }
          } else {
            if (
              prices[i][4] < take_profit ||
              prices[i][4] < prices[i - 1][4]
            ) {
              stop_loss = this.getStopLoss(history.type, prices[i][4]);
              take_profit = this.getTakeProfit(history.type, prices[i][4]);
            } else if (prices[i][4] > stop_loss) {
              return {
                open: history.close,
                close: prices[i][4],
                type: history.type,
                profit: prices[i][4] - history.close,
                points: history.points
              }
            }
          }
        }

        return {
          open: history.close,
          close: prices[prices.length - 1][4],
          type: history.type,
          profit: prices[prices.length - 1][4] - history.close,
          points: history.points
        }
      } else {
        throw Error('history is null');
      }
    } catch (err) {
      console.error('getTracingOrder: ', err.message);

      return null;
    }
  }
  /**
   * Get stop loss
   * @param   {IHistory} code
   * @param   {number}   price
   * @returns {number}
   */
  private getStopLoss(code: CODE_ORDER, price: number): number {
    try {
      if (code === CODE_ORDER.BUY) {
        return price + price / 100 * this.STOP_LOSS;
      } else if (code === CODE_ORDER.SELL) {
        return price - price / 100 * this.STOP_LOSS;
      } else {
        return 0;
      }
    } catch (err) {
      console.error('getStopLoss: ', err.message);

      return 0;
    }
  }
  /**
   * Get take profit
   * @param   {IHistory} code
   * @param   {number}   price
   * @returns {number}
   */
  private getTakeProfit(code: CODE_ORDER, price: number): number {
    try {
      if (code === CODE_ORDER.BUY) {
        return price + price / 100 * this.TAKE_PROFIT;
      } else if (code === CODE_ORDER.SELL) {
        return price - price / 100 * this.TAKE_PROFIT;
      } else {
        return 0;
      }
    } catch (err) {
      console.error('getTakeProfit: ', err.message);

      return 0;
    }
  }
}
