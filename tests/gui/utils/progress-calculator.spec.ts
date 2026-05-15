import { expect } from 'chai';
import {
	ProgressCalculator,
	formatDuration,
	formatSpeed,
} from '../../../lib/gui/app/utils/progress-calculator';

describe('Progress calculator', function () {
	describe('ProgressCalculator', function () {
		it('should track progress percentage', function () {
			const calc = new ProgressCalculator(1000);
			const state = calc.update(500);
			expect(state.percentage).to.equal(50);
		});

		it('should report bytes written', function () {
			const calc = new ProgressCalculator(2000);
			const state = calc.update(750);
			expect(state.bytesWritten).to.equal(750);
			expect(state.totalBytes).to.equal(2000);
		});

		it('should handle zero total bytes', function () {
			const calc = new ProgressCalculator(0);
			const state = calc.update(0);
			expect(state.percentage).to.equal(0);
		});

		it('should reset state', function () {
			const calc = new ProgressCalculator(1000);
			calc.update(500);
			calc.reset(2000);
			const state = calc.update(100);
			expect(state.totalBytes).to.equal(2000);
			expect(state.bytesWritten).to.equal(100);
		});
	});

	describe('formatDuration()', function () {
		it('should format seconds', function () {
			expect(formatDuration(45)).to.equal('45s');
		});

		it('should format minutes', function () {
			expect(formatDuration(120)).to.equal('2m');
		});

		it('should format minutes and seconds', function () {
			expect(formatDuration(95)).to.equal('1m 35s');
		});

		it('should format hours', function () {
			expect(formatDuration(7200)).to.equal('2h 0m');
		});

		it('should handle negative', function () {
			expect(formatDuration(-1)).to.equal('--');
		});
	});

	describe('formatSpeed()', function () {
		it('should format MB/s', function () {
			expect(formatSpeed(50 * 1024 * 1024)).to.equal('50.0 MB/s');
		});

		it('should format KB/s for slow speeds', function () {
			expect(formatSpeed(512 * 1024)).to.equal('512 KB/s');
		});

		it('should format GB/s for very fast speeds', function () {
			expect(formatSpeed(2 * 1024 * 1024 * 1024)).to.equal('2.0 GB/s');
		});
	});
});
