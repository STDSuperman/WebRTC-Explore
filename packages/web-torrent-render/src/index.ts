import WebTorrent from 'webtorrent/webtorrent.min.js';
import { TORRENT_PREFIX, INDEX_HTML_NAME, CACHE_NAME } from './utils/constants';
import { logger } from '@codesuperman/logger'
import Tracker from 'bittorrent-tracker';
import magnet from 'magnet-uri'

function addTorrentEvents(torrent: WebTorrent) {
  torrent.on('warning', (err: Error) =>
      console.log('warning: ', err.message))
  torrent.on('error', (err: Error) =>
      console.log('error: ', err.message))
  torrent.on('infoHash', () =>
      console.log('infohash: ', torrent.infoHash))
  torrent.on('metadata', torrentMetadata)
  torrent.on('ready', torrentReady)
  torrent.on('done', torrentDone)
  torrent.on('download', function (bytes) {
    console.log('just downloaded: ' + bytes)
    console.log('total downloaded: ' + torrent.downloaded)
    console.log('download speed: ' + torrent.downloadSpeed)
    console.log('progress: ' + torrent.progress)
  })

  function torrentMetadata () {
      console.log('metadata received')
  }

  function torrentReady () {
      console.log('Torrent ready to download')
  }

  function torrentDone () {
      console.log('Torrent downloaded')
  }
}

export const render = (torrentHash: string) => {
  const torrent = TORRENT_PREFIX + torrentHash;
  logger.info(`Start Downloading torrent ${torrent}...`);

  const magnetURI = 'magnet:?xt=urn:btih:23aeb132a692c6a43387d79b966612f9ac79ed5e&dn=dist&tr=http%3A%2F%2Flocalhost%3A8000%2Fannounce&tr=udp%3A%2F%2F0.0.0.0%3A8000&tr=udp%3A%2F%2Flocalhost%3A8000&tr=ws%3A%2F%2Flocalhost%3A8000'
  const parsedTorrent = magnet(magnetURI);

  console.log(parsedTorrent);
  const client = new WebTorrent();
  const torrentInstance = client.add(magnetURI, function (torrent) {
    console.log(torrent);
  });

  addTorrentEvents(torrentInstance)

  const client1 = new Tracker({
    infoHash: parsedTorrent.infoHash,
    announce: parsedTorrent.announce,
    peerId: new Buffer('01234567890123456789'),
    port: 6881
  });

  client1.scrape();
  client1.on('scrape', function (data) {
    console.log(data)
  })
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

window.p2p = {
  render,
  init
}

const start = () => {
  init().then(() => {
    render('23aeb132a692c6a43387d79b966612f9ac79ed5e&dn=dist&tr=http%3A%2F%2Flocalhost%3A8000%2Fannounce&tr=udp%3A%2F%2F0.0.0.0%3A8000&tr=udp%3A%2F%2Flocalhost%3A8000&tr=ws%3A%2F%2Flocalhost%3A8000');
  })
}

start()