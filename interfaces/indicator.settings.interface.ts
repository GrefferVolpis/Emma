import { CODE_INDICATOR } from "./enum/code.indicator.enum";
import { TYPE_INDICATOR } from "./enum/type.indicator.enum";

export interface IIndicatorSetting {
  id: string;
  value: number[];
  weight: number;
  name: CODE_INDICATOR;
  type: TYPE_INDICATOR;
}