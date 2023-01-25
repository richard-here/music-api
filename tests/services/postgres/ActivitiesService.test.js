const { expect } = require('chai');
const sinon = require('sinon');
const InvariantError = require('../../../src/exceptions/InvariantError');
const ActivitesService = require('../../../src/services/postgres/ActivitiesService');

describe('ActivitesService', () => {
  let activitiesService;
  beforeEach(() => {
    activitiesService = new ActivitesService();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addActivityToPlaylist', () => {
    it('should add a new activity to playlist with proper values', async () => {
      const stubValue = {
        userId: 'user-1',
        playlistId: 'playlist-1',
        songId: 'song-1',
        action: 'add',
      };
      const queryFake = sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] });
      sinon.replace(activitiesService._pool, 'query', queryFake);
      await activitiesService.addActivityToPlaylist(stubValue);
      expect(queryFake.calledOnce).to.equal(true);
    });
    it('should throw an error when adding with improper values', async () => {
      const stubValue = {
        userId: 'user-1',
        playlistId: 'playlist-1',
        songId: 'song-1',
        action: 21,
      };
      const queryFake = sinon.fake.resolves({});
      sinon.replace(activitiesService._pool, 'query', queryFake);
      try {
        await activitiesService.addActivityToPlaylist(stubValue);
      } catch (e) {
        expect(e).instanceOf(InvariantError);
      }
      expect(queryFake.calledOnce).to.equal(true);
    });
  });

  describe('getActivitiesFromPlaylist', () => {
    it('should get activities from playlist', async () => {
      const stubValue = {
        playlistId: 'playlist-1',
      };
      const queryFake = sinon.fake.resolves({
        playlistId: stubValue.playlistId,
        activities: [{ id: 1 }, { id: 2 }],
      });
      sinon.replace(activitiesService._pool, 'query', queryFake);
      await activitiesService.getActivitiesFromPlaylist(stubValue);
      expect(queryFake.calledOnce).to.equal(true);
    });
  });
});
