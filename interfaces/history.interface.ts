import { CODE_ORDER } from "./../interfaces/enum/code.order.enum";

export interface IHistory {
  close: number;
  points: number;
  timestamp: number;
  type: CODE_ORDER;
}
