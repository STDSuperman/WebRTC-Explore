import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { init } from './pages/render-torrent/torrent-render';
import { HashRouter } from 'react-router-dom'
import 'antd/dist/antd.css';

// init();

ReactDOM.render(
  <HashRouter>
    <App></App>
  </HashRouter>,
  document.getElementById('root')
)
