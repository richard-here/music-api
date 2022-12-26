const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivityToPlaylist({
    userId, playlistId, songId, action,
  }) {
    const query = {
      text: 'INSERT INTO playlists_activities(user_id, song_id, playlist_id, action, time) VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id',
      values: [userId, songId, playlistId, action],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Insertion of activity failed');
    }
  }

  async getActivitiesFromPlaylist({ playlistId }) {
    const query = {
      text: `SELECT U.username, S.title, PA.action, PA.time FROM playlists_activities PA
        INNER JOIN users U ON U.id = PA.user_id
        INNER JOIN playlists P ON P.id = PA.playlist_id
        INNER JOIN songs S ON S.id = PA.song_id
        WHERE PA.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return { playlistId, activities: result.rows };
  }
}

module.exports = ActivitiesService;
