import { Cache } from 'cache-manager';

export class CacheService {
  constructor(public readonly cache: Cache) {}

  public get = this.cache.get.bind(this.cache);

  public set = this.cache.set.bind(this.cache);

  public reset = this.cache.reset.bind(this.cache);

  public del = this.cache.del.bind(this.cache);

  public wrap = this.cache.wrap.bind(this.cache);
}
