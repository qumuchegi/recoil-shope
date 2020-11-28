
export enum requestStatus {
  noReq = 'NO_REQ',
  pending = 'REQ_PENDIND',
  err = 'REQ_ERR',
  success = 'REQ_SUCCESS'
}

export interface ProductItem {
  id: string,
  name: string,
  price: number,
  img: string
}
export interface CartItem extends ProductItem{
  quantity: number,
}
export interface OrderItem extends CartItem{
  orderID: string
}
export type CartState = Array<CartItem>
export type OrderState = Array<OrderItem>

export interface LoadableStateHandler{
  success: (res?: any) => void,
  fail: (err?: any) => void,
  pending: () => void
}