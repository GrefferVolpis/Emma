export interface IConfig {
  PORT: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_NAME: string;
  DB_PASSWORD: string;
  DB_USER: string;

  RETENTION: string;
  MACD_HISTOGRAM: string;
  RSI_LEVEL_MIN: string;
  RSI_LEVEL_MAX: string;

  SYMBOL: string;
  PERIOD_FAST: string;
  PERIOD_SLOW: string;

  STOP_LOSS: string;
  TAKE_PROFIT: string;

  GOOD_DEALS: string;
  WEIGHT: string;
  PROFITS: string;
  FIT_VALUE: string;
  FIT_WEIGHT: string;
  COMBINATIONS: string;
  AMOUNT_DEALS: string;
  ANALYS_TESTING: string;
  THRESHOLD_DEALS: string;
  THRESHOLD_PROFITS: string;

  API_KEY: string;
  SECRET: string;
}