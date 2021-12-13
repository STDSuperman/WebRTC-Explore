import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { init } from './torrent-render';

// init();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
