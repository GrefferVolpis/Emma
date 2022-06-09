import { Injectable, Inject } from '@nestjs/common';
import { binance, OHLCV } from 'ccxt';
import {
  bb,
  sma,
  rsi,
  macd,
  stochasticrsi,
  MACDOutput,
  StochasticRSIOutput,
  BollingerBandsOutput
} from 'trading-indicator';
import { ConfigService } from './../config/config.service';

@Injectable()
export class IndicatorRequestService {
  private API_KEY: string = '';
  private SECRET: string = '';

  private client: binance = null;
  /**
   * Constructor IndicatorRequestService
   * @param {ConfigService} @Inject('ConfigService') private configService
   */
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService
  ) {
    this.API_KEY = this.configService.get('API_KEY');
    this.SECRET = this.configService.get('SECRET');

    this.client = new binance({
      API_KEY: this.API_KEY,
      SECRET: this.SECRET
    });
  }
  /**
   * Get prices
   * @param   {string} symbol
   * @param   {string} period
   * @param   {number} since
   * @returns {Promise<OHLCV[]>}
   */
  public async getPrices(
    symbol: string,
    period: string,
    since?: number,
  ): Promise<OHLCV[]> {
    try {
      if (since) {
        return this.client.fetchOHLCV(symbol, period, since);
      } else {
        return this.client.fetchOHLCV(symbol, period);
      }
    } catch (err) {
      console.error('getPrices: ', err.message);

      return [];
    }
  }
  /**
   * Get SMA
   * @param   {number} smaLength
   * @param   {string} symbol
   * @param   {string} period
   * @returns {Promise<number[]>}
   */
  public async getSMA(
    smaLength: number,
    symbol: string,
    period: string
  ): Promise<number[]> {
    try {
      return sma(
        smaLength,
        "close",
        "binance",
        symbol,
        period,
        true
      );
    } catch (err) {
      console.error('getSMA: ', err.message);

      return [];
    }
  }
  /**
   * Get Bollinger bands
   * @param   {number} bbPeriod
   * @param   {string} symbol
   * @param   {string} period
   * @returns {Promise<BollingerBandsOutput[]>}
   */
  public async getBB(
    bbPeriod: number,
    symbol: string,
    period: string
  ): Promise<BollingerBandsOutput[]> {
    try {
      return bb(
        bbPeriod,
        2,
        "close",
        "binance",
        symbol,
        period,
        true
      );
    } catch (err) {
      console.error('getBB: ', err.message);

      return [];
    }
  }
  /**
   * Get RSI
   * @param   {number} rsiLength
   * @param   {string} symbol
   * @param   {string} period
   * @returns {Promise<number[]>}
   */
  public async getRSI(
    rsiLength: number,
    symbol: string,
    period: string
  ): Promise<number[]> {
    try {
      return rsi(
        rsiLength,
        "close",
        "binance",
        symbol,
        period,
        true
      );
    } catch (err) {
      console.error('getRSI: ', err.message);

      return [];
    }
  }
  /**
   * Get MACD
   * @param   {number} fastPeriod
   * @param   {number} slowPeriod
   * @param   {number} signalPeriod
   * @param   {string} symbol
   * @param   {string} period
   * @returns {Promise<MACDOutput[]>}
   */
  public async getMACD(
    fastPeriod: number,
    slowPeriod: number,
    signalPeriod: number,
    symbol: string,
    period: string
  ): Promise<MACDOutput[]> {
    try {
      return macd(
        fastPeriod,
        slowPeriod,
        signalPeriod,
        "close",
        "binance",
        symbol,
        period,
        true
      );
    } catch (err) {
      console.error('getMACD: ', err.message);

      return [];
    }
  }
  /**
   * Get stochastic RSI
   * @param   {number} k
   * @param   {number} d
   * @param   {number} rsiLength
   * @param   {number} stochasticrsiLength
   * @param   {string} symbol
   * @param   {string} period
   * @returns {Promise<StochasticRSIOutput[]>}
   */
  public async getStochasticRSI(
    k: number,
    d: number,
    rsiLength: number,
    stochasticrsiLength: number,
    symbol: string,
    period: string
  ): Promise<StochasticRSIOutput[]> {
    try {
      return stochasticrsi(
        k,
        d,
        rsiLength,
        stochasticrsiLength,
        "close",
        "binance",
        symbol,
        period,
        true
      );
    } catch (err) {
      console.error('getStochasticRSI: ', err.message);

      return [];
    }
  }
}
