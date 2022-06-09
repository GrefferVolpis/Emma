import { CODE_INDICATOR } from "./enum/code.indicator.enum";
import { TYPE_INDICATOR } from "./enum/type.indicator.enum";

export interface IIndicator {
  id: string;
  name: CODE_INDICATOR;
  type: TYPE_INDICATOR;
  value: number[];
  weight: number;
  diapason: number[];
  amount_parameters: number;
  signals?: number[];
  indicator_values?: number[];
  fn_active?: Function;
  fn_request?: Function;
}