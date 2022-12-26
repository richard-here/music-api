exports.up = (pgm) => {
  pgm.addColumns('albums', {
    cover_url: {
      type: 'VARCHAR(150)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('albums', ['cover_url']);
};
