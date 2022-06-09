import { IIndicatorSetting } from "./indicator.settings.interface";

export interface IIndicatorTesting {
  profits: number;
  bad_deals: number;
  good_deals: number;
  indicator_settings: IIndicatorSetting[];
}
