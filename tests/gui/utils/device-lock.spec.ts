import { expect } from 'chai';
import {
	acquireLock,
	releaseLock,
	isLocked,
	releaseAll,
	getLockedDevices,
} from '../../../lib/gui/app/utils/device-lock';

describe('Device lock manager', function () {
	afterEach(function () {
		releaseAll();
	});

	describe('acquireLock()', function () {
		it('should acquire lock on available device', function () {
			const result = acquireLock('/dev/sdb', 'flash');
			expect(result.acquired).to.be.true;
			expect(result.device).to.equal('/dev/sdb');
		});

		it('should fail to acquire lock on already-locked device', function () {
			acquireLock('/dev/sdb', 'flash');
			const result = acquireLock('/dev/sdb', 'verify');
			expect(result.acquired).to.be.false;
			expect(result.error).to.include('locked');
		});

		it('should allow locking different devices', function () {
			expect(acquireLock('/dev/sdb').acquired).to.be.true;
			expect(acquireLock('/dev/sdc').acquired).to.be.true;
		});
	});

	describe('releaseLock()', function () {
		it('should release an existing lock', function () {
			acquireLock('/dev/sdb');
			expect(releaseLock('/dev/sdb')).to.be.true;
			expect(isLocked('/dev/sdb')).to.be.false;
		});

		it('should allow re-locking after release', function () {
			acquireLock('/dev/sdb');
			releaseLock('/dev/sdb');
			expect(acquireLock('/dev/sdb').acquired).to.be.true;
		});
	});

	describe('isLocked()', function () {
		it('should return true for locked devices', function () {
			acquireLock('/dev/sdb');
			expect(isLocked('/dev/sdb')).to.be.true;
		});

		it('should return false for unlocked devices', function () {
			expect(isLocked('/dev/sdb')).to.be.false;
		});
	});

	describe('getLockedDevices()', function () {
		it('should return all locked device paths', function () {
			acquireLock('/dev/sdb');
			acquireLock('/dev/sdc');
			const locked = getLockedDevices();
			expect(locked).to.have.lengthOf(2);
		});
	});
});
