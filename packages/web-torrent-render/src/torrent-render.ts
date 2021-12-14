import WebTorrent from 'webtorrent/webtorrent.min.js';
import { TORRENT_PREFIX, INDEX_HTML_NAME, CACHE_NAME } from './utils/constants';
import Tracker from 'bittorrent-tracker';
import magnet from 'magnet-uri'

const logger = console;

console.log(`WebRTC Support: ${WebTorrent.WEBRTC_SUPPORT}`);

function addTorrentEvents(torrent: WebTorrent) {
  logger.log('bind torrent listener')
  torrent.on('warning', (err: Error) =>
      logger.log('warning: ', err.message))
  torrent.on('error', (err: Error) =>
      logger.log('error: ', err.message))
  torrent.on('infoHash', () =>
      logger.log('infohash: ', torrent.infoHash))
  torrent.on('metadata', torrentMetadata)
  torrent.on('ready', torrentReady)
  torrent.on('done', torrentDone)
  torrent.on('download', function (bytes) {
    logger.log('just downloaded: ' + bytes)
    logger.log('total downloaded: ' + torrent.downloaded)
    logger.log('download speed: ' + torrent.downloadSpeed)
    logger.log('progress: ' + torrent.progress)
  })

  function torrentMetadata () {
      logger.log('metadata received')
  }

  function torrentReady () {
      logger.log('Torrent ready to download')
  }

  function torrentDone () {
      logger.log('Torrent downloaded')
  }
}

export const render = (magnetURI: string) => {
  // const magnetURI = TORRENT_PREFIX + torrentHash;
  logger.info(`Start Downloading torrent ${magnetURI}...`);

  // const magnetURI = 'magnet:?xt=urn:btih:b9e3f453438d93fbe0a514c0b2723fce9d3490ff&dn=index.html&tr=http%3A%2F%2Flocalhost%3A8000%2Fannounce&tr=udp%3A%2F%2F0.0.0.0%3A8000&tr=udp%3A%2F%2Flocalhost%3A8000&tr=ws%3A%2F%2Flocalhost%3A8000'
  // const magnetURI = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
  const parsedTorrent = magnet(magnetURI);

  console.log(parsedTorrent);
  const client = new WebTorrent();
  const torrentInstance = client.add(magnetURI, {
    path: './'
  }, renderTorrent);

  addTorrentEvents(torrentInstance)

  const client1 = new Tracker({
    infoHash: parsedTorrent.infoHash,
    announce: parsedTorrent.announce,
    peerId: new Buffer('01234567890123456789'),
    port: 6881
  });

  client1.on('scrape', function (data) {
    console.log(data)
  })
  client1.scrape();
}

const renderTorrent = async (torrentInfo: WebTorrent.Torrent) => {
  console.log(torrentInfo);
  logger.info(`Torrent Downloaded! TorrentInfo: ${torrentInfo}`);
  const files = torrentInfo.files;
  const cacheDB = await caches.open(CACHE_NAME);
  const indexHtmlFile = torrentInfo.files.find(file => {
    return file.path === INDEX_HTML_NAME
  });
  let index = files.length;
  while (index-- > 0) {
    const file = files[index];
    await promisifySetTorrentResponse(file, cacheDB);
  }

  indexHtmlFile.getBuffer((err, buffer) => {
    if (err) {
      logger.error(err);
      return;
    }
    document.body.innerHTML = buffer.toString();
  })
}

const promisifySetTorrentResponse = async (file: WebTorrent.TorrentFile, db: Cache) => {
  return new Promise((resolve, reject) => {
    file.getBlobURL((e: Error, blobUrl: string) => {
      if (e) {
        logger.error(`获取 fileGlobUrl 异常：` + (e?.message ?? `未知异常)`));
        return null;
      }
      logger.info(`Add ${file.path} to cache.`)
      db.add(blobUrl)
        .then((data) => resolve(data))
        .catch(e => reject(e));
    });
  })
}

export const init = async () => {
  if (window.navigator.serviceWorker) {
    window.navigator.serviceWorker.register('./worker.js')
      .then(() => {
        fetch('/intercept/status').then(res => {
          if (res.ok) {
            logger.info(`Intercept OK!`)
          } else {
            logger.error(`Intercept failed!`)
          }
        })
      })
      .catch((e) => {
        logger.error(`Register service worker failed!`, e.message)
      });
  } else {
    logger.error(`Current environment does not support service worker!`)
  }
}