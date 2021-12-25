
import { useState } from 'react'
import { render, init } from './torrent-render';

const defaultMagnetURL = 'magnet:?xt=urn:btih:f537afe28647f397760237be9d5d595ce914287d&dn=dist&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com';

export default function () {
  const [torrentMagnetURL, setTorrentMagnetURL] = useState(defaultMagnetURL);
  return (
    <>
      <input
        defaultValue={defaultMagnetURL}
        type="text"
        onChange={e => setTorrentMagnetURL(e.target.value)}
      ></input>
      <button type="button" onClick={() => render(torrentMagnetURL)}>开始抓取</button>
      <button type="button" onClick={() => init()}>测试拦截</button>
    </>
  )
}