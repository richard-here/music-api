const autoBind = require('auto-bind');

class CollaborationHandler {
  constructor(collaborationsService, validator, playlistsService, usersService) {
    this._collaborationsService = collaborationsService;
    this._validator = validator;
    this._playlistsService = playlistsService;
    this._usersService = usersService;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._usersService.verifyUserExists({ userId });
    await this._playlistsService.verifyPlaylistExists({ playlistId });
    await this._playlistsService.verifyPlaylistOwner({ playlistId, owner: credentialId });
    const collaborationId = await this._collaborationsService
      .addCollaboration({ playlistId, userId });

    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsService.verifyPlaylistOwner({ playlistId, owner: credentialId });
    await this._collaborationsService.deleteCollaboration({ playlistId, userId });

    const response = h.response({
      status: 'success',
      message: 'Collaborator removed successfully',
    });
    response.code(200);
    return response;
  }
}

module.exports = CollaborationHandler;
