const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(playlistsService, validator, songsService, collaborationsService, activitiesService) {
    this._playlistsService = playlistsService;
    this._validator = validator;
    this._songsService = songsService;
    this._collaborationsService = collaborationsService;
    this._activitiesService = activitiesService;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const id = await this._playlistsService.addPlaylist({ name, owner: credentialId });
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

    const playlists = await this._playlistsService.getPlaylists({ userId: credentialId });
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

    await this.verifyModifyingPlaylistAllowed({ playlistId, userId: credentialId });

    const playlist = await this._playlistsService.getSongsFromPlaylist({ playlistId });
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
