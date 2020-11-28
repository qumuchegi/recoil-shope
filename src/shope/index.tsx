import React, { useMemo, useState } from 'react'
import { RecoilRoot } from 'recoil'
import ProductList from './pages/products'
import Order from './pages/order'
import Cart from './pages/cart'
import './style/index.css'

export default function Shope() {
  const [isTabMode, setIstabMode] = useState(false)
  const [tabIdxDisplayed, setTabIdxDisplayed] = useState(0)

  const Modals = [
    <ProductList key={0} />,
    <Cart key={1} />,
    <Order key={2} />
  ]

  return <RecoilRoot>
    <div id="tab-mode-switch">
      <div id='switch-container' onClick={()=>setIstabMode(!isTabMode)}>
        <div id='switch-handle' className={isTabMode ? 'left':'right'}></div>
      </div>
      <div >
        {isTabMode ? '正在使用 tab 模式' : '已关闭 tab 模式'}</div>
    </div>
    <div style={{display:'felx', justifyContent:'space-around'}}>
      {
        !isTabMode
        ?
         <div> {Modals} </div>
        : 
          <div> 
            <div id="tab-nav">
              {
                ['商品列表', '我的购物车', '我的订单']
                .map((tabName, idx) => 
                  <div key={tabName} 
                      onClick={() => setTabIdxDisplayed(idx)}
                      style={{backgroundColor: tabIdxDisplayed === idx ? '#aac':'white'}}
                  >{tabName}</div>
                )
              }
            </div>
            {Modals[tabIdxDisplayed]} 
          </div>
      }
    </div>
  </RecoilRoot>
}