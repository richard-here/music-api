const Joi = require('joi');

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().integer().required(),
});

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer(),
  albumId: Joi.string(),
});

module.exports = { AlbumPayloadSchema, SongPayloadSchema };
