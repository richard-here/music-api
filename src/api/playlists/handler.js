const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(service, validator, songsService) {
    this._service = service;
    this._validator = validator;
    this._songsService = songsService;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const id = await this._service.addPlaylist({ name, owner });
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
    const { id: owner } = request.auth.credentials;
    const playlists = await this._service.getPlaylists({ owner });
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
    const { id: owner } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._service.verifyPlaylistOwner({ playlistId, owner });
    await this._service.deletePlaylistById(playlistId);

    const response = h.response({
      status: 'success',
      message: 'Playlist deleted successfully',
    });
    response.code(200);
    return response;
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);
    const { id: owner } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._service.verifyPlaylistOwner({ playlistId, owner });
    await this._songsService.getSongById(songId);
    await this._service.addSongToPlaylist({ playlistId, songId });

    const response = h.response({
      status: 'success',
      message: 'Song added to playlist successfully',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._service.verifyPlaylistOwner({ playlistId, owner });
    const playlist = await this._service.getSongsFromPlaylist({ playlistId });
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
    const { id: owner } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._service.verifyPlaylistOwner({ playlistId, owner });
    await this._service.deleteSongFromPlaylist({ playlistId, songId });
    const response = h.response({
      status: 'success',
      message: 'Song deleted from playlist successfully',
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistHandler;
