const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(
    playlistsService,
    validator,
    songsService,
    collaborationsService,
    activitiesService,
    cacheService,
  ) {
    this._playlistsService = playlistsService;
    this._validator = validator;
    this._songsService = songsService;
    this._collaborationsService = collaborationsService;
    this._activitiesService = activitiesService;
    this._cacheService = cacheService;
    this.playlistsCacheKey = (credentialId) => `playlists:${credentialId}`;
    this.playlistsWithSongsCacheKey = (playlistId) => `playlists_with_songs:${playlistId}`;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const id = await this._playlistsService.addPlaylist({ name, owner: credentialId });

    // Remove cache of user's playlists as they have been updated
    await this._cacheService.delete(this.playlistsCacheKey(credentialId));
    const response = h.response({
      status: 'success',
      data: {
        playlistId: id,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    try {
      const playlists = JSON.parse(await this._cacheService
        .get(this.playlistsCacheKey(credentialId)));
      const response = h.response({
        status: 'success',
        data: {
          playlists,
        },
      });
      response.code(200);
      response.header('X-Data-Source', 'cache');
      return response;
    } catch (error) {
      console.log(error.message);
      console.log('Attempting to fetch playlists from DB');
    }

    const playlists = await this._playlistsService.getPlaylists({ userId: credentialId });

    // Set user's playlist cache
    await this._cacheService.set(this.playlistsCacheKey(credentialId), JSON.stringify(playlists));
    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistOwner({ playlistId, owner: credentialId });
    await this._playlistsService.deletePlaylistById(playlistId);

    // Remove cache of this playlist with songs cache and playlists of user
    // as playlists of user has been altered and this particular playlist no longer exists
    await this._cacheService.delete(this.playlistsCacheKey(credentialId));
    await this._cacheService.delete(this.playlistsWithSongsCacheKey(playlistId));

    const response = h.response({
      status: 'success',
      message: 'Playlist deleted successfully',
    });
    response.code(200);
    return response;
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this.verifyModifyingPlaylistAllowed({ playlistId, userId: credentialId });

    await this._songsService.getSongById(songId);
    await this._playlistsService.addSongToPlaylist({ playlistId, songId });
    await this._activitiesService.addActivityToPlaylist({
      userId: credentialId, playlistId, songId, action: 'add',
    });

    // Remove cache of this playlist with songs as original data has been altered
    await this._cacheService.delete(this.playlistsWithSongsCacheKey(playlistId));

    const response = h.response({
      status: 'success',
      message: 'Song added to playlist successfully',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    try {
      const playlist = JSON.parse(await this._cacheService
        .get(this.playlistsWithSongsCacheKey(playlistId)));
      const response = h.response({
        status: 'success',
        data: {
          playlist,
        },
      });
      response.code(200);
      response.header('X-Data-Source', 'cache');
      return response;
    } catch (error) {
      console.log(error.message);
      console.log('Attempting to fetch playlist with songs from DB');
    }

    await this.verifyModifyingPlaylistAllowed({ playlistId, userId: credentialId });

    const playlist = await this._playlistsService.getSongsFromPlaylist({ playlistId });

    // Set cache of this particular playlist
    await this._cacheService.set(
      this.playlistsWithSongsCacheKey(playlistId),
      JSON.stringify(playlist),
    );
    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });
    response.code(200);
    return response;
  }

  async deleteSongFromPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this.verifyModifyingPlaylistAllowed({ playlistId, userId: credentialId });

    await this._playlistsService.deleteSongFromPlaylist({ playlistId, songId });
    await this._activitiesService.addActivityToPlaylist({
      userId: credentialId, playlistId, songId, action: 'delete',
    });

    // Remove cache of this playlist with songs as original data has been altered
    await this._cacheService.delete(this.playlistsWithSongsCacheKey(playlistId));

    const response = h.response({
      status: 'success',
      message: 'Song deleted from playlist successfully',
    });
    response.code(200);
    return response;
  }

  async getActivitiesFromPlaylistHandler(request, h) {
    this._validator.validateGetActivitiesFromPlaylistPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this.verifyModifyingPlaylistAllowed({ playlistId, userId: credentialId });

    const activities = await this._activitiesService.getActivitiesFromPlaylist({ playlistId });
    const response = h.response({
      status: 'success',
      data: activities,
    });
    response.code(200);
    return response;
  }

  async verifyModifyingPlaylistAllowed({ playlistId, userId }) {
    await this._playlistsService.verifyPlaylistExists({ playlistId });
    try {
      await this._playlistsService.verifyPlaylistOwner({ playlistId, owner: userId });
    } catch (e) {
      await this._collaborationsService.verifyCollaborator({ playlistId, userId });
    }
  }
}

module.exports = PlaylistHandler;
