import React from 'react';
import './App.css'

interface IProps {
  children?: any
}

function App(props: IProps) {
  return (
    <div className="App">
      {props.children}
    </div>
  )
}

export default App
