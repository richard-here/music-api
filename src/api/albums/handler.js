const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator, albumLikesService, cacheService) {
    this._service = service;
    this._validator = validator;
    this._albumLikesService = albumLikesService;
    this._cacheService = cacheService;
    this.albumLikeCacheKey = (id) => `albums_likes:${id}`;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbum(request.payload);
    const albumId = await this._service.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbum(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);
    const response = h.response({
      status: 'success',
      message: 'Album updated successfully',
    });
    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    const response = h.response({
      status: 'success',
      message: 'Album deleted successfully',
    });
    response.code(200);
    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.getAlbumById(id);
    const isAlbumLiked = await this._albumLikesService.verifyAlbumLiked({
      albumId: id,
      userId: credentialId,
    });
    if (isAlbumLiked) {
      await this._albumLikesService.deleteLikeFromAlbum({ albumId: id, userId: credentialId });
    } else {
      await this._albumLikesService.addLikeToAlbum({ albumId: id, userId: credentialId });
    }

    await this._cacheService.delete(this.albumLikeCacheKey(id));

    const response = h.response({
      status: 'success',
      message: `Album ${isAlbumLiked ? 'disliked' : 'liked'} successfully`,
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;
    try {
      const likes = parseInt(await this._cacheService.get(this.albumLikeCacheKey(id)), 10);
      const response = h.response({
        status: 'success',
        data: {
          likes,
        },
      });
      response.code(200);
      response.header('X-Data-Source', 'cache');
      return response;
    } catch (error) {
      console.log(error.message);
      console.log('Attempting to fetch album like count from DB');
    }

    const likes = await this._albumLikesService.getLikesOfAlbum({ albumId: id });
    await this._cacheService.set(`albums_likes:${id}`, JSON.stringify(likes));
    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
