import React from 'react'
import {useRecoilValueLoadable, useRecoilValue} from 'recoil'
import {productAtom, cartAtom} from '../store/atoms'
import {useAddProductToCart, useRemoveProductIncart} from '../store/hooks'
import { ProductItem } from '../const'

import '../style/products.css'

// ProductListLoadable.whyDidYouRender = true
function ProductListLoadable(): JSX.Element {
  //productsLoadable 会被缓存
  const productsLoadable = useRecoilValueLoadable(productAtom)
  const cart = useRecoilValue(cartAtom)
  const [addToCart] = useAddProductToCart()
  const [rmItemInCart] = useRemoveProductIncart()

  // 可以用 React 的 Suspense 代替下面的代码来处理异步状态
  switch (productsLoadable.state) {
    case 'hasValue': 
      const products: Array<ProductItem> = productsLoadable.contents
      return <div>
        {
          products
          .map((product:ProductItem) => 
            <div key={product.id} className="product-item">
              <div><img src={product.img} style={{width: '60px'}} alt=''/></div>
              <div>{product.name}</div>
              <div>{product.price} 元</div>
              {
                cart.findIndex(
                  itemCart => itemCart.id === product.id
                ) === -1
                ?
                <div className='add-to-cart' onClick={() => addToCart(product)}>
                  加入购物车
                </div>
                :
                <div className='rm-in-cart' onClick={() => rmItemInCart(product)}>
                  从购物车删除
                </div>
              }
            </div>
          )
        }
      </div>
    case 'hasError':
      return <div>请求出错</div>
    case 'loading': 
    default: 
      return <div style={{textAlign: 'center'}}>正在加载中......</div>
  }
}

export default function ProductList() {
  return <div>
    <h3>
      <i className="fas fa-store-alt"></i>
      商品列表
    </h3>
    <ProductListLoadable/>
  </div>
}