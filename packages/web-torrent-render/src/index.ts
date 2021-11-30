import WebTorrent from 'webtorrent/webtorrent.min.js';
import { TORRENT_PREFIX, INDEX_HTML_NAME, CACHE_NAME } from './utils/constants';
import { logger } from './utils/logger';

const client = new WebTorrent();

export const render = (torrentHash: string) => {
  const torrent = TORRENT_PREFIX + torrentHash;
  logger.info(`Start Downloading torrent ${torrent}...`);
  client.add(torrent, renderTorrent);
}


const renderTorrent = async (torrentInfo: WebTorrent.Torrent) => {
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

// @ts-ignore
window.p2p = {
  render,
  init
}

const start = () => {
  init().then(() => {
    render('b65ccbeca1391fe8c26b8baf0707a3672e5fadcd');
  })
}

start()