import {atom} from 'recoil'
import { getProductList } from '../service'
import { ProductItem, CartState, OrderItem, OrderState } from '../const'

// atom 可以是异步的
export const productAtom = atom<Array<ProductItem>>({
  key: 'productState',
  default: (async () => {
    const res: any = await getProductList()
    return res.data.products
  })() // 返回 promise
})

export const cartAtom = atom<CartState>({
  key: 'cartState',
  default: []
})

export const orderAtom = atom<OrderState>({
  key: 'orderState',
  default: []
})

export const orderWillSubmitAtom = atom<OrderItem|null>({
  key: 'orderWillSubmitAtom',
  default: null
})

export const orderIDHadSubmitAtom = atom<Array<string>>({
  key: 'orderIDHadSubmitAtom',
  default: []
})