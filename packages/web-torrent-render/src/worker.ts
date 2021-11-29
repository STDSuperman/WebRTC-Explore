import { logger } from './utils/logger'
import { CACHE_NAME } from './utils/constants'

// eslint-disable-next-line
const sw = self as unknown as ServiceWorkerGlobalScope;

const clearCache = async (cacheName: string) => {
  const keys = await caches.keys();
  keys.forEach(key => {
    if (key !== cacheName) {
      caches.delete(key);
    }
  })
}

sw.addEventListener('install', async event => {
  logger.info('installing!')
  await sw.skipWaiting();
})

sw.addEventListener('activate', async event => {
  await clearCache(CACHE_NAME);
  await sw.clients.claim();
  logger.info('activated!')
})

sw.addEventListener('fetch', async event => {
  const request = event.request.url;
  const scope = sw.registration.scope;
  const method = event.request.method;

  if (method.toUpperCase() !== 'GET' || request.indexOf(scope) !== 0) return;

  const fetchPath = request.slice(scope?.length ?? 0);
  logger.info('Current fetch request is', fetchPath);

  if (fetchPath.indexOf('intercept/status') !== -1) {
    event.respondWith(new Response('', { status: 200, statusText: 'OK' }));
  } else {
    const cacheResponse = await caches.match(fetchPath);
    const response = cacheResponse ?? await sw.fetch(event.request);
    console.log(event.request.url, response)
    event.respondWith(response);
  }
})