const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService, validator, songsService,
    collaborationsService, activitiesService,
  }) => {
    const playlistHandler = new PlaylistHandler(
      playlistsService,
      validator,
      songsService,
      collaborationsService,
      activitiesService,
    );
    server.route(routes(playlistHandler));
  },
};
