const UploadHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, { service, validator, albumsService }) => {
    const uploadHandler = new UploadHandler(service, validator, albumsService);
    server.route(routes(uploadHandler));
  },
};
