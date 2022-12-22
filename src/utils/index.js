/* eslint-disable camelcase */
const mapAlbumDBToModel = ({
  id,
  name,
  year,
  songs,
}) => ({
  id,
  name,
  year,
  songs: songs.filter((song) => song)
    .map((song) => ({ title: song.title, performer: song.performer })),
});

const mapSongDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapSongDBToSummaryModel = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

module.exports = { mapAlbumDBToModel, mapSongDBToModel, mapSongDBToSummaryModel };
