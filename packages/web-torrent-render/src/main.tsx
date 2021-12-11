import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { init, render } from './index';

console.log(init, render)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
