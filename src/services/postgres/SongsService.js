const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongDBToModel, mapSongDBToSummaryModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add song');
    }
    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    const query = {
      text: 'SELECT * FROM songs WHERE TRUE',
      values: [],
    };
    let textToAppend = '';
    const valuesToPush = [];
    let index = 1;
    if (title) {
      textToAppend += ` AND title ILIKE $${index}`;
      valuesToPush.push(`%${title}%`);
      index += 1;
    }
    if (performer) {
      textToAppend += ` AND performer ILIKE $${index}`;
      valuesToPush.push(`%${performer}%`);
    }
    query.text += textToAppend;
    query.values.push(...valuesToPush);
    const result = await this._pool.query(query);
    return result.rows.map(mapSongDBToSummaryModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError(`Song with id ${id} not found`);
    }

    return mapSongDBToModel(result.rows[0]);
  }

  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError(`Song with id ${id} not found, so update was not done`);
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError(`Song with id ${id} not found, so deletion was not possible`);
    }
  }
}

module.exports = SongsService;
