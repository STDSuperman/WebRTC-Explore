import { logger } from '@codesuperman/logger'
import { CACHE_NAME, staticPrefix, localForageStorageKey } from './utils/constants'
import localforage from 'localforage';
import { WorkerEventType, LOCAL_TORRENT_FILE_KEYS, STATIC_PREFIX } from '@/utils/constants';
import mitt from 'mitt'

// eslint-disable-next-line
declare const self: ServiceWorkerGlobalScope;

// 全局事件触发器
const emitter = mitt()
const blobURLEventPrefix = 'getBlobURL-';
// 全局调度任务池
let globalReqPool = [];
// 并发数
const concurrentReqLimit = -1; // -1 表示不限制
// 当前正在运行的调度任务
let inProgressTaskNum = 0;


// 注册全局监听事件
const listenPage2Worker = (event) => {
  emitter.emit(event.data?.type, event.data)
}
self.removeEventListener('message', listenPage2Worker);
self.addEventListener('message', listenPage2Worker);


const clearCache = async (cacheName: string) => {
  const keys = await caches.keys();
  keys.forEach(key => {
    if (key !== cacheName) {
      caches.delete(key);
    }
  })
}

self.addEventListener('install', async event => {
  logger.info('installing!')
  await self.skipWaiting();
})

self.addEventListener('activate', async event => {
  await clearCache(CACHE_NAME);
  await self.clients.claim();
  logger.info('activated!')
})

self.addEventListener('fetch', async function (event) {
  const request = event.request;
  const scope = self.registration.scope;
  const url = request.url;
  const fetchPath = url.slice(scope?.length ?? 0);

  logger.log(`Fetch request for: ${fetchPath}`);
  if (!fetchPath) {
    logger.log('enter fetchPath')
    event.respondWith(self.fetch('/index.html'));
  } else if (fetchPath === 'intercept/status') {
    event.respondWith(new Response('', { status: 234, statusText: 'intercepting' }))
  } else {
    // event.respondWith(dbResHandler(fetchPath, event))
    // event.respondWith(handleFetch(fetchPath, event))
    event.respondWith(renderFromGlobalCache(fetchPath, event))
  }
})

// 读 blobUrl 形式返回请求
async function handleFetch(fetchUrl: string, event): Promise<Response> {
  const filepath2BlobUrlObj = await localforage.getItem(localForageStorageKey);
  console.log(filepath2BlobUrlObj)
  const currentFileBlob: string = filepath2BlobUrlObj[`${staticPrefix}/${fetchUrl}`]
  // logger.info(`current storage cache keys: ${await localforage.keys()}`);
  logger.info(`current request blobUrl: ${currentFileBlob}`, `${staticPrefix}/${fetchUrl}`)

  if (!currentFileBlob) {
    console.log(event.request)
    return fetch(event.request)
  }
  const res = await fetch(currentFileBlob);
  return res;
}

// 读 DB 形式返回请求
async function dbResHandler(fetchPath: string, event): Promise<Response> {
  const cacheDB = await caches.open(CACHE_NAME);
  return cacheDB.match(`${STATIC_PREFIX}/${fetchPath}`)
    .then(function (cache) {
        return cache || fetch(event.request);
    }).catch(function (err) {
        console.log(err);
        return fetch(event.request);
    })
}

// 与浏览器事件交互获取 blobUrl 返回请求
async function renderFromGlobalCache(fetchPath: string, event): Promise<Response> {
  const transformedFetchPath = `${STATIC_PREFIX}/${fetchPath}`
  if (await checkIsTorrentFileFetch(transformedFetchPath)) {
    const blobUrl: string = await fetchTorrentFile(transformedFetchPath, event.clientId) || "";
    return fetch(blobUrl);
  }
  return fetch(event.request);
}

// 检测当前请求是否是种子中包含的文件请求
async function checkIsTorrentFileFetch(fetchPath: string): Promise<boolean> {
  const torrentFilesKeysObj = await localforage.getItem(LOCAL_TORRENT_FILE_KEYS) || {};
  return torrentFilesKeysObj[fetchPath];
}


// 抓取种子中包含的文件数据
const fetchTorrentFile = (
  transformedFetchPath: string,
  pageClientId: string
): Promise<string> => {
  return new Promise((resolve) => {
    const getBlobUrlFc = async () => {
      if (!(await checkPageClientIsExist(pageClientId))) {
        resolve('');
      }
      const blobUrl = await getBlobUrlFromPage(transformedFetchPath);
      inProgressTaskNum--;
      scheduleNext();
      resolve(blobUrl);
    }
    globalReqPool.push(getBlobUrlFc);
    scheduleNext();
  })
}

// 检测页面是否还存活（是否关闭 tab 或者刷新）
const checkPageClientIsExist = async (pageClientId: string) => {
  const currentClientList = await self.clients.matchAll();
  const targetClient = currentClientList.find(item => item.id === pageClientId);
  // @ts-ignore
  const isVisible = targetClient?.visibilityState === 'visible';
  if (!isVisible) {
    logger.info('清空任务队列')
    globalReqPool = [];
  }
  return !!targetClient;
}

// 调度下一个任务
const scheduleNext = async () => {
  if (
    globalReqPool.length > 0
    && (
      (concurrentReqLimit === -1)
      ||
      (inProgressTaskNum < concurrentReqLimit)
    )
  ) {
    const task = globalReqPool.shift();
    task();
    inProgressTaskNum++;
  }
}

// 与浏览器页面通信，请求获取 blobUrl
const getBlobUrlFromPage = (transformedFetchPath: string): Promise<string> => {
  return new Promise((resolve) => {
    const realFetchFilePath = transformedFetchPath;
    const currentEventType = `${blobURLEventPrefix}${realFetchFilePath}`;

    emitter.off(currentEventType);
    emitter.on(currentEventType, (data: any) => {
      if (data.eventType === WorkerEventType.GET_BLOB_URL) {
        resolve(data.blobUrl);
      } else if (data.eventType === WorkerEventType.CHECK_IS_EXIST) {
        logger.log(`${transformedFetchPath} is not exist in global cache.`)
        if (!data.isExist) resolve('');
      }
    })

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: currentEventType,
          fetchPath: realFetchFilePath
        })
      })
    })
  })
}