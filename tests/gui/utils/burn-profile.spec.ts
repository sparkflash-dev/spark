import { expect } from 'chai';
import {
	PROFILES,
	getProfile,
	getDefaultProfile,
	getProfileIds,
} from '../../../lib/gui/app/utils/burn-profile';

describe('Burn profiles', function () {
	describe('PROFILES', function () {
		it('should have 4 profiles', function () {
			expect(PROFILES).to.have.lengthOf(4);
		});

		it('should all have required fields', function () {
			for (const p of PROFILES) {
				expect(p.id).to.be.a('string');
				expect(p.name).to.be.a('string');
				expect(p.description).to.be.a('string');
				expect(p.settings).to.have.property('verify');
				expect(p.settings).to.have.property('autoEject');
			}
		});

		it('fast profile should skip verification', function () {
			const fast = PROFILES.find((p) => p.id === 'fast')!;
			expect(fast.settings.verify).to.be.false;
			expect(fast.settings.badSectorCheck).to.be.false;
		});

		it('safe profile should enable all checks', function () {
			const safe = PROFILES.find((p) => p.id === 'safe')!;
			expect(safe.settings.verify).to.be.true;
			expect(safe.settings.badSectorCheck).to.be.true;
			expect(safe.settings.decompress).to.be.true;
		});
	});

	describe('getProfile()', function () {
		it('should find profile by ID', function () {
			expect(getProfile('fast')).to.exist;
			expect(getProfile('fast')!.name).to.equal('Fast');
		});

		it('should return undefined for unknown ID', function () {
			expect(getProfile('nonexistent')).to.be.undefined;
		});
	});

	describe('getDefaultProfile()', function () {
		it('should return balanced profile', function () {
			expect(getDefaultProfile().id).to.equal('balanced');
		});
	});

	describe('getProfileIds()', function () {
		it('should return all IDs', function () {
			const ids = getProfileIds();
			expect(ids).to.include('fast');
			expect(ids).to.include('balanced');
			expect(ids).to.include('safe');
			expect(ids).to.include('batch');
		});
	});
});
