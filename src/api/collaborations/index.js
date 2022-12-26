const CollaborationHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {
    collaborationsService, validator, playlistsService, usersService, cacheService,
  }) => {
    const authenticationHandler = new CollaborationHandler(
      collaborationsService,
      validator,
      playlistsService,
      usersService,
      cacheService,
    );
    server.route(routes(authenticationHandler));
  },
};
