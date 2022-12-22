const InvariantError = require('../exceptions/InvariantError');
const { AlbumPayloadSchema, SongPayloadSchema } = require('./schema');

const Validator = {
  validateAlbum: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError('Data format invalid');
    }
  },
  validateSong: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError('Data format invalid');
    }
  },
};

module.exports = Validator;
