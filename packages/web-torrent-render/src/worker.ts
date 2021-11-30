import { logger } from './utils/logger'
import { CACHE_NAME } from './utils/constants'

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

self.addEventListener('fetch', async event => {
  const request = event.request;
  const scope = self.registration.scope;
  const method = event.request.method;
  const url = request.url;

  if (method.toUpperCase() !== 'GET' || url.indexOf(scope) !== 0) return;

  const fetchPath = url.slice(scope?.length ?? 0);
  logger.info('Current fetch request is', fetchPath);

  if (fetchPath === '') {
    event.respondWith(self.fetch('/index.html'));
  } else if (fetchPath.indexOf('intercept/status') !== -1) {
    event.respondWith(new Response('', { status: 200, statusText: 'OK' }));
  } else {
    const getInterceptResponse = async (): Promise<Response> => {
      const cacheResponse = await caches.match(fetchPath);
      const response = cacheResponse ?? self.fetch(event.request);
      return response;
    }
    event.respondWith(getInterceptResponse());
  }
})