const autoBind = require('auto-bind');

class UserHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const id = await this._service.addUser(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        userId: id,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UserHandler;
