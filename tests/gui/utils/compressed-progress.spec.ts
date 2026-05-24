import { expect } from 'chai';
import { calculateCompressedProgress, detectCompression, getCompressionLabel } from '../../../lib/gui/app/utils/compressed-progress';

describe('Compressed Progress', () => {
  it('should calculate progress', () => {
    const p = calculateCompressedProgress(500, 1000, 1200);
    expect(p.readPercent).to.equal(50);
    expect(p.displayPercent).to.equal(50);
    expect(p.compressionRatio).to.be.greaterThan(1);
  });

  it('should cap at 100%', () => {
    const p = calculateCompressedProgress(1000, 1000, 2500);
    expect(p.displayPercent).to.equal(100);
  });

  it('should detect compression types', () => {
    expect(detectCompression('image.img.gz')).to.equal('gzip');
    expect(detectCompression('image.img.xz')).to.equal('xz');
    expect(detectCompression('image.img.zst')).to.equal('zstd');
    expect(detectCompression('image.img.bz2')).to.equal('bzip2');
    expect(detectCompression('image.img')).to.equal('none');
  });

  it('should return compression labels', () => {
    expect(getCompressionLabel('gzip')).to.include('gzip');
    expect(getCompressionLabel('zstd')).to.include('Zstandard');
    expect(getCompressionLabel('none')).to.include('uncompressed');
  });
});
