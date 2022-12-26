const autoBind = require('auto-bind');

class ExportHandler {
  constructor(service, validator, playlistsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validateExportPlaylistPayload(request.payload);

    const message = {
      playlistId: request.params.playlistId,
      targetEmail: request.payload.targetEmail,
    };
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistExists({ playlistId: message.playlistId });
    await this._playlistsService.verifyPlaylistOwner({
      playlistId: message.playlistId,
      owner: credentialId,
    });
    await this._service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportHandler;
