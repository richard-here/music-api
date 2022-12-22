const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumDBToModel } = require('../../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add album');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT A.id, A.name, A.year, JSON_AGG(JSON_BUILD_OBJECT(\'title\', S.title, \'performer\', S.performer)) AS songs '
        + 'FROM albums A LEFT JOIN songs S ON A.id = S.album_id WHERE A.id = $1 GROUP BY A.id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError(`Album with id ${id} not found`);
    }
    result.rows.map(mapAlbumDBToModel);
    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError(`Album with id ${id} not found, so update was not done`);
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError(`Album with id ${id} not found, so deletion was not possible`);
    }
  }
}

module.exports = AlbumsService;
