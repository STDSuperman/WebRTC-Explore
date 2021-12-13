import { useState } from 'react'
import './App.css'
import { render } from './torrent-render';

const defaultMagnetURL = 'magnet:?xt=urn:btih:3497c7f71e8542258d7e81cd428e08e16888dfd8&dn=dist&tr=http%3A%2F%2Flocalhost%3A8000%2Fannounce&tr=udp%3A%2F%2F0.0.0.0%3A8000&tr=udp%3A%2F%2Flocalhost%3A8000&tr=ws%3A%2F%2Flocalhost%3A8000';

function App() {
  const [torrentMagnetURL, setTorrentMagnetURL] = useState(defaultMagnetURL);
  return (
    <div className="App">
      <input
        defaultValue={defaultMagnetURL}
        type="text"
        onChange={e => setTorrentMagnetURL(e.target.value)}
      ></input>
      <button type="button" onClick={() => render(torrentMagnetURL)}>开始抓取</button>
    </div>
  )
}

export default App
