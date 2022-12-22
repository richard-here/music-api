exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    year: {
      type: 'SMALLINT',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    duration: {
      type: 'SMALLINT',
    },
    album_id: {
      type: 'VARCHAR(50)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
