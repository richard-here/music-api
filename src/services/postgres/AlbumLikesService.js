const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumLikesService {
  constructor() {
    this._pool = new Pool({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    });
  }

  async addLikeToAlbum({
    albumId, userId,
  }) {
    const query = {
      text: 'INSERT INTO albums_likes(album_id, user_id) VALUES($1, $2) RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Like failed');
    }
  }

  async deleteLikeFromAlbum({ albumId, userId }) {
    const query = {
      text: 'DELETE FROM albums_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Deletion of like failed with given user id and album id');
    }
  }

  async getLikesOfAlbum({ albumId }) {
    const query = {
      text: 'SELECT COUNT(id) AS likes FROM albums_likes WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);
    return parseInt(result.rows[0].likes, 10);
  }

  async verifyAlbumLiked({ albumId, userId }) {
    const query = {
      text: 'SELECT * FROM albums_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);
    return !!result.rowCount;
  }
}

module.exports = AlbumLikesService;
