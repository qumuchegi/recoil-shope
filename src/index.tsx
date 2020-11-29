import React from 'react';
import ReactDOM from 'react-dom';
import Shope from './shope'
import reportWebVitals from './reportWebVitals';
import MyRecoil from './my-recoil/index'
import whyDidYouRender from '@welldone-software/why-did-you-render'

ReactDOM.render(
  <React.StrictMode>
    <MyRecoil/>
    {/* <Shope /> */}
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
// whyDidYouRender(React);