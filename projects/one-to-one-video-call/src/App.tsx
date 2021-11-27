import React from 'react';

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
