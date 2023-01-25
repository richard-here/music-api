const { expect } = require('chai');
const sinon = require('sinon');
const InvariantError = require('../../../src/exceptions/InvariantError');
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
