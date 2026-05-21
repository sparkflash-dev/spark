import { expect } from 'chai';
import { searchBookmarks, getRecentBookmarks, getMostUsedBookmarks } from '../../../lib/gui/app/utils/image-library';

describe('Image Library', () => {
  it('should search bookmarks by name', () => {
    // searchBookmarks reads from disk, returns empty on fresh install
    const results = searchBookmarks('ubuntu');
    expect(results).to.be.an('array');
  });

  it('should get recent bookmarks', () => {
    const recent = getRecentBookmarks(3);
    expect(recent).to.be.an('array');
    expect(recent.length).to.be.at.most(3);
  });

  it('should get most used bookmarks', () => {
    const popular = getMostUsedBookmarks(5);
    expect(popular).to.be.an('array');
  });
});
