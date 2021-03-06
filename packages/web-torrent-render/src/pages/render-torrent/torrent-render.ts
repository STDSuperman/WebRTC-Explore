import WebTorrent from 'webtorrent/webtorrent.min.js';
import { localForageStorageKey, INDEX_HTML_NAME, CACHE_NAME } from '../../utils/constants';
import magnet from 'magnet-uri'
import localforage from 'localforage';
import { logger } from '@codesuperman/logger'
import { cacheInstance } from '@/utils/cache';
import { promisifyFileGetBlob } from '@/utils'
import { WorkerEventType, LOCAL_TORRENT_FILE_KEYS } from '@/utils/constants';
import { maxWebConns } from '@/utils/config';

// const logger = console;

export type ICustomRender = (doc: string) => void;

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

export const render = (magnetURI: string, customRender?: ICustomRender) => {
  return new Promise((resolve) => {
    // const magnetURI = TORRENT_PREFIX + torrentHash;
    logger.info(`Start Downloading torrent ${magnetURI}...`);

    // const magnetURI = 'magnet:?xt=urn:btih:b9e3f453438d93fbe0a514c0b2723fce9d3490ff&dn=index.html&tr=http%3A%2F%2Flocalhost%3A8000%2Fannounce&tr=udp%3A%2F%2F0.0.0.0%3A8000&tr=udp%3A%2F%2Flocalhost%3A8000&tr=ws%3A%2F%2Flocalhost%3A8000'
    // const magnetURI = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
    const parsedTorrent = magnet(magnetURI);

    const client = new WebTorrent();
    const torrentInstance = client.add(magnetURI, {
      path: './',
      maxWebConns
    }, (torrent) => {
      renderTorrent(torrent, customRender);
    });

    resolve(torrentInstance);

    // addTorrentEvents(torrentInstance)
    console.log(torrentInstance)

    // const client1 = new Tracker({
    //   infoHash: parsedTorrent.infoHash,
    //   announce: parsedTorrent.announce,
    //   peerId: new Buffer('01234567890123456789'),
    //   port: 6881
    // });

    // client1.on('scrape', function (data) {
    //   console.log(data)
    // })
    // client1.scrape();
  })
}

/**
 * 渲染种子文件
 * @param torrentInfo
 */
const renderTorrent = async (
  torrentInfo: WebTorrent.Torrent,
  customRender: ICustomRender
) => {
  console.log(torrentInfo);
  logger.info(`Torrent Downloaded! TorrentInfo: ${torrentInfo}`);

  // 清理缓存
  await localforage.clear();

  // await saveTorrentSourceSync(torrentInfo);
  await saveTorrentFileContext(torrentInfo);

  // 初始化与 sw 通信事件
  bindListenEvents();

  await renderEntryHtml(torrentInfo, customRender);
}

/**
 * 阻塞等待所有依赖资源下载完再渲染
 * @param torrentInfo
 */
const saveTorrentSourceSync = async (torrentInfo: WebTorrent.Torrent) => {
  const files = torrentInfo.files;
  let index = files.length;
  logger.info(`file length: ${index}`);
  const tempCacheObj = {};

  while (index-- > 0) {
    const file = files[index];
    if (file.name === INDEX_HTML_NAME) continue;
    logger.info(`current handle file: ${file.name}`);
    try {
      const fileGlobUrl = await promisifySetTorrentResponse(file);
      tempCacheObj[file.path] = fileGlobUrl;
      logger.info(`handler ${file.name} is complete`)
    } catch (error) {
      logger.error(`handle  ${file.name} error: ${error}`);
    }
  }
  // 存入缓存
  await localforage.setItem(localForageStorageKey, tempCacheObj);
  logger.info(`blobUrl 存入缓存完毕`)
}

/**
 * 仅存储文件句柄
 * @param torrentInfo
 */
const saveTorrentFileContext = async (torrentInfo: WebTorrent.torrentInfo) => {
  const files = torrentInfo.files;
  let index = files.length;
  logger.info(`file length: ${index}`);
  const globalCacheObj = {};
  const localFileKeyObj = {};

  while (index-- > 0) {
    const file = files[index];
    if (file.name === INDEX_HTML_NAME) continue;
    logger.info(`current handle file: ${file.name}`);
    try {
      globalCacheObj[file.path] = file;
      localFileKeyObj[file.path] = true;
      logger.info(`handler ${file.name} is complete`)
    } catch (error) {
      logger.error(`handle  ${file.name} error: ${error}`);
    }
  }
  // 存入全局缓存
  cacheInstance.set('globalTorrentFilesCache', globalCacheObj);
  localforage.setItem(LOCAL_TORRENT_FILE_KEYS, localFileKeyObj);
  logger.info(`blobUrl 存入运行时缓存完毕`)
}

/**
 * 渲染入口文件
 * @param torrentInfo
 */
const renderEntryHtml = (
  torrentInfo: WebTorrent.TorrentFile,
  customRender: ICustomRender
) => {
  const indexHtmlFile = torrentInfo.files.find(file => {
    return file.name === INDEX_HTML_NAME
  });
  if (!indexHtmlFile) {
    logger.error(`can't found index.html`)
  } else {
    logger.log(`入口文件： ${indexHtmlFile?.name}`)
    indexHtmlFile?.getBuffer((err, buffer) => {
      if (err) {
        logger.error(err);
        return;
      }
      logger.log(`index.html: ${buffer.toString()}`)
      if (customRender) {
        customRender(buffer.toString());
      } else {
        document.body.innerHTML = buffer.toString();
      }
    })
  }
}

const promisifySetTorrentResponse = async (file: WebTorrent.TorrentFile) => {
  return new Promise((resolve, reject) => {
    file.getBlobURL(async (e: Error, blobUrl: string) => {
      if (e) {
        logger.error(`获取 fileGlobUrl 异常：` + (e?.message ?? `未知异常)`));
        reject(e);
        return null;
      }
      logger.info(`Add ${file.path} to cache.`);
      resolve(blobUrl);

      // const checkStatus = await checkBlobUrlFetch(blobUrl, file.path);
      // if (!checkStatus) reject(new Error(`${file.path} blobUrl 读取失败`));
      // db.add(blobUrl)
      //   .then((data) => {
      //     console.log(data);
      //     resolve(data)
      //   })
      //   .catch(e => reject(e));
    });
  })
}

const bindListenEvents = () => {
  logger.info("绑定 page listener")
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', async (event) => {
      const globalTorrentFilesCache = cacheInstance.get('globalTorrentFilesCache') || {};
      const fetchPath = event.data.fetchPath;
      const file = globalTorrentFilesCache[fetchPath];
      if (!file) {
        // 通知 worker 当前请求缓存中不存在
        self.navigator.serviceWorker.controller.postMessage({
          type: event.data.type,
          eventType: WorkerEventType.CHECK_IS_EXIST,
          isExist: false
        })
      }
      const blobUrl = await promisifyFileGetBlob(file);
      // 通知 worker 当前请求文件的 blobUrl
      self.navigator.serviceWorker.controller.postMessage({
        type: event.data.type,
        eventType: WorkerEventType.GET_BLOB_URL,
        blobUrl
      })
    });
  }
}

export const checkBlobUrlFetch = async (blobUrl: string, reqPath: string) => {
  const cacheDB = await caches.open(CACHE_NAME);
  const res = await self.fetch(blobUrl)
  cacheDB.put(reqPath, res.clone());
  return res.status === 200
}

export const init = async () => {
  return new Promise((resolve, reject) => {
    if (window.navigator.serviceWorker) {
      window.navigator.serviceWorker.register('./renderer-worker.js')
        .then(() => {
          verifyRouter((err) => {
            if (err) {
              reject(err.message)
            } else {
              resolve(true)
            }
          });
        })
        .catch((e) => {
          const hintText = `Register service worker failed!`
          logger.error(hintText, e.message)
          reject(hintText)
        });
    } else {
      const hintText = `Current environment does not support service worker!`
      logger.error(hintText)
      reject(hintText)
    }
  })
}

function verifyRouter (cb) {
  var request = new window.XMLHttpRequest()
  request.addEventListener('load', function verifyRouterOnLoad () {
    if (this.status !== 234 || this.statusText !== 'intercepting') {
      cb(new Error('Service Worker not intercepting http requests, perhaps not properly registered?'))
    }
    cb()
  })
  request.open('GET', './intercept/status')
  request.send()
}
