import { useState } from 'react'
import './App.css'
import { render } from './torrent-render';

function App() {
  const [torrentMagnetURL, setTorrentMagnetURL] = useState('');
  return (
    <div className="App">
      <input type="text" onChange={e => setTorrentMagnetURL(e.target.value)}></input>
      <button type="button" onClick={() => render(torrentMagnetURL)}>开始抓取</button>
    </div>
  )
}

export default App
