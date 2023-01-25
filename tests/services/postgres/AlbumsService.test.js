const { expect } = require('chai');
const sinon = require('sinon');
const InvariantError = require('../../../src/exceptions/InvariantError');
const NotFoundError = require('../../../src/exceptions/NotFoundError');
const AlbumsService = require('../../../src/services/postgres/AlbumsService');

describe('AlbumsService', () => {
  let albumsService;
  beforeEach(() => {
    albumsService = new AlbumsService();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addAlbum', () => {
    it('should add a new album with proper values', async () => {
      const stubValue = {
        name: 'album-1',
        year: 2009,
      };
      const queryFake = sinon.fake.resolves({ rowCount: 1, rows: [{ id: 1 }] });
      sinon.replace(albumsService._pool, 'query', queryFake);
      await albumsService.addAlbum(stubValue);
      expect(queryFake.calledOnce).to.equal(true);
    });
    it('should throw an error when adding with improper values', async () => {
      const stubValue = {
        name: 'album-2',
        year: '2009',
      };
      const queryFake = sinon.fake.resolves({ rows: [] });
      sinon.replace(albumsService._pool, 'query', queryFake);
      try {
        await albumsService.addAlbum(stubValue);
      } catch (e) {
        expect(e).instanceOf(InvariantError);
      }
      expect(queryFake.calledOnce).to.equal(true);
    });
  });

  describe('getAlbumById', () => {
    it('should get an album based on its id', async () => {
      const stubValue = 1;
      const queryFake = sinon.fake.resolves({
        rowCount: 1,
        rows: [
          {
            id: stubValue,
            name: 'album-1',
            year: 2009,
            cover_url: null,
            songs: [],
          },
        ],
      });
      sinon.replace(albumsService._pool, 'query', queryFake);
      const result = await albumsService.getAlbumById(stubValue);
      expect(result.id).to.equal(stubValue);
      expect(result.name).to.equal('album-1');
      expect(result.year).to.equal(2009);
      expect(result.coverUrl).to.equal(null);
      expect(result.songs).to.be.empty;
      expect(queryFake.calledOnce).to.equal(true);
    });
    it('should throw not found error when album with id is not found', async () => {
      const stubValue = 1000;
      const queryFake = sinon.fake.resolves({
        rowCount: 0,
        rows: [],
      });
      sinon.replace(albumsService._pool, 'query', queryFake);
      try {
        await albumsService.getAlbumById(stubValue);
      } catch (e) {
        expect(e).instanceOf(NotFoundError);
        expect(queryFake.calledOnce).to.equal(true);
      }
    });
  });
  describe('editAlbumById', () => {
    it('should call query when editing is successful', async () => {
      const stubId = 1;
      const stubValue = { name: 'new-album', year: 2009 };
      const queryFake = sinon.fake.resolves({
        rowCount: 1,
        rows: [
          {
            id: stubId,
          },
        ],
      });
      sinon.replace(albumsService._pool, 'query', queryFake);
      await albumsService.editAlbumById(stubId, stubValue);
      expect(queryFake.calledOnce).to.equal(true);
    });
    it('should throw not found error when album with id given is not found', async () => {
      const stubId = 10000;
      const stubValue = { name: 'new-album', year: 2009 };
      const queryFake = sinon.fake.resolves({
        rowCount: 0,
        rows: [],
      });
      sinon.replace(albumsService._pool, 'query', queryFake);
      try {
        await albumsService.editAlbumById(stubId, stubValue);
      } catch (e) {
        expect(e).instanceOf(NotFoundError);
      }
      expect(queryFake.calledOnce).to.equal(true);
    });
  });

  describe('deleteAlbumById', () => {
    it('should call query when deleting is successful', async () => {
      const stubId = 1;
      const queryFake = sinon.fake.resolves({
        rowCount: 1,
        rows: [
          {
            id: stubId,
          },
        ],
      });
      sinon.replace(albumsService._pool, 'query', queryFake);
      await albumsService.deleteAlbumById(stubId);
      expect(queryFake.calledOnce).to.equal(true);
    });
    it('should throw not found error when album with id given is not found', async () => {
      const stubId = 10000;
      const queryFake = sinon.fake.resolves({
        rowCount: 0,
        rows: [],
      });
      sinon.replace(albumsService._pool, 'query', queryFake);
      try {
        await albumsService.deleteAlbumById(stubId);
      } catch (e) {
        expect(e).instanceOf(NotFoundError);
      }
      expect(queryFake.calledOnce).to.equal(true);
    });
  });

  describe('addAlbumCoverById', () => {
    it('should call query when parameters given are valid', async () => {
      const stubValue = { id: 1, fileLocation: 'somelocation/file.png' };
      const queryFake = sinon.fake.resolves({
        rowCount: 1,
        rows: [{ id: stubValue.id }],
      });
      sinon.replace(albumsService._pool, 'query', queryFake);
      await albumsService.addAlbumCoverById(stubValue);
      expect(queryFake.calledOnce).to.equal(true);
    });
    it('should throw not found error when album with given id is not found', async () => {
      const stubValue = { id: 1000, fileLocation: 'somelocation/file.png' };
      const queryFake = sinon.fake.resolves({
        rowCount: 0,
        rows: [],
      });
      sinon.replace(albumsService._pool, 'query', queryFake);
      try {
        await albumsService.addAlbumCoverById(stubValue);
      } catch (e) {
        expect(e).instanceOf(NotFoundError);
      }
      expect(queryFake.calledOnce).to.equal(true);
    });
  });
});
