/*
 * Tests for flash duration tracking (fix for issue #3428).
 */

import { expect } from 'chai';
import * as flashState from '../../../lib/gui/app/models/flash-state';

describe('Model: flashState — duration tracking', function () {
	beforeEach(function () {
		flashState.resetState();
	});

	it('returns null before any flash has started', function () {
		expect(flashState.getFlashDurationSeconds()).to.be.null;
	});

	it('returns null after setFlashingFlag but before unsetFlashingFlag', function () {
		flashState.setFlashingFlag();
		expect(flashState.getFlashDurationSeconds()).to.be.null;
	});

	it('returns a non-negative number after a complete flash cycle', function () {
		flashState.setFlashingFlag();
		flashState.unsetFlashingFlag({ cancelled: false });
		const duration = flashState.getFlashDurationSeconds();
		expect(duration).to.be.a('number');
		expect(duration as number).to.be.greaterThanOrEqual(0);
	});

	it('returns a rounded integer (seconds)', function () {
		flashState.setFlashingFlag();
		flashState.unsetFlashingFlag({ cancelled: false });
		const duration = flashState.getFlashDurationSeconds();
		expect(Number.isInteger(duration)).to.be.true;
	});

	it('resets correctly — null after resetState', function () {
		flashState.setFlashingFlag();
		flashState.unsetFlashingFlag({ cancelled: false });
		// duration is set
		expect(flashState.getFlashDurationSeconds()).to.not.be.null;
		// Now a second flash — should start fresh
		flashState.setFlashingFlag();
		// end time cleared, start time set → null until unset
		expect(flashState.getFlashDurationSeconds()).to.be.null;
	});
});
