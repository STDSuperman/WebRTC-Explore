import { logger } from '@codesuperman/logger'
import { CACHE_NAME, staticPrefix } from './utils/constants'
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

// self.addEventListener('fetch', async event => {
//   const request = event.request;
//   const scope = self.registration.scope;
//   const method = event.request.method;
//   const url = request.url;
//   const cacheDB = await caches.open(CACHE_NAME);

//   if (method.toUpperCase() !== 'GET' || url.indexOf(scope) !== 0) return;

//   const fetchPath = url.slice(scope?.length ?? 0);
//   logger.info('Current fetch request is', fetchPath);
//   console.log(event);

//   if (!fetchPath) {
//     logger.log('enter fetchPath')
//     event.respondWith(self.fetch('/index.html'));
//   } else if (fetchPath.indexOf('intercept/status') !== -1) {
//     logger.log('enter intercept/status')
//     // @ts-ignore
//     event.respondWith(new self.Response('', { status: 234, statusText: 'intercepting' }))
//   } else {
//     console.log('xxx下来', await fetch(request))
//     // logger.info(`current storage cache keys: ${await localforage.keys()}`);
//     // const currentFileBlob: string = await localforage.getItem(`${staticPrefix}/${fetchPath}`)
//     // event.respondWith(handlerFetch(currentFileBlob, event));
//     // event.respondWith(response)

//     // console.log('cache db', await cacheDB.match(`dist/${fetchPath}`), `dist/${fetchPath}`)
//     // event.respondWith(
//     //   cacheDB.match(`dist/${fetchPath}`)
//     //     .then(function (cache) {
//     //         return cache || fetch(event.request);
//     //     }).catch(function (err) {
//     //         console.log(err);
//     //         return fetch(event.request);
//     //     })
//     // )
//   }
// })

self.addEventListener('fetch', async function (event) {
  const request = event.request;
  const scope = self.registration.scope;
  const url = request.url;
  const fetchPath = url.slice(scope?.length ?? 0);

  console.log('Fetch request for:', fetchPath)
  if (fetchPath === 'intercept/status') {
    event.respondWith(new Response('', { status: 234, statusText: 'intercepting' }))
  } else {
    event.respondWith(dbResHandler(fetchPath, event))
  }
})

async function handlerFetch(fetchUrl: string, event): Promise<Response> {
  logger.info(`current request blobUrl: ${fetchUrl}`)
  const res = await fetch(fetchUrl);
  const response = new Response(res.body, res);
  console.log(res);
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