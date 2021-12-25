import { logger } from '@codesuperman/logger'
import { CACHE_NAME, staticPrefix, localForageStorageKey } from './utils/constants'
import localforage from 'localforage';
import { cacheInstance } from '@/utils/cache';
import { promisifyFileGetBlob } from '@/utils';
import mitt from 'mitt'

// eslint-disable-next-line
declare const self: ServiceWorkerGlobalScope;

const emitter = mitt()
const blobURLEventPrefix = 'getBlobURL-';


// 注册全局监听事件
const listenPage2Worker = (event) => {
  console.log("sw", event.data)
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

  console.log(`Fetch request for: ${fetchPath}`);
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
  return cacheDB.match(`dist/${fetchPath}`)
    .then(function (cache) {
        return cache || fetch(event.request);
    }).catch(function (err) {
        console.log(err);
        return fetch(event.request);
    })
}

// 与浏览器事件交互获取 blobUrl 返回请求
async function renderFromGlobalCache(fetchPath: string, event): Promise<Response> {
  const blobUrl: string = await getBlobUrlFromPage(fetchPath) || "";

  if (!blobUrl) {
    console.log(event.request)
    return fetch(event.request)
  }
  return fetch(blobUrl);
}

const getBlobUrlFromPage = (fetchPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const realFetchFilePath = `dist/${fetchPath}`;
    const currentEventType = `${blobURLEventPrefix}${realFetchFilePath}`;

    emitter.off(currentEventType);
    emitter.on(currentEventType, (data: any) => {
      resolve(data.blobUrl);
    })

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'getFileObject',
          fetchPath: realFetchFilePath,
          callbackEventType: currentEventType
        })
      })
    })
  })
}