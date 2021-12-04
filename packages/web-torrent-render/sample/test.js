const parseTorrent = require('parse-torrent');
const webTorrent = require('webtorrent');
const createTorrent = require('create-torrent');
const fs = require('fs');

const client = new webTorrent();
const testUrl = 'magnet:?xt=urn:btih:255c11f775ddab6b516bb8d718e612d52893821c&dn=dist.torrent&tr=104&tr=116&tr=112&tr=58&tr=47&tr=108&tr=111&tr=99&tr=97&tr=115&tr=56&tr=48&tr=110&tr=117&tr=101&tr=100&tr=46&tr=119&tr=http%3A%2F%2Flocalhost%3A8000%2Fannounce';

client.seed('./dist', {
  announce: [
    'http://localhost:8000/announce'
  ],
  announceList: [
    'http://localhost:8000/announce',
    'udp://0.0.0.0:8000',
    'udp://localhost:8000',
    'ws://localhost:8000'
  ],
  onProgress(val) {
    console.log('progress', val);
  }
}, torrent => {
  console.log(torrent, torrent.magnetURI);
})

// client.add(testUrl, {
//   announce: [
//     'http://localhost:8000/announce'
//   ]
// }, (torrent) => {
//   console.log(torrent)
// })

// createTorrent('./dist', {
//   announceList: []
// }, (err, torrent) => {
//   if (!err) {
//     console.log(`write success: ${torrent}`)
//     fs.writeFileSync('dist.torrent', torrent)
//   }
// })