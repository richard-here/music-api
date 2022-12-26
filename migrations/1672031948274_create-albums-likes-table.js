exports.up = (pgm) => {
  pgm.createTable('albums_likes', {
    id: {
      type: 'SERIAL',
      primaryKey: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('albums_likes', 'unique_album_id_and_user_id', 'UNIQUE(album_id, user_id)');
  pgm.addConstraint('albums_likes', 'fk_albums_likes.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
  pgm.addConstraint('albums_likes', 'fk_albums_likes.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('albums_likes');
};
