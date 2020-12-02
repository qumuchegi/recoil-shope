import React from 'react'
import MyRecoilRoot, {useMyRecoilState, useMyRecoilValue} from './recoil'

const countAtom = {
  key: 'count_atom',
  defaultValue: 0
}

const countAtom1 = {
  key: 'count_atom_1',
  defaultValue: 0
}


const style = {border: 'solid 1px #456', width: '200px', margin: '20px'}
//Com1.whyDidYouRender = true
function Com1() {
  const [count, setCount] = useMyRecoilState(countAtom)
  const [count1, setCount1] = useMyRecoilState(countAtom1)

  function handleChange(){
    setCount(count => count + 1)
  }
  function handleChange1(){
    setCount1(count1 => count1 + 1)
  }
  return (
    <div style={style}>
      <h2>组件1</h2>
      <div>count: {count}</div>
      <div>count1: {count1}</div>
      <button onClick={handleChange}>点击更新 count ，看组件2、3会否更新</button>
      <button onClick={handleChange1}>点击更新 count1 ，看组件2、3会否更新</button>
    </div>
  )
}

Com2.whyDidYouRender = true
function Com2() {
  const count = useMyRecoilValue(countAtom)
  return (
    <div style={style}>
      <h2>组件2</h2>
      <div>count: {count}</div>
    </div>
  )
}

//Com3.whyDidYouRender = true
function Com3() {
  const count = useMyRecoilValue(countAtom)
  return (
    <div style={style}>
      <h2>组件3</h2>
      <div>count: {count}</div>
    </div>
  )
}

App.whyDidYouRender = true
export default function App() {
  
  return <MyRecoilRoot>
    <Com1/>
    <Com2/>
    <Com3/>
  </MyRecoilRoot>
}