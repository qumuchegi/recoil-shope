import iphone12 from './imgs/apple.jpeg'
import huawei from './imgs/huawei.jpeg'
import xiaomi from './imgs/xiaomi.jpeg'
import { OrderItem } from './const'

export const getProductList = () => {
  // console.count('调用 getProductList 次数')
  return new Promise((resolve) => {
    setTimeout(()=>{
      resolve({
        data: {
          products: [
            {
              id: 'iphone',
              name: 'iphone 12',
              price: 8400,
              img: iphone12
            },
            {
              id: 'huawei mate 40',
              name: 'huawei mate 40',
              price: 8600,
              img: huawei
            },
            {
              id: 'xiaomi 10',
              name: 'xiaomi 10',
              price: 5678,
              img: xiaomi
            }
          ]
        }
      })
    }, 3000)
  })
}

let orderDB: Array<OrderItem> = []
export const postOrder = (order: OrderItem) => {
  // console.count('接收订单')
  return new Promise((resolve) => {
    orderDB = [...orderDB, order]
    setTimeout(() => {
      resolve({
        data: {
          code: 0,
          msg: '订单提交成功',
          orderID: orderDB.map(orderItem => orderItem.orderID)
        }
      })
     }, 3000)
  })
}