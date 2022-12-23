const CollaborationHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {
    collaborationsService, validator, playlistsService, usersService,
  }) => {
    const authenticationHandler = new CollaborationHandler(
      collaborationsService,
      validator,
      playlistsService,
      usersService,
    );
    server.route(routes(authenticationHandler));
  },
};
