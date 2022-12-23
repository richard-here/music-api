const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapPlaylistDBToModel, mapPlaylistWithSongsDBToModel } = require('../../utils');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Data given is invalid and insert failed');
    }
    return result.rows[0].id;
  }

  async getPlaylists({ owner }) {
    const query = {
      text: 'SELECT * FROM playlists WHERE owner = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Data given is invalid and get failed');
    }
    return result.rows.map(mapPlaylistDBToModel);
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist with id given not found. Deletion failed');
    }
    return result.rows[0].id;
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const query = {
      text: 'INSERT INTO playlists_songs(playlist_id, song_id) VALUES($1, $2)',
      values: [playlistId, songId],
    };

    console.log(query);
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Ids given might be incorrect. Insertion failed');
    }
  }

  async getSongsFromPlaylist({ playlistId }) {
    const query = {
      text: `SELECT P.id, P.name, U.username AS username, JSON_AGG(JSON_BUILD_OBJECT('id', S.id, 'title', S.title, 'performer', S.performer)) AS songs FROM playlists P
        LEFT JOIN users U ON U.id = P.owner
        LEFT JOIN playlists_songs PS ON PS.playlist_id = P.id
        LEFT JOIN songs S ON PS.song_id = S.id
        WHERE P.id = $1
        GROUP BY P.id, U.username`,
      values: [playlistId],
    };

    console.log(query);
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Id given is not found. Get data failed');
    }

    return mapPlaylistWithSongsDBToModel(result.rows[0]);
  }

  async deleteSongFromPlaylist({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlists_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Playlist with that song and playlist ids are not found. Deletion failed');
    }
  }

  async verifyPlaylistOwner({ playlistId, owner }) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist with given id not found');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('You are not authorized to delete this playlist');
    }
  }
}

module.exports = PlaylistsService;
