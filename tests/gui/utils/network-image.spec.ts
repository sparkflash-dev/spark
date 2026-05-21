import { expect } from 'chai';
import { parseImageUrl, isImageUrl, formatDownloadSpeed, estimateDuration, canResume } from '../../../lib/gui/app/utils/network-image';

describe('Network Image', () => {
  it('should parse valid image URL', () => {
    const result = parseImageUrl('https://releases.ubuntu.com/22.04/ubuntu-22.04-desktop-amd64.iso');
    expect(result).to.not.be.null;
    expect(result!.filename).to.equal('ubuntu-22.04-desktop-amd64.iso');
    expect(result!.hostname).to.equal('releases.ubuntu.com');
  });

  it('should detect image URLs', () => {
    expect(isImageUrl('https://example.com/image.iso')).to.be.true;
    expect(isImageUrl('https://example.com/image.img.gz')).to.be.true;
    expect(isImageUrl('https://example.com/page.html')).to.be.false;
  });

  it('should return null for invalid URL', () => {
    expect(parseImageUrl('not a url')).to.be.null;
  });

  it('should format download speed', () => {
    expect(formatDownloadSpeed(1024 * 1024 * 50)).to.equal('50.0 MB/s');
    expect(formatDownloadSpeed(512 * 1024)).to.equal('512.0 KB/s');
  });

  it('should estimate duration', () => {
    const result = estimateDuration(1024 * 1024 * 1024, 1024 * 1024 * 10);
    expect(result).to.include('m');
  });
});
