require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// Songs
const songs = require('./api/songs');
const SongValidator = require('./validator/songs');
const SongsService = require('./services/postgres/SongsService');

// Albums
const albums = require('./api/albums');
const AlbumValidator = require('./validator/albums');
const AlbumsService = require('./services/postgres/AlbumsService');

// Users
const users = require('./api/users');
const UserValidator = require('./validator/users');
const UsersService = require('./services/postgres/UsersService');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');

// Playlists
const playlists = require('./api/playlists');
const PlaylistValidator = require('./validator/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');

// Exceptions
const InvariantError = require('./exceptions/InvariantError');
const NotFoundError = require('./exceptions/NotFoundError');
const AuthenticationError = require('./exceptions/AuthenticationError');
const AuthorizationError = require('./exceptions/AuthorizationError');

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService();

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
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('music_api_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        service: authenticationsService,
        validator: AuthenticationValidator,
        tokenManager: TokenManager,
        usersService,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistValidator,
        songsService,
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
      if (response instanceof AuthenticationError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message ? response.message : 'Authentication failed',
        });
        newResponse.code(401);
        return newResponse;
      }
      if (response instanceof AuthorizationError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message ? response.message : 'Authorization failed',
        });
        newResponse.code(403);
        return newResponse;
      }
      const newResponse = h.response({
        status: 'fail',
        message: response.message ? response.message : 'Server error',
      });
      newResponse.code(response.output.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server is running at ${server.info.uri}`);
};

init();
