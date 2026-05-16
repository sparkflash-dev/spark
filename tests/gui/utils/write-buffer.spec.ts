import { expect } from 'chai';
import {
	calculateBufferSize,
	getReadChunkSize,
	hasEnoughMemory,
} from '../../../lib/gui/app/utils/write-buffer';

describe('Write buffer utilities', function () {
	describe('calculateBufferSize()', function () {
		it('should return default config without speed info', function () {
			const config = calculateBufferSize();
			expect(config.size).to.be.gte(512 * 1024);
			expect(config.size).to.be.lte(64 * 1024 * 1024);
			expect(config.count).to.be.gte(2);
		});

		it('should increase buffer for fast drives', function () {
			const fast = calculateBufferSize(100 * 1024 * 1024); // 100 MB/s
			const slow = calculateBufferSize(5 * 1024 * 1024); // 5 MB/s
			expect(fast.size).to.be.gt(slow.size);
		});

		it('should not exceed maximum buffer size', function () {
			const config = calculateBufferSize(1024 * 1024 * 1024); // 1 GB/s
			expect(config.size).to.be.lte(64 * 1024 * 1024);
		});

		it('should not go below minimum buffer size', function () {
			const config = calculateBufferSize(100); // 100 B/s
			expect(config.size).to.be.gte(512 * 1024);
		});

		it('should have at least 2 buffers (double buffering)', function () {
			const config = calculateBufferSize();
			expect(config.count).to.be.gte(2);
		});
	});

	describe('getReadChunkSize()', function () {
		it('should return smaller chunks for network sources', function () {
			const net = getReadChunkSize(false, true);
			const local = getReadChunkSize(false, false);
			expect(net).to.be.lt(local);
		});

		it('should return medium chunks for compressed files', function () {
			const compressed = getReadChunkSize(true, false);
			const raw = getReadChunkSize(false, false);
			expect(compressed).to.be.lt(raw);
		});

		it('should return largest chunks for raw local files', function () {
			const raw = getReadChunkSize(false, false);
			expect(raw).to.equal(8 * 1024 * 1024);
		});
	});

	describe('hasEnoughMemory()', function () {
		it('should return boolean', function () {
			const result = hasEnoughMemory(4 * 1024 * 1024 * 1024);
			expect(result).to.be.a('boolean');
		});
	});
});
