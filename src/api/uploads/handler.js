const autoBind = require('auto-bind');

class UploadHandler {
  constructor(uploadService, validator, albumsService) {
    this._service = uploadService;
    this._validator = validator;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;
    this._validator.validateCoverHeader(cover.hapi.headers);

    const filename = await this._service.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
    await this._albumsService.addAlbumCoverById({ id, fileLocation });
    const response = h.response({
      status: 'success',
      message: `Sampul berhasil diunggah dengan nama ${filename}`,
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadHandler;
