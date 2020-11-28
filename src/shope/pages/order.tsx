import React from 'react'
import { useRecoilValue } from 'recoil'
import { myOrderTotalCost } from '../store/selector'
import { orderAtom } from '../store/atoms'
import { useSubmitOrder } from '../store/hooks'
import { OrderItem, OrderState } from '../const'

import '../style/order.css'

export default function Order(): JSX.Element {
  const orderList = useRecoilValue<OrderState>(orderAtom)
  const orderTotalCost = useRecoilValue<number>(myOrderTotalCost)
  const { submitOrder, orderIDHadSubmit, isPending, orderIDWillSubmit } = useSubmitOrder()

  const onSubmit = (orderItem: OrderItem) => {
    submitOrder(orderItem)
  }

  return<div>
    <h3>
      <i className="fas fa-list"></i>
      <div>我的订单</div>
      {
        orderList.length > 0
        ?
        <div style={{ backgroundColor: 'red', width: '25px', height: '25px', borderRadius: '25px', textAlign: 'center', color: 'white' }}>
          {orderList.length}
        </div>
        : null
      }
      <div><span>（总价：{orderTotalCost} ¥）</span></div>
    </h3>
    <div style={{display: 'flex', justifyContent:'flex-start'}}>
    {
      orderList.map(
        listItem => <div key={listItem.orderID} className="order-item">
          <div style={{display:'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
            <img src={listItem.img} style={{width: '60px'}} alt=''/>
            {listItem.name}
          </div>
          <div>
            <div>¥ {listItem.quantity * listItem.price}</div>
            <div>共 {listItem.quantity} 件</div>
            <div>订单号: {listItem.orderID}</div>
          </div>
          {
            isPending && orderIDWillSubmit === listItem.orderID
            ?
            <div>正在提交....</div>
            :
            (orderIDHadSubmit as Array<string>).findIndex((id: string) => id === listItem.orderID) !== -1
              ? 
              <div className="submit-success">此订单已提交</div>
              :
              <div onClick={
                () => onSubmit(listItem)
              } className="submit-button">
              提交
              </div>
          }
        </div>  
      )
    }    
    </div>
  </div>
}
