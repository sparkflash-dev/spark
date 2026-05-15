import { expect } from 'chai';
import {
	getProgressAriaLabel,
	getDriveAriaLabel,
	getSourceAriaLabel,
	getShortcutDescription,
} from '../../../lib/gui/app/utils/accessibility';

describe('Accessibility utilities', function () {
	describe('getProgressAriaLabel()', function () {
		it('should format flashing progress', function () {
			const label = getProgressAriaLabel('flashing', 45);
			expect(label).to.include('Writing to drive');
			expect(label).to.include('45');
			expect(label).to.include('percent');
		});

		it('should include speed when provided', function () {
			const speed = 50 * 1024 * 1024; // 50 MB/s
			const label = getProgressAriaLabel('flashing', 60, speed);
			expect(label).to.include('megabytes per second');
		});

		it('should handle verifying phase', function () {
			const label = getProgressAriaLabel('verifying', 80);
			expect(label).to.include('Verifying');
		});

		it('should use raw phase name for unknown phases', function () {
			const label = getProgressAriaLabel('custom', 10);
			expect(label).to.include('custom');
		});
	});

	describe('getDriveAriaLabel()', function () {
		it('should format drive info', function () {
			const label = getDriveAriaLabel('SanDisk Ultra', 16 * 1024 * 1024 * 1024, ['/media/usb']);
			expect(label).to.include('SanDisk Ultra');
			expect(label).to.include('16.0');
			expect(label).to.include('gigabytes');
			expect(label).to.include('/media/usb');
		});

		it('should handle no mountpoints', function () {
			const label = getDriveAriaLabel('Generic Drive', 8 * 1024 * 1024 * 1024, []);
			expect(label).to.include('Generic Drive');
			expect(label).to.not.include('mounted');
		});
	});

	describe('getSourceAriaLabel()', function () {
		it('should describe no selection', function () {
			const label = getSourceAriaLabel();
			expect(label).to.include('No image selected');
		});

		it('should describe loading state', function () {
			const label = getSourceAriaLabel(undefined, undefined, true);
			expect(label).to.include('Loading');
		});

		it('should describe selected image', function () {
			const label = getSourceAriaLabel('ubuntu.iso', 4 * 1024 * 1024 * 1024);
			expect(label).to.include('ubuntu.iso');
			expect(label).to.include('gigabytes');
		});
	});

	describe('getShortcutDescription()', function () {
		it('should format shortcut', function () {
			expect(getShortcutDescription('Ctrl+O', 'open file')).to.equal('Press Ctrl+O to open file');
		});
	});
});
