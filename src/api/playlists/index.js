const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { service, validator, songsService }) => {
    const playlistHandler = new PlaylistHandler(service, validator, songsService);
    server.route(routes(playlistHandler));
  },
};
