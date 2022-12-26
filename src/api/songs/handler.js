const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator, cacheService) {
    this._service = service;
    this._validator = validator;
    this._cacheService = cacheService;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSong(request.payload);
    const songId = await this._service.addSong(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request, h) {
    const { title, performer } = request.query;
    const songs = await this._service.getSongs({ title, performer });
    const response = h.response({
      status: 'success',
      data: {
        songs,
      },
    });
    response.code(200);
    return response;
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    try {
      const song = JSON.parse(await this._cacheService
        .get(this._cacheService.cacheKeys.songs(id)));
      const response = h.response({
        status: 'success',
        data: {
          song,
        },
      });
      response.code(200);
      response.header('X-Data-Source', 'cache');
      return response;
    } catch (error) {
      console.log(error.message);
      console.log('Attempting to fetch song with given id from DB');
    }

    const song = await this._service.getSongById(id);

    // Set song cache for this song ID
    await this._cacheService.set(this._cacheService.cacheKeys.songs(id), JSON.stringify(song));
    const response = h.response({
      status: 'success',
      data: {
        song,
      },
    });
    response.code(200);
    return response;
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSong(request.payload);
    const { id } = request.params;

    await this._service.editSongById(id, request.payload);

    // Remove cache of this song
    await this._cacheService.delete(this._cacheService.cacheKeys.songs(id));
    const response = h.response({
      status: 'success',
      message: 'Song updated successfully',
    });
    response.code(200);
    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    // Remove cache of this song
    await this._cacheService.delete(this._cacheService.cacheKeys.songs(id));
    const response = h.response({
      status: 'success',
      message: 'Song deleted successfully',
    });
    response.code(200);
    return response;
  }
}

module.exports = SongsHandler;
