import React from 'react'
import { useRecoilValue, useResetRecoilState } from 'recoil'
import { cartAtom } from '../store/atoms'

import {
  useDecreaseProductIncart,
  useRemoveProductIncart,
  useAddProductToCart,
  useAddProductToOrder
} from '../store/hooks'

import '../style/list.css'
import '../style/cart.css'

export default function Cart(): JSX.Element {
  const cartList = useRecoilValue(cartAtom)
  const [decreaseItemInCart] = useDecreaseProductIncart()
  const [rmItemInCart] = useRemoveProductIncart()
  const [addItemToCart] = useAddProductToCart()
  const [addToOrder] = useAddProductToOrder()
  const resetCart = useResetRecoilState(cartAtom)

  return<div>
    <h3>
      <i className="fas fa-shopping-cart" color="white"></i>
      我的购物车
      <div onClick={resetCart} id="clear-cart">清空</div>
    </h3>
    <div>
      {
        (
          cartList.length 
          &&
          <div className="list-header">
            <div>商品</div>
            <div>数量</div>
            <div>总价</div>
            <div>操作</div>
          </div>
        )
        || <div style={{textAlign:'center'}}>购物车空了</div>
      }
      {
         cartList.map(
          listItem => <div key={listItem.name} className="list-item">
            <div>{listItem.name}</div>
            <div>{listItem.quantity}</div>
            <div>{listItem.quantity * listItem.price}</div>
            <div className="cart-operation">
              <div onClick={()=>decreaseItemInCart(listItem)} className="reduce-item"> <i className="fas fa-minus"></i> </div>
              <div onClick={()=>addItemToCart(listItem)} className="add-item"> <i className="fas fa-plus-circle"></i> </div>
              <div onClick={()=>rmItemInCart(listItem)} className="remove-item">删除</div>
              <div onClick={()=>addToOrder(listItem)} className="remove-item">下订单</div>
            </div>
          </div>  
        )
      }
  </div>
  </div>
}