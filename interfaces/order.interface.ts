import { CODE_ORDER } from "./../interfaces/enum/code.order.enum";

export interface IOrder {
  open: number;
  close: number;
  profit: number;
  points: number;
  type: CODE_ORDER;
}
