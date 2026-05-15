import { expect } from 'chai';
import {
	formatDriveLabel,
	formatDriveSize,
	getDriveTypeLabel,
	getDriveShortId,
} from '../../../lib/gui/app/utils/disk-label';

describe('Disk label utilities', function () {
	describe('formatDriveLabel()', function () {
		it('should prefer mountpoint label', function () {
			expect(formatDriveLabel({
				description: 'Generic USB',
				mountpoints: [{ path: '/media/usb', label: 'MyDrive' }],
			})).to.equal('MyDrive');
		});

		it('should fall back to description', function () {
			expect(formatDriveLabel({
				description: 'SanDisk Ultra USB',
				mountpoints: [],
			})).to.equal('SanDisk Ultra');
		});

		it('should fall back to device path', function () {
			expect(formatDriveLabel({
				device: '/dev/sdb',
			})).to.equal('/dev/sdb');
		});

		it('should return Unknown Drive for empty info', function () {
			expect(formatDriveLabel({})).to.equal('Unknown Drive');
		});
	});

	describe('formatDriveSize()', function () {
		it('should format GB', function () {
			expect(formatDriveSize(16 * 1024 * 1024 * 1024)).to.equal('16.0 GB');
		});

		it('should format TB', function () {
			expect(formatDriveSize(2 * 1024 * 1024 * 1024 * 1024)).to.equal('2.0 TB');
		});

		it('should format MB', function () {
			expect(formatDriveSize(512 * 1024 * 1024)).to.equal('512 MB');
		});

		it('should handle zero', function () {
			expect(formatDriveSize(0)).to.equal('Unknown size');
		});
	});

	describe('getDriveTypeLabel()', function () {
		it('should return USB Drive for USB', function () {
			expect(getDriveTypeLabel('USB')).to.equal('USB Drive');
		});

		it('should return SD Card for SD', function () {
			expect(getDriveTypeLabel('SD')).to.equal('SD Card');
		});

		it('should return Virtual for virtual drives', function () {
			expect(getDriveTypeLabel('USB', true)).to.equal('Virtual');
		});
	});

	describe('getDriveShortId()', function () {
		it('should extract Linux device name', function () {
			expect(getDriveShortId('/dev/sda')).to.equal('sda');
		});

		it('should extract Windows device name', function () {
			expect(getDriveShortId('\\\\.\\PhysicalDrive0')).to.equal('PhysicalDrive0');
		});
	});
});
