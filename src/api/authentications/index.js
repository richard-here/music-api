const AuthenticationHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, {
    service, validator, tokenManager, usersService,
  }) => {
    const authenticationHandler = new AuthenticationHandler(
      service,
      validator,
      tokenManager,
      usersService,
    );
    server.route(routes(authenticationHandler));
  },
};
