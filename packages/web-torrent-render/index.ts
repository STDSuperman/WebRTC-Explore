import WebTorrent from "webtorrent";

const client = new WebTorrent();

const opts = {
  announce: [
    'http://localhost:8000/announce',
    'udp://0.0.0.0:8000',
    'udp://localhost:8000',
    'ws://localhost:8000'
  ],
}

client.seed('./dist' , torrent => {
  console.log(torrent, torrent.magnetURI);
})