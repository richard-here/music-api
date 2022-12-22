require('dotenv').config();

const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const albums = require('./api/albums');
const SongsService = require('./services/postgres/SongsService');
const AlbumsService = require('./services/postgres/AlbumsService');
const Validator = require('./validator');
const InvariantError = require('./exceptions/InvariantError');
const NotFoundError = require('./exceptions/NotFoundError');

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: Validator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: Validator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof InvariantError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message ? response.message : 'Bad request',
        });
        newResponse.code(400);
        return newResponse;
      }
      if (response instanceof NotFoundError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message ? response.message : 'Not found',
        });
        newResponse.code(404);
        return newResponse;
      }
      const newResponse = h.response({
        status: 'fail',
        message: response.message ? response.message : 'Server error',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server is running at ${server.info.uri}`);
};

init();
