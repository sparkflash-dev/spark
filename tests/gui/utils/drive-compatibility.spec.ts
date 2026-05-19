import { expect } from 'chai';
import { checkCompatibility } from '../../../lib/gui/app/utils/drive-compatibility';

describe('Drive compatibility checker', function () {
	const defaultImage = { size: 4e9, isCompressed: false };
	const defaultDrive = { size: 16e9, isReadOnly: false, isSystem: false, busType: 'USB', isRemovable: true };

	it('should pass for compatible setup', function () {
		const result = checkCompatibility(defaultImage, defaultDrive);
		expect(result.compatible).to.be.true;
		expect(result.errors).to.have.lengthOf(0);
	});

	it('should error for read-only drive', function () {
		const result = checkCompatibility(defaultImage, { ...defaultDrive, isReadOnly: true });
		expect(result.compatible).to.be.false;
		expect(result.errors[0]).to.include('read-only');
	});

	it('should error for too-small drive', function () {
		const result = checkCompatibility(defaultImage, { ...defaultDrive, size: 2e9 });
		expect(result.compatible).to.be.false;
		expect(result.errors[0]).to.include('too small');
	});

	it('should warn for system drive', function () {
		const result = checkCompatibility(defaultImage, { ...defaultDrive, isSystem: true });
		expect(result.warnings.some((w) => w.includes('system'))).to.be.true;
	});

	it('should warn for non-removable drive', function () {
		const result = checkCompatibility(defaultImage, { ...defaultDrive, isRemovable: false });
		expect(result.warnings.some((w) => w.includes('removable'))).to.be.true;
	});

	it('should account for compressed image size estimate', function () {
		const compressed = { size: 2e9, isCompressed: true, estimatedUncompressedSize: 8e9 };
		const result = checkCompatibility(compressed, { ...defaultDrive, size: 4e9 });
		expect(result.compatible).to.be.false;
	});

	it('should warn for barely enough space', function () {
		const result = checkCompatibility({ size: 15.5e9, isCompressed: false }, defaultDrive);
		expect(result.warnings.some((w) => w.includes('barely'))).to.be.true;
	});
});
