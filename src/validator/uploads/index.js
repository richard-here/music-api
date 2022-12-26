const { ImageHeaderSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const UploadValidator = {
  validateCoverHeader: (payload) => {
    const validationResult = ImageHeaderSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadValidator;
