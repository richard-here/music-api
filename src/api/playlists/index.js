const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService, validator, songsService,
    collaborationsService, activitiesService,
    cacheService,
  }) => {
    const playlistHandler = new PlaylistHandler(
      playlistsService,
      validator,
      songsService,
      collaborationsService,
      activitiesService,
      cacheService,
    );
    server.route(routes(playlistHandler));
  },
};
