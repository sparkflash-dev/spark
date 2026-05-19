import { expect } from 'chai';
import {
	isFeatureEnabled,
	setFeatureFlag,
	resetFlags,
	getAllFlags,
} from '../../../lib/gui/app/utils/feature-flags';

describe('Feature flags', function () {
	afterEach(function () {
		resetFlags();
	});

	describe('isFeatureEnabled()', function () {
		it('should return true for default-enabled features', function () {
			expect(isFeatureEnabled('multiWrite')).to.be.true;
			expect(isFeatureEnabled('autoUpdate')).to.be.true;
			expect(isFeatureEnabled('flashQueue')).to.be.true;
		});
	});

	describe('setFeatureFlag()', function () {
		it('should override a flag', function () {
			setFeatureFlag('multiWrite', false);
			expect(isFeatureEnabled('multiWrite')).to.be.false;
		});

		it('should not affect other flags', function () {
			setFeatureFlag('multiWrite', false);
			expect(isFeatureEnabled('autoUpdate')).to.be.true;
		});
	});

	describe('resetFlags()', function () {
		it('should restore defaults', function () {
			setFeatureFlag('multiWrite', false);
			resetFlags();
			expect(isFeatureEnabled('multiWrite')).to.be.true;
		});
	});

	describe('getAllFlags()', function () {
		it('should return all flags', function () {
			const flags = getAllFlags();
			expect(flags).to.have.property('multiWrite');
			expect(flags).to.have.property('autoUpdate');
			expect(flags).to.have.property('flashQueue');
		});

		it('should include overrides', function () {
			setFeatureFlag('deepLinks', false);
			const flags = getAllFlags();
			expect(flags.deepLinks).to.be.false;
		});
	});
});
