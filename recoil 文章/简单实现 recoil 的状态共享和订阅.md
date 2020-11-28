Recoil 是一个新的 React 状态管理库，现在还处于试验阶段，它提出了分散式的原子化状态管理，提供 Hooks 式的 API 用于设置和获取状态，并使组件订阅状态。本文简单的实现了 Recoil 中使多个组件共享并订阅某个 state 的原理。

### my-recoil  (v1.0)

>关于怎么使用 recoil 和 recoil 的原理， 我写了一篇文章，可以前往 [这里](https://juejin.cn/post/6889763592947564551)

实现一个小型的 recoil, 就叫它 my-recoil 

直接上代码：

```js
// my-recoil
import React,{ useEffect, useState, useRef, useContext } from 'react';

const nodes = new Map()
const subNodes = new Map()
let subID = 0

class Node{
  constructor(k, v){
    this.key = k
    this.value = v
  }
  getValue(){
    return this.value 
  }
  setValue(newV) {
    this.value = newV
  }
}

export function useMySetRecoilState(atom) {
  const { key, defaultValue } = atom
  let node
  const store = useStoreRef().current
  const hasNode = store.atomValues.has(key)
  if (hasNode) {
    node = store.atomValues.get(key)
  } else {
    const newNode = new Node(key, defaultValue)
    store.atomValues.set(key, newNode)
    node = store.atomValues.get(key)
  }

  const setState = (newValueOrUpdater) => {
    let newValue
    if (typeof newValueOrUpdater === 'function') {
      newValue = newValueOrUpdater(node.getValue())
    }
    node.setValue(newValue)
    store.atomValues.set(key, node)
    store.replaceState()
  }

  return setState
}

function subRecoilState(store, atomkey, subid, cb) {
  if(!store.nodeToComponentSubscriptions.has(`${subid}-${atomkey}`)){
    store.nodeToComponentSubscriptions.set(`${subid}-${atomkey}`, cb)
  }
}

export function useMyRecoilValue(atom) {
  const [_, forceUpdate] = useState([])
  const { key, defaultValue } = atom
  const storeRef = useStoreRef()
  const store = storeRef.current
  let hasNode = store.atomValues.has(key)
  let node
  if (!hasNode) {
    node = new Node(key, defaultValue)
    store.atomValues.set(key, node)
  }
  node = store.atomValues.get(key)

  useEffect(() => {
    subRecoilState(store, key, subID++, () =>{
      forceUpdate([])
    })
  }, [key, node, store, storeRef])
  
  return node.getValue()
}

export function useMyRecoilState(atom) {
  return [useMyRecoilValue(atom), useMySetRecoilState(atom)]
}

const storeContext = React.createContext()
export const useStoreRef = () => useContext(storeContext)

export default function MyRecoilRoot({children}) {
  const notifyUpdate = useRef()
  function setNotify(x) {
    notifyUpdate.current = x
  }
  function Batcher({setNotify}) {
    const [_, setState] = useState([])
    setNotify(() => setState([]))

    useEffect(() => {
      // 广播更新事件
      storeState.current.nodeToComponentSubscriptions.forEach((cb) => {
        cb()
      })
    })
    return null
  }
  function replaceState(key) {
    notifyUpdate.current()
    storeState.current.updateAtomKey = key
  }
  const storeState = useRef({
    atomValues: nodes,
    replaceState,
    nodeToComponentSubscriptions: subNodes
  })

  return <div>
    <storeContext.Provider value={storeState}>
      <Batcher setNotify={setNotify}/>
      {children}
    </storeContext.Provider>
  </div>
}

```

然后我们来使用这个 my-recoil 库，在另一个文件里定义三个 React 组件，并使用 my-recoil 提供的 ` MyRecoilRoot`、 `useMyRecoilState`、 `useMyRecoilValue`，分别模拟 Recoil 的 `RecoilRoot`、`useRecoilState`、`useRecoilValue`：

```js
import React from 'react'
import MyRecoilRoot, {useMyRecoilState, useMyRecoilValue} from './recoil'

const countAtom = {
  key: 'count_atom',
  defaultValue: 0
}


const style = {border: 'solid 1px #456', width: '200px', margin: '20px'}
//Com1.whyDidYouRender = true
function Com1() {
  const [count, setCount] = useMyRecoilState(countAtom)

  function handleChange(){
    setCount(count => count + 1)
  }

  return (
    <div style={style}>
      <h2>组件1</h2>
      <div>count: {count}</div>
      <div>count1: {count1}</div>
      <button onClick={handleChange}>点击更新 count ，看组件2、3会否更新</button>
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
```

组件 Com1 ，Com2，Com3 将会订阅 countAtom，当在 Com1 中改变 countAtom 的值，Com2 和 Com3 会收到变化通知，更新组件。如下我们点击组件 Com1 的按钮，更新 countAtom 的值，组件 Com2 、Com3 也会收到通知触发 re-render：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a9dd17051c64fa3838972af62428e3c~tplv-k3u1fbpfcp-watermark.image)

现在我们再来解释 my-recoil 的原理。

首先，定义一个 MyRecoilRoot 根组件，使用 context 把子组件包起来，在这里我们把 store 定义在 context 上，并且定义一个 useStoreRef ：

```js
export const useStoreRef = () => useContext(storeContext)
```

这样子组件就可以使用 useStoreRef 来获取 store 了。每当我们在一个组件里面使用 useMyRecoilValue(someAtom) ，就会使用 useState 定义一个空的 state, 并返回一个 forceUpdate，只要调用 forceUpdate，就会触发更新，重新获取 store 中的 someAtom 的值， 订阅触发更新事件的逻辑由 subRecoilState 来定义，subRecoilState 会在 store 上定义一个 `nodeToComponentSubscriptions`，把每次调用 ` useMyRecoilValue(someAtom) `时生成的 forceUpdate 放在 `nodeToComponentSubscriptions` 上面，等到调用 `useMySetRecoilState(someAtom)` 来设置 someAtom 的值的时候，就会调用 Batcher 的 `setState([])`，Batcher 被触发更新，于是里面的 useEffect 会执行下面这段代码：

```js
useEffect(() => {
      // 广播更新事件
      storeState.current.nodeToComponentSubscriptions.forEach((cb) => {
        cb()
      })
    })
```
把 nodeToComponentSubscriptions 中的 forceUpdate 取出来执行，也就是触发 useMyRecoilValue(someAtom) 更新，获取新的 state，从而触发组件更新。这样就实现了组件订阅 store state。

### 按需更新

以上是订阅当个 state 的情况。如果多个组件订阅多个 state，比如说，有两个组件 A 和 B，分别订阅 stateA 和 stateB，那么根据以上的更新事件广播机制，当我们在组件 A 中更新了 stateA，会无差别的将更新事件广播给 A 和 B，导致两个组件都更新，然而 B 是不需要更新的。

为了解决这种情况，可以在订阅事件增加一个 key，把更新事件根据所订阅的 state 归类，于是只有更新 stateA 的时候，订阅 stateB 的组件就不会收到更新通知了。根据这个思路来重构一下 my-recoil：
```js
// my-recoil

import React,{ useEffect, useState, useRef, useContext } from 'react';

const nodes = new Map()
const subNodes = new Map()
let subID = 0

class Node{
  constructor(k, v){
    this.key = k
    this.value = v
  }
  getValue(){
    return this.value 
  }
  setValue(newV) {
    this.value = newV
  }
}

export function useMySetRecoilState(atom) {
  const { key, defaultValue } = atom
  let node
  const store = useStoreRef().current
  const hasNode = store.atomValues.has(key)
  if (hasNode) {
    node = store.atomValues.get(key)
  } else {
    const newNode = new Node(key, defaultValue)
    store.atomValues.set(key, newNode)
    node = store.atomValues.get(key)
  }

  const setState = (newValueOrUpdater) => {
    let newValue
    if (typeof newValueOrUpdater === 'function') {
      newValue = newValueOrUpdater(node.getValue())
    }
    node.setValue(newValue)
    store.atomValues.set(key, node)
    store.replaceState(key)
  }

  return setState
}

function subRecoilState(store, atomkey, subid, cb) {
  if(!store.nodeToComponentSubscriptions.has(atomkey)) {
    store.nodeToComponentSubscriptions.set(atomkey, new Map())
  }
  if(!store.nodeToComponentSubscriptions.get(atomkey).has(subid)){
    store.nodeToComponentSubscriptions.get(atomkey).set(subid, cb)
  }
}

export function useMyRecoilValue(atom) {
  const [_, forceUpdate] = useState([])
  const { key, defaultValue } = atom
  const storeRef = useStoreRef()
  const store = storeRef.current
  let hasNode = store.atomValues.has(key)
  let node
  if (!hasNode) {
    node = new Node(key, defaultValue)
    store.atomValues.set(key, node)
  }
  node = store.atomValues.get(key)

  useEffect(() => {
    subRecoilState(store, key, subID++, () =>{
      forceUpdate([])
    })
  }, [key, node, store, storeRef])
  
  return node.getValue()
}

export function useMyRecoilState(atom) {
  return [useMyRecoilValue(atom), useMySetRecoilState(atom)]
}

const storeContext = React.createContext()
export const useStoreRef = () => useContext(storeContext)

export default function MyRecoilRoot({children}) {
  const notifyUpdate = useRef()
  function setNotify(x) {
    notifyUpdate.current = x
  }
  function Batcher({setNotify}) {
    const [_, setState] = useState([])
    setNotify(() => setState([]))

    useEffect(() => {
      // 广播更新事件
      const { updateAtomKey } = storeState.current
      storeState.current.nodeToComponentSubscriptions.has(updateAtomKey) &&
      storeState.current.nodeToComponentSubscriptions.get(updateAtomKey).forEach((cb) => {
        cb()
      })
    })
    return null
  }
  function replaceState(key) {
    notifyUpdate.current()
    storeState.current.updateAtomKey = key
  }
  const storeState = useRef({
    atomValues: nodes,
    replaceState,
    nodeToComponentSubscriptions: subNodes,
    updateAtomKey: null
  })

  return <div>
    <storeContext.Provider value={storeState}>
      <Batcher setNotify={setNotify}/>
      {children}
    </storeContext.Provider>
  </div>
}


```

可以知道，我们在 store 增加了一个  updateAtomKey, 当调用 useResoilSetState 来 set 的时候，会把所要 set 的 atom 的 key 赋值给 updateAtomKey，然后广播更新事件的时候，根据这个 updateAtomKey，获取并执行触发更新的回调，最后实现按需更新。代码里面订阅 subRecoilState 和广播更新事件的逻辑为是这样的：

subRecoilState:

```js
function subRecoilState(store, atomkey, subid, cb) {
  if(!store.nodeToComponentSubscriptions.has(atomkey)) {
    store.nodeToComponentSubscriptions.set(atomkey, new Map())
  }
  if(!store.nodeToComponentSubscriptions.get(atomkey).has(subid)){
    store.nodeToComponentSubscriptions.get(atomkey).set(subid, cb)
  }
}
```

Batcher:

```js
function Batcher({setNotify}) {
    const [_, setState] = useState([])
    setNotify(() => setState([]))

    useEffect(() => {
      // 广播更新事件
      const { updateAtomKey } = storeState.current
      storeState.current.nodeToComponentSubscriptions.has(updateAtomKey) &&
      storeState.current.nodeToComponentSubscriptions.get(updateAtomKey).forEach((cb) => {
        cb()
      })
    })
    return null
  }
```

现在我们来演示一下，在 Com1 中增加了 count1 这个 state，现在 Com1 、Com2、Com3 都订阅了 count，Com1 订阅了 coun1，Com2 和 Com3 没有订阅 count1。我们在 Com1 中修改 count，组件 Com1、 Com2 和 Com3 都会更新；而在 Com1 中修改 count1 ，只有 Com1 更新，Com2 和 Com3 不会更新。

这就是 Recoil 中实现订阅和共享状态的大致逻辑。