import { expect } from 'chai';
import {
	notifyFlashComplete,
	notifyFlashError,
	notifyQueueComplete,
} from '../../../lib/gui/app/utils/notifications';

describe('Notification utilities', function () {
	describe('notifyFlashComplete()', function () {
		it('should not throw when notifications unavailable', function () {
			expect(() => notifyFlashComplete('ubuntu.iso', 1)).to.not.throw();
		});

		it('should not throw for multiple targets', function () {
			expect(() => notifyFlashComplete('fedora.iso', 3)).to.not.throw();
		});
	});

	describe('notifyFlashError()', function () {
		it('should not throw when notifications unavailable', function () {
			expect(() => notifyFlashError('image.img', 'Write failed')).to.not.throw();
		});
	});

	describe('notifyQueueComplete()', function () {
		it('should not throw for successful queue', function () {
			expect(() => notifyQueueComplete(5, 0)).to.not.throw();
		});

		it('should not throw for partially failed queue', function () {
			expect(() => notifyQueueComplete(5, 2)).to.not.throw();
		});
	});
});
