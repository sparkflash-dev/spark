import { expect } from 'chai';
import { RateLimiter, throttle, debounce } from '../../../lib/gui/app/utils/rate-limiter';

describe('Rate limiter', function () {
	describe('RateLimiter', function () {
		it('should call immediately on first invocation', function () {
			const limiter = new RateLimiter(1000);
			let called = false;
			limiter.call(() => { called = true; });
			expect(called).to.be.true;
		});

		it('should throttle rapid calls', function () {
			const limiter = new RateLimiter(1000);
			let count = 0;
			limiter.call(() => { count++; });
			limiter.call(() => { count++; });
			limiter.call(() => { count++; });
			// Only first should fire immediately
			expect(count).to.equal(1);
			limiter.cancel();
		});

		it('should cancel pending calls', function () {
			const limiter = new RateLimiter(100);
			let count = 0;
			limiter.call(() => { count++; });
			limiter.call(() => { count++; }); // Scheduled trailing
			limiter.cancel();
			// Only the immediate call should have fired
			expect(count).to.equal(1);
		});

		it('should reset state', function () {
			const limiter = new RateLimiter(1000);
			limiter.call(() => {});
			limiter.reset();
			let called = false;
			limiter.call(() => { called = true; });
			expect(called).to.be.true;
		});
	});

	describe('throttle()', function () {
		it('should create throttled function', function () {
			let count = 0;
			const fn = throttle(() => { count++; }, 1000);
			fn();
			fn();
			fn();
			expect(count).to.equal(1);
		});
	});

	describe('debounce()', function () {
		it('should create debounced function', function (done) {
			let count = 0;
			const fn = debounce(() => { count++; }, 50);
			fn();
			fn();
			fn();
			// Should not have fired yet
			expect(count).to.equal(0);
			setTimeout(() => {
				expect(count).to.equal(1);
				done();
			}, 100);
		});
	});
});
