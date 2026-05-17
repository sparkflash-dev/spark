import { expect } from 'chai';
import {
	generateSummary,
	generateShortSummary,
} from '../../../lib/gui/app/utils/flash-summary';

describe('Flash summary', function () {
	const successResult = {
		imageName: 'ubuntu.iso',
		imageSize: 4 * 1024 * 1024 * 1024,
		targets: [{ device: '/dev/sdb', name: 'SanDisk', success: true }],
		startTime: 1000,
		endTime: 61000,
		verified: true,
		averageSpeed: 50 * 1024 * 1024,
	};

	const failResult = {
		...successResult,
		targets: [
			{ device: '/dev/sdb', name: 'SanDisk', success: true },
			{ device: '/dev/sdc', name: 'Kingston', success: false, error: 'Write error' },
		],
	};

	describe('generateSummary()', function () {
		it('should include image name and size', function () {
			const summary = generateSummary(successResult);
			expect(summary).to.include('ubuntu.iso');
			expect(summary).to.include('4.0 GB');
		});

		it('should include duration', function () {
			const summary = generateSummary(successResult);
			expect(summary).to.include('1m');
		});

		it('should include verification status', function () {
			expect(generateSummary(successResult)).to.include('passed');
			expect(generateSummary({ ...successResult, verified: false })).to.include('skipped');
		});

		it('should list failed targets', function () {
			const summary = generateSummary(failResult);
			expect(summary).to.include('Failed targets');
			expect(summary).to.include('Kingston');
			expect(summary).to.include('Write error');
		});
	});

	describe('generateShortSummary()', function () {
		it('should generate one-line for success', function () {
			const short = generateShortSummary(successResult);
			expect(short).to.include('ubuntu.iso');
			expect(short).to.include('1 target');
		});

		it('should show partial success', function () {
			const short = generateShortSummary(failResult);
			expect(short).to.include('1/2');
		});
	});
});
