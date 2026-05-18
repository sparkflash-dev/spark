import { expect } from 'chai';
import {
	recordFlash,
	getSessionStats,
	getUptime,
	formatSessionStats,
	resetStats,
} from '../../../lib/gui/app/utils/session-timer';

describe('Session timer', function () {
	beforeEach(function () {
		resetStats();
	});

	describe('recordFlash()', function () {
		it('should increment flash count', function () {
			recordFlash(1e9, 30000);
			const stats = getSessionStats();
			expect(stats.totalFlashes).to.equal(1);
			expect(stats.totalBytesWritten).to.equal(1e9);
		});

		it('should accumulate multiple flashes', function () {
			recordFlash(1e9, 30000);
			recordFlash(2e9, 60000);
			const stats = getSessionStats();
			expect(stats.totalFlashes).to.equal(2);
			expect(stats.totalBytesWritten).to.equal(3e9);
			expect(stats.totalDuration).to.equal(90000);
		});

		it('should set lastFlashTime', function () {
			const before = Date.now();
			recordFlash(1e9, 30000);
			const stats = getSessionStats();
			expect(stats.lastFlashTime).to.be.gte(before);
		});
	});

	describe('getUptime()', function () {
		it('should return positive number', function () {
			expect(getUptime()).to.be.gte(0);
		});
	});

	describe('formatSessionStats()', function () {
		it('should include session duration', function () {
			expect(formatSessionStats()).to.include('Session');
		});

		it('should include flash count after recording', function () {
			recordFlash(4e9, 120000);
			const formatted = formatSessionStats();
			expect(formatted).to.include('Flashes: 1');
			expect(formatted).to.include('GB');
		});
	});
});
