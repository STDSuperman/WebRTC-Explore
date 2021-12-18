import './App.css'
import { Route, Routes } from 'react-router-dom'
import SeedPage from './pages/seed-files'
import TorrentRender from './pages/render-torrent'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/seed' element={ <SeedPage /> }></Route>
        <Route path="/" element={ <TorrentRender /> }></Route>
      </Routes>
    </div>
  )
}

export default App
