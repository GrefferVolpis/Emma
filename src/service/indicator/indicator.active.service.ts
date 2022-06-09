import { Injectable, Inject } from '@nestjs/common';
import { OHLCV } from 'ccxt';
import {
  MACDOutput,
  StochasticRSIOutput,
  BollingerBandsOutput
} from 'trading-indicator';
import { ConfigService } from './../config/config.service';
import { CODE_ORDER } from './../../../interfaces/enum/code.order.enum';

@Injectable()
export class IndicatorActiveService {
  private RSI_LEVEL_MIN: number = 0;
  private RSI_LEVEL_MAX: number = 0;
  private MACD_HISTOGRAM: number = 0;
  /**
   * Constructor IndicatorActiveService
   * @param {ConfigService} @Inject('ConfigService') private configService
   */
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService
  ) {
    this.RSI_LEVEL_MIN = +this.configService.get('RSI_LEVEL_MIN');
    this.RSI_LEVEL_MAX = +this.configService.get('RSI_LEVEL_MAX');
    this.MACD_HISTOGRAM = +this.configService.get('MACD_HISTOGRAM');
  }
  /**
   * Action SMA
   * @param   {number}   amount_values
   * @param   {number[]} first_indicator_values
   * @param   {number[]} second_indicator_values
   * @returns {CODE_ORDER[]}
   */
  public actionSMA(
    amount_values: number,
    first_indicator_values: number[],
    second_indicator_values: number[],
  ): CODE_ORDER[] {
    try {
      const signals: CODE_ORDER[] = [];

      if (
        amount_values > 0 &&
        Array.isArray(first_indicator_values) &&
        Array.isArray(second_indicator_values)
      ) {
        for (let i: number = 1; i < amount_values; i++) {
          if (
            first_indicator_values[i] < second_indicator_values[i] &&
            first_indicator_values[i - 1] > second_indicator_values[i - 1]
          ) {
            signals.push(CODE_ORDER.BUY);
          } else if (
            first_indicator_values[i] > second_indicator_values[i] &&
            first_indicator_values[i - 1] < second_indicator_values[i - 1]
          ) {
            signals.push(CODE_ORDER.SELL);
          } else {
            signals.push(CODE_ORDER.NEUTRAL);
          }
        }
      } else {
        throw new Error('first_indicator is null or second_indicator is null');
      }

      return signals;
    } catch (err) {
      console.error('actionSMA: ', err.message);

      return [];
    }
  }
  /**
   * Action Bollinger bands
   * @param   {number}                 retention
   * @param   {number}                 amount_values
   * @param   {OHLCV[]}                prices
   * @param   {BollingerBandsOutput[]} indicator_values
   * @returns {CODE_ORDER[]}
   */
  public actionBB(
    amount_values: number,
    prices: OHLCV[],
    indicator_values: BollingerBandsOutput[]
  ): CODE_ORDER[] {
    try {
      const signals: CODE_ORDER[] = [];

      if (
        amount_values > 0 &&
        Array.isArray(prices) &&
        Array.isArray(indicator_values)
      ) {
        for (let i: number = 1; i < amount_values; i++) {
          if (
            prices[i - 1][4] > indicator_values[i - 1].upper &&
            prices[i][4] < indicator_values[i].upper &&
            indicator_values[i].pb > 0.2
          ) {
            signals.push(CODE_ORDER.BUY);
          } else if (
            prices[i - 1][4] < indicator_values[i - 1].lower &&
            prices[i][4] > indicator_values[i].lower &&
            indicator_values[i].pb < -0.2
          ) {
            signals.push(CODE_ORDER.SELL);
          } else {
            signals.push(CODE_ORDER.NEUTRAL);
          }
        }
      } else {
        throw new Error('indicator_values is null');
      }

      return signals;
    } catch (err) {
      console.error('actionBB: ', err.message);

      return [];
    }
  }
  /**
   * Action RSI
   * @param   {number}   retention
   * @param   {number}   amount_values
   * @param   {number[]} indicator_values
   * @returns {CODE_ORDER[]}
   */
  public actionRSI(
    retention: number,
    amount_values: number,
    indicator_values: number[],
  ): CODE_ORDER[] {
    try {
      const signals: CODE_ORDER[] = [];

      if (
        amount_values > 0 &&
        Array.isArray(indicator_values)
      ) {
        for (let i: number = 1; i < amount_values; i++) {
          if (
            indicator_values[i] > this.RSI_LEVEL_MIN &&
            indicator_values[i - 1] < this.RSI_LEVEL_MIN
          ) {
            signals.push(
              ...this.continueSignal(retention, CODE_ORDER.BUY)
            );
            i += retention - 1;
          } else if (
            indicator_values[i] < this.RSI_LEVEL_MAX &&
            indicator_values[i - 1] > this.RSI_LEVEL_MAX
          ) {
            signals.push(
              ...this.continueSignal(retention, CODE_ORDER.SELL)
            );
            i += retention - 1;
          } else {
            signals.push(CODE_ORDER.NEUTRAL);
          }
        }
      } else {
        throw new Error('indicator_values is null');
      }

      return signals;
    } catch (err) {
      console.error('actionRSI: ', err.message);

      return [];
    }
  }
  /**
   * Action MACD
   * @param   {number}       retention
   * @param   {number}       amount_values
   * @param   {MACDOutput[]} indicator_values
   * @returns {CODE_ORDER[]}
   */
  public actionMACD(
    retention: number,
    amount_values: number,
    indicator_values: MACDOutput[],
  ): CODE_ORDER[] {
    try {
      const signals: CODE_ORDER[] = [];

      if (
        amount_values > 0 &&
        Array.isArray(indicator_values)
      ) {
        for (let i: number = 1; i < amount_values; i++) {
          if (
            indicator_values[i].MACD < indicator_values[i].signal &&
            indicator_values[i - 1].MACD > indicator_values[i - 1].signal &&
            indicator_values[i].histogram < this.MACD_HISTOGRAM
          ) {
            signals.push(
              ...this.continueSignal(retention, CODE_ORDER.BUY)
            );
            i += retention - 1;
          } else if (
            indicator_values[i].MACD > indicator_values[i].signal &&
            indicator_values[i - 1].MACD < indicator_values[i - 1].signal &&
            indicator_values[i].histogram > this.MACD_HISTOGRAM
          ) {
            signals.push(
              ...this.continueSignal(retention, CODE_ORDER.SELL)
            );
            i += retention - 1;
          } else {
            signals.push(CODE_ORDER.NEUTRAL);
          }
        }
      } else {
        throw new Error('indicator_values is null');
      }

      return signals;
    } catch (err) {
      console.error('actionMACD: ', err.message);

      return [];
    }
  }
  /**
   * Action Stoch RSI
   * @param   {number}                retention
   * @param   {number}                amount_values
   * @param   {StochasticRSIOutput[]} indicator_values
   * @returns {CODE_ORDER[]}
   */
  public actionStochRSI(
    retention: number,
    amount_values: number,
    indicator_values: StochasticRSIOutput[],
  ): CODE_ORDER[] {
    try {
      const signals: CODE_ORDER[] = [];

      if (
        amount_values > 0 &&
        Array.isArray(indicator_values)
      ) {
        for (let i: number = 1; i < amount_values; i++) {
          if (
            indicator_values[i].k < indicator_values[i].d &&
            indicator_values[i - 1].k > indicator_values[i - 1].d &&
            indicator_values[i].stochRSI < this.RSI_LEVEL_MIN
          ) {
            signals.push(
              ...this.continueSignal(retention, CODE_ORDER.BUY)
            );
            i += retention - 1;
          } else if (
            indicator_values[i].k > indicator_values[i].d &&
            indicator_values[i - 1].k < indicator_values[i - 1].d &&
            indicator_values[i].stochRSI > this.RSI_LEVEL_MIN
          ) {
            signals.push(
              ...this.continueSignal(retention, CODE_ORDER.SELL)
            );
            i += retention - 1;
          } else {
            signals.push(CODE_ORDER.NEUTRAL);
          }
        }
      } else {
        throw new Error('indicator_values is null');
      }

      return signals;
    } catch (err) {
      console.error('actionStochRSI: ', err.message);

      return [];
    }
  }
  /**
   * Continue signal
   * @param   {number}     retention
   * @param   {CODE_ORDER} type
   * @returns {CODE_ORDER[]}
   */
  public continueSignal(
    retention: number,
    type: CODE_ORDER
  ): CODE_ORDER[] {
    try {
      const signals: CODE_ORDER[] = [];

      for (let i: number = 0; i < retention; i++) {
        signals.push(type);
      }

      return signals;
    } catch (err) {
      console.error('continueSignal: ', err.message);

      return [];
    }
  }
}
