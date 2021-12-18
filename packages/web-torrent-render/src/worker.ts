import { logger } from '@codesuperman/logger'
import { CACHE_NAME, staticPrefix, localForageStorageKey } from './utils/constants'
import localforage from 'localforage';

// eslint-disable-next-line
declare const self: ServiceWorkerGlobalScope;

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

  console.log('Fetch request for:')
  if (!fetchPath) {
      logger.log('enter fetchPath')
      event.respondWith(self.fetch('/index.html'));
  } else if (fetchPath === 'intercept/status') {
    event.respondWith(new Response('', { status: 234, statusText: 'intercepting' }))
  } else {
    // event.respondWith(dbResHandler(fetchPath, event))
    event.respondWith(handleFetch(fetchPath, event))
  }
})

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