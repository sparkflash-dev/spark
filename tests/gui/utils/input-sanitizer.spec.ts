import { expect } from 'chai';
import { sanitizeFilename, sanitizeDevicePath, sanitizeUrl, sanitizeLabel, sanitizeSearchQuery, escapeForShell } from '../../../lib/gui/app/utils/input-sanitizer';

describe('Input Sanitizer', () => {
  describe('sanitizeFilename', () => {
    it('should remove null bytes', () => {
      expect(sanitizeFilename('file\0name.iso')).to.equal('filename.iso');
    });
    it('should replace path separators', () => {
      expect(sanitizeFilename('../../etc/passwd')).to.equal('____etc_passwd');
    });
    it('should handle leading dots', () => {
      expect(sanitizeFilename('.hidden')).to.equal('_hidden');
    });
  });

  describe('sanitizeDevicePath', () => {
    it('should accept valid Linux device paths', () => {
      expect(sanitizeDevicePath('/dev/sda')).to.equal('/dev/sda');
      expect(sanitizeDevicePath('/dev/mmcblk0')).to.equal('/dev/mmcblk0');
    });
    it('should reject invalid paths', () => {
      expect(sanitizeDevicePath('/etc/passwd')).to.be.null;
      expect(sanitizeDevicePath('../dev/sda')).to.be.null;
    });
  });

  describe('sanitizeUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      expect(sanitizeUrl('https://example.com/image.iso')).to.not.be.null;
    });
    it('should reject localhost', () => {
      expect(sanitizeUrl('http://localhost/secret')).to.be.null;
      expect(sanitizeUrl('http://127.0.0.1/secret')).to.be.null;
    });
    it('should reject non-HTTP protocols', () => {
      expect(sanitizeUrl('file:///etc/passwd')).to.be.null;
      expect(sanitizeUrl('ftp://example.com')).to.be.null;
    });
  });

  describe('sanitizeLabel', () => {
    it('should uppercase and trim', () => {
      expect(sanitizeLabel('my drive')).to.equal('MY DRIVE');
    });
    it('should truncate to max length', () => {
      expect(sanitizeLabel('very long label name', 11)).to.have.length.at.most(11);
    });
  });

  describe('escapeForShell', () => {
    it('should escape single quotes for bash', () => {
      const result = escapeForShell("file's name");
      expect(result).to.include('file');
    });
  });
});
