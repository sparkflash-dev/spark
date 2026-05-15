import { expect } from 'chai';
import {
	analyzeDriveHealth,
	getHealthColor,
} from '../../../lib/gui/app/utils/drive-health';

describe('Drive health analysis', function () {
	describe('analyzeDriveHealth()', function () {
		it('should return good health for a normal USB drive', function () {
			const report = analyzeDriveHealth({
				size: 16 * 1024 * 1024 * 1024 * 0.93, // ~14.9 GB (real 16GB)
				busType: 'USB',
				isRemovable: true,
				isReadOnly: false,
				mountpoints: [],
			});
			expect(report.overall).to.equal('good');
			expect(report.indicators).to.have.length(0);
		});

		it('should warn about very small drives', function () {
			const report = analyzeDriveHealth({
				size: 50 * 1024 * 1024, // 50 MB
				busType: 'USB',
				isRemovable: true,
				isReadOnly: false,
			});
			expect(report.overall).to.equal('warning');
			expect(report.indicators[0].message).to.include('unusually small');
		});

		it('should caution about suspiciously exact sizes', function () {
			const report = analyzeDriveHealth({
				size: 32 * 1024 * 1024 * 1024, // exactly 32 GB
				busType: 'USB',
				isRemovable: true,
				isReadOnly: false,
			});
			expect(report.overall).to.equal('caution');
			expect(report.indicators[0].message).to.include('fake capacity');
		});

		it('should warn about read-only drives', function () {
			const report = analyzeDriveHealth({
				size: 8 * 1024 * 1024 * 1024,
				busType: 'USB',
				isRemovable: true,
				isReadOnly: true,
			});
			expect(report.indicators.some((i) => i.message.includes('read-only')))
				.to.be.true;
		});

		it('should caution about SATA bus type', function () {
			const report = analyzeDriveHealth({
				size: 500 * 1024 * 1024 * 1024,
				busType: 'SATA',
				isRemovable: false,
				isReadOnly: false,
			});
			expect(
				report.indicators.some((i) => i.message.includes('SATA')),
			).to.be.true;
		});

		it('should report active mount points', function () {
			const report = analyzeDriveHealth({
				size: 16 * 1024 * 1024 * 1024,
				busType: 'USB',
				isRemovable: true,
				isReadOnly: false,
				mountpoints: [{ path: '/media/usb' }],
			});
			expect(
				report.indicators.some((i) => i.message.includes('/media/usb')),
			).to.be.true;
		});
	});

	describe('getHealthColor()', function () {
		it('should return green for good', function () {
			expect(getHealthColor('good')).to.equal('#22c55e');
		});
		it('should return amber for caution', function () {
			expect(getHealthColor('caution')).to.equal('#f59e0b');
		});
		it('should return red for warning', function () {
			expect(getHealthColor('warning')).to.equal('#ef4444');
		});
	});
});
