状态管理方案：

1. context+useReducer
2. Redux
3. Mobx
4. Recoil（Facebook 内部项目，承诺将支持 React 的并发能力

网上各种

1. concent
2. Unstated next

### 状态管理框架因何存在

1. 缓存数据，比如应用状态、远程数据
2. 减少数据请求的次数，一次请求后多个组件可以共享
3. 管理应用的数据流，

状态管理框架存在的一个目的就是在多个组件中方便地共享一个 state 的编辑和读取，并且在组件之间同步这些操作后的结果，同时为了提高性能，要避免状态在嵌套的组件中层层传递，让只需要 state 的组件能看到 state，不需要 state 的组件感知不到 state。

### 几种状态管理方案

#### 1. React 的 Context：

首先来看 React 自身专门为解决这种情况提供的 API ，

下面是可以在嵌套组件中更新 context 的例子，有一个父组件`Father`，使用 `Context.Provider` 包裹子组件：

```js
import React, {createContext} from 'react'
import Child1 from './child1'
import Child2 from './child2'

export const Context = createContext()

export default class Father extends React.Component {
  constructor(props){
    super(props)
    this.setA = (a) => {
      this.setState({a}) // 调用 setState 以更新组件状态
    }
    this.state = {
      a: 0, // 要共享的值
      setA: this.setA // 修改值的方法
    }
  }

  render() {
    // context 值取自组件 state 里面，是为了在更新 context 值时更新组件，如果不放在 state，那么 context 更新了并不会使组件更新
    return <Context.Provider value={this.state}>
      <Child1/>
      <Child2/>
    </Context.Provider>
  }
}
```

`Father`的两个子组件`Child1`、`Child2`，子组件被 `Context.Consumer`包裹，以获取 `Context.Provider` 提供的 context 值，`Context.Consumer` 中用 render props 的方法，接收最近的 `Context.Provider` 的 context 值，并返回一个 React 节点。：

```js
import React from 'react'
import {Context} from './Father'

class Child1 extends React.Component {
  render() {
    const {a, setA} = this.props
    return<div style={{backgroundColor: '#897', padding: '29px'}}>
      子组件1
      <div>a：{a}</div>
      <input placeholder='输入' onChange={(e) => setA(e.target.value)}></input>
    </div>
  }
}

export default () => <Context.Consumer>{
  (context) => <Child1 {...context}/>
}</Context.Consumer>
```

```js
import React from 'react'
import {Context} from './Father'

class Child2 extends React.Component {
  render() {
    const {a} = this.props
    return <div style={{backgroundColor: 'green', padding: '29px'}}>
     子组件 2
     <div>a：{a}</div>
    </div>
  }
}

export default () => <Context.Consumer>{
  (context) => <Child2 {...context}/>
}</Context.Consumer>

```

要让组件响应 context 的更新而更新，我们只能将 context 的值用 state 来保存，这样当调用 setState 更新 context 的时候就能更新组件了，如果不用 setState 而只是直接更新 context 是不会更新组件的。

#### 2. Redux

在 Redux 中使用一个 store 单一数据源管理全局状态，所有 state 都存在这个 store 里面，组件只要使用 `store.subscribe(listener)`订阅 store，当 state 变化的时候就会自动执行 listener 方法，在这个方法里面我们可以使用 `store.getState()`方法获取需要的 state。引入 React-redux 可以避免手动调用 `store.subscribe(listener)`和 `store.getState()`来订阅 state ，React-redux 提供 `connect（mapStateToProps，mapDispatchToprops,mergeProps,optopns)`,其中 `mapStateToProps`就可以把 state 同步给被 `connect`包裹的组件，每当 state 更新，就会更新组件。

在 Redux 中如果做异步请求，我们需要另引入 redux-thunk、redux-saga 这样的库，另外考虑到性能，为了较少 state 衍生数据的重复计算，我们还需要引入 reselector 这样的库。

如果使用 Recoil 这些它都可以提供给我们。

#### 3. 使用 Recoil

Recoil 的优点：

1. 不用像 Redux 中要引入 reselect 缓存 state 派生数据的计算结果

   原因：因为 Recoil 提供的 selector 本身就具有相同的缓存功能。Redux 中所有 state 都将存在一个 store ，store 是一个深度嵌套的对象，如果我们需要获取其中底层的一个 state，就必须一层一层地获取：

   ```js
   import { createSelector } from 'reselect'
   
   const mapStateToProps = (state) => ({
     state3: createSelector(
     	state => state.state1,
       state1 => state1.state2,
       state2 => state2.state3
     )
   })
     
   ```

   

   

2. 



