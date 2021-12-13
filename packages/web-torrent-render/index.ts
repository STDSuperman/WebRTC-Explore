import WebTorrent from "webtorrent-hybrid";
import createTorrent from 'create-torrent';
import parseTorrent from 'parse-torrent';
import fs from 'fs';

const client = new WebTorrent();
const targetTorrentDir = './dist'
const outputTorrent = './dist.torrent'

// 创建 torrent 文件
const createTorrentFile = () => {
  createTorrent(targetTorrentDir, {
    name: 'dist'
  }, (err, torrent) => {
    if (err) throw err;
    fs.writeFileSync(outputTorrent, torrent);
  });
}

const otherAnnounce = [
  "udp://explodie.org:6969",
  "udp://tracker.coppersurfer.tk:6969",
  "udp://tracker.empire-js.us:1337",
  "udp://tracker.leechers-paradise.org:6969",
  "udp://tracker.opentrackr.org:1337",
  "wss://tracker.btorrent.xyz",
  "wss://tracker.fastcast.nz",
  "wss://tracker.openwebtorrent.com"
]

const myAnnounce = [
  "http://localhost:8000/announce",
  "udp://0.0.0.0:8000",
  "udp://localhost:8000",
  "ws://localhost:8000"
]

const opts = {
  announce: myAnnounce,
}

client.seed('./dist/index.html', opts, torrent => {
  console.log(torrent, torrent.magnetURI);
})