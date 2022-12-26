const ExportHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validator, playlistsService }) => {
    const exportHandler = new ExportHandler(service, validator, playlistsService);
    server.route(routes(exportHandler));
  },
};
