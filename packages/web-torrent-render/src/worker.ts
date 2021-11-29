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
  const request = event.request;
  const scope = sw.registration.scope;
  const method = event.request.method;
  const url = request.url;

  if (method.toUpperCase() !== 'GET' || url.indexOf(scope) !== 0) return;

  const fetchPath = url.slice(scope?.length ?? 0);
  logger.info('Current fetch request is', fetchPath);

  if (fetchPath.indexOf('intercept/status') !== -1) {
    event.respondWith(new Response('', { status: 200, statusText: 'OK' }));
  } else {
    const cacheResponse = caches.match(fetchPath);
    const response = cacheResponse ?? sw.fetch(event.request);
    event.respondWith(response);
  }
})