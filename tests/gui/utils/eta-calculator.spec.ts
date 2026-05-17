import { expect } from 'chai';
import { ETACalculator, formatETA } from '../../../lib/gui/app/utils/eta-calculator';

describe('ETA Calculator', function () {
	describe('ETACalculator', function () {
		it('should return null on first update', function () {
			const calc = new ETACalculator(1000);
			expect(calc.update(0)).to.be.null;
		});

		it('should track speed', function () {
			const calc = new ETACalculator(10000);
			calc.update(0);
			// Simulate passage of time by directly checking speed after updates
			calc.update(5000);
			expect(calc.getSpeed()).to.be.gte(0);
		});

		it('should reset state', function () {
			const calc = new ETACalculator(1000);
			calc.update(500);
			calc.reset(2000);
			expect(calc.getSpeed()).to.equal(0);
		});

		it('should accept custom alpha', function () {
			const calc = new ETACalculator(1000, 0.5);
			expect(calc).to.be.instanceOf(ETACalculator);
		});
	});

	describe('formatETA()', function () {
		it('should show Calculating for null', function () {
			expect(formatETA(null)).to.equal('Calculating...');
		});

		it('should show Almost done for zero', function () {
			expect(formatETA(0)).to.equal('Almost done');
		});

		it('should show A few seconds for tiny values', function () {
			expect(formatETA(3)).to.equal('A few seconds');
		});

		it('should format seconds', function () {
			expect(formatETA(30)).to.include('30s');
		});

		it('should format minutes', function () {
			expect(formatETA(125)).to.include('2m');
		});

		it('should format hours', function () {
			expect(formatETA(7200)).to.include('2h');
		});
	});
});
