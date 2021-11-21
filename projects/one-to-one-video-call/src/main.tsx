import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { renderRoutes } from 'react-router-config'
import { routes } from './router'
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    {renderRoutes(routes)}
  </BrowserRouter>,
  document.getElementById('root')
)
