export interface IGlobalCache {
  globalTorrentFilesCache: Record<string, unknown>;
}

class GlobalCache {
  private globalCacheObj: Record<string, unknown> = {}

  set<K extends keyof IGlobalCache>(
    key: K,
    value: IGlobalCache[K]
  ): void {
    this.globalCacheObj[key] = value
  }

  get<K extends keyof IGlobalCache>(key: K) {
    return this.globalCacheObj[key];
  }

  clear() {
    this.globalCacheObj = {};
  }
}

export const cacheInstance = new GlobalCache();