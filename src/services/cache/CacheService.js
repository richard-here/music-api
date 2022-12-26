const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this._client.on('error', (error) => {
      console.error(error);
    });

    this._client.connect();
    this.cacheKeys = {
      albumsLikes: (id) => `albums_likes:${id}`,
      albums: (id) => `albums:${id}`,
      playlists: (userId) => `playlists:${userId}`,
      songs: (id) => `songs:${id}`,
    };
  }

  async set(key, value, expirationInSecond = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);
    if (result === null) throw new Error(`Cache with key ${key} not found`);
    return result;
  }

  delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;
