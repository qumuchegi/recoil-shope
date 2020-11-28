import { useEffect, useState } from 'react'
import {
  useRecoilState,
  useSetRecoilState,
  useResetRecoilState,
  Loadable,
  useRecoilValue,
  useRecoilStateLoadable,
  RecoilState,
  SetterOrUpdater
} from 'recoil'
import { cartAtom, orderAtom, orderWillSubmitAtom, orderIDHadSubmitAtom } from './atoms'
import {submitOrderRes} from './selector'
import {produce} from 'immer'
import { ProductItem, CartItem, CartState, OrderItem, OrderState, LoadableStateHandler } from '../const'

// 添加商品到 cart
export function useAddProductToCart() {
  const [cart, setCart] = useRecoilState<CartState>(cartAtom)
  const addToCart = (item: ProductItem) => {
    const idx = cart.findIndex(cartItem => item.id === cartItem.id) 
    if (idx === -1) {
      const newItem = {...item, quantity: 1}
      setCart([...cart, newItem])
    } else {
      setCart(produce(draftCart => {
        const itemInCart = draftCart[idx]
        itemInCart.quantity ++
      }))
    }
  }
  return [addToCart]
}

// 减少 cart 里的商品的数量
export function useDecreaseProductIncart() {
  const setCart = useSetRecoilState<CartState>(cartAtom)
  const decreaseItemInCart = (item: CartItem) => {
    setCart(produce(draftCart => {
      const {id} = item
      draftCart.forEach((item: CartItem, idx: number, _draftCart: CartState) => {
        if(item.id === id) {
          if (item.quantity > 1) item.quantity --
          else if (item.quantity === 1) {
            draftCart.splice(idx, 1)
          }
        }
      })
    }))
  }
  return [decreaseItemInCart]
}

// 删除 cart 里的商品
export function useRemoveProductIncart() {
  const setCart = useSetRecoilState<CartState>(cartAtom)
  const rmItemIncart = (item: CartItem|ProductItem) => {
    setCart(produce(draftCart => {
      draftCart = draftCart.filter((_item: CartItem) => _item.id !== item.id)
      return draftCart
    }))
  }
  return [rmItemIncart]
}

// 将 cart 里的商品加到订单
export function useAddProductToOrder() {
  const setOrder = useSetRecoilState<OrderState>(orderAtom)
  const [rmItemIncart] = useRemoveProductIncart()
  const addToOrder = (item: CartItem) => {
    setOrder(produce(draftOrder => {
      draftOrder = [...draftOrder, {...item, orderID: Math.random()}]
      return draftOrder
    }))
    // 从购物车删除掉
    rmItemIncart(item)
  }
  return [addToOrder]
}

// 提交订单
export function useSubmitOrder() {
  const [orderIDHadSubmit, setOrderIDHadSubmit] = useRecoilState<Array<string>>(orderIDHadSubmitAtom)
  const orderWillSubmit = useRecoilValue<OrderItem|null>(orderWillSubmitAtom)
  const [submitLoadable, setOrderWillSubmit] = useRequestBySelector(submitOrderRes)
  const resetOrderWillSubmit = useResetRecoilState(orderWillSubmitAtom)

  const loadableStateHandler: LoadableStateHandler = {
    pending: () => {
      console.count('正在提交订单')
    },
    success: (res: any) => {
      if(!res) return
      const hadSubmitOrderID = res.data.orderID
      setOrderIDHadSubmit(hadSubmitOrderID)
      resetOrderWillSubmit()
      console.log('提交订单成功', hadSubmitOrderID)
    },
    fail: (err: any) => {
      console.log('订单提交失败', err)
    }
  }
  const isPending = useLoadable(submitLoadable, loadableStateHandler)
  const submitOrder = (orderItem: OrderItem) => {
    // 只需要往 orderWillSubmitAtom 添加待提交的订单，
    // submitOrderRes 这个 selector 会自动执行提交的异步请求
    // 然后将请求后的响应返回，我们在 recoil loadable 获取响应
    setOrderWillSubmit(orderItem)
  }

  return { submitOrder, orderIDHadSubmit, isPending, orderIDWillSubmit: orderWillSubmit?.orderID }
}
/**
 * 依赖异步 selector 进行请求
 * @param asyncSelector 异步 selector
 */
function useRequestBySelector(asyncSelector: RecoilState<any>)
  : [loadable: Loadable<any>, setReqDependies: SetterOrUpdater<any>] {
  const [loadable, setSelectorDependies] = useRecoilStateLoadable<RecoilState<any>>(asyncSelector)
  return[loadable, setSelectorDependies]
}
/**
 * 通用的 loadable 状态机
 * @param {Loadable} loadable useRecoilStateLoadable 返回的 loadable
 * @param {LoadableStateHandler} stateHandler 请求状态处理器，分别有 [正在请求 请求完成 请求出错] 3 种状态的处理器
 */
const useLoadable = (loadable: Loadable<any>, loadableStateHandler: LoadableStateHandler) => {
  const [isPending, setIsPending] = useState<boolean>(false)

  useEffect(() => {
    switch (loadable.state) {
      case 'hasValue':
        setIsPending(false)
        const response = loadable.contents
        loadableStateHandler.success(response)
        break
      case 'hasError':
        setIsPending(false)
        const err = loadable.contents
        loadableStateHandler.fail(err)
        break
      case 'loading':
        setIsPending(true)
        loadableStateHandler.pending()
        break
      default:
        break
    }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
    , [loadable.state])
  
  return isPending
}