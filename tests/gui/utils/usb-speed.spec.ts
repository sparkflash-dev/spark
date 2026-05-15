import { expect } from 'chai';
import {
	detectUsbGeneration,
	getSpeedInfo,
	formatEstimatedTime,
} from '../../../lib/gui/app/utils/usb-speed';

describe('USB speed utilities', function () {
	describe('detectUsbGeneration()', function () {
		it('should detect USB 3.0 from description', function () {
			expect(detectUsbGeneration('USB', 'USB 3.0 Flash Drive')).to.equal('USB 3.0');
		});

		it('should detect USB 2.0 from generic USB bus', function () {
			expect(detectUsbGeneration('USB')).to.equal('USB 2.0');
		});

		it('should return Unknown for no info', function () {
			expect(detectUsbGeneration()).to.equal('Unknown');
		});

		it('should detect USB 3.2', function () {
			expect(detectUsbGeneration('USB', 'USB3.2 Gen 2 SSD')).to.equal('USB 3.2');
		});
	});

	describe('getSpeedInfo()', function () {
		it('should return speed info for USB 3.0', function () {
			const info = getSpeedInfo('USB 3.0');
			expect(info.typicalWriteMBps).to.equal(80);
			expect(info.maxTheoreticalMBps).to.equal(625);
		});

		it('should calculate estimated time', function () {
			const info = getSpeedInfo('USB 2.0');
			const time = info.estimatedTimeSeconds(4 * 1024 * 1024 * 1024); // 4GB
			expect(time).to.be.greaterThan(100); // 4GB / 25 MB/s ≈ 163s
		});
	});

	describe('formatEstimatedTime()', function () {
		it('should format seconds', function () {
			expect(formatEstimatedTime(45)).to.equal('~45s');
		});
		it('should format minutes', function () {
			expect(formatEstimatedTime(180)).to.equal('~3m');
		});
		it('should format minutes and seconds', function () {
			expect(formatEstimatedTime(95)).to.equal('~1m 35s');
		});
		it('should format hours', function () {
			expect(formatEstimatedTime(3700)).to.equal('~1h 1m');
		});
	});
});
