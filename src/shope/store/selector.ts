import { orderAtom, orderWillSubmitAtom } from './atoms'
import { selector} from 'recoil'

import { postOrder } from '../service'

// selector 结果会被缓存
export const submitOrderRes = selector<any>({
  key: 'submitOrderRes',
  get: async ({ get }) => {
    // orderWillSubmitAtom 改变的时候会重新计算 get
    // 能不能在 orderWillSubmitAtom 为初始值时不计算 selector 呢?
    const orderWillSubmit = get(orderWillSubmitAtom)
    // orderWillSubmit 为初始值时不执行请求
    if (!orderWillSubmit) return
    try {
      console.count('执行 selector 提交订单的次数')
      const res = await postOrder(orderWillSubmit)
      return res
    } catch (err) {
      throw err
    }
  },
  set: ({ set }, orderItem) => {
    set(orderWillSubmitAtom, orderItem)
  }
})

export const myOrderTotalCost = selector<number>({
  key: 'myOrderTotalPrice',
  get: ({ get }) => {
    const order = get(orderAtom)
    return order.reduce((total, orderItem) => total + orderItem.price * orderItem.quantity, 0)
  }
})

