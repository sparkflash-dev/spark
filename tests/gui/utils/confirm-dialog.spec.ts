import { expect } from 'chai';
import { checkConfirmation } from '../../../lib/gui/app/utils/confirm-dialog';

describe('Confirmation dialog logic', function () {
	it('should flag system drives as danger', function () {
		const result = checkConfirmation({
			imageName: 'test.iso',
			imageSize: 1e9,
			targetCount: 1,
			targets: [{ name: 'sda', size: 500e9, isSystem: true, mountpoints: ['/'] }],
			isLargeTarget: false,
		});
		expect(result.severity).to.equal('danger');
		expect(result.title).to.include('System');
	});

	it('should warn about mounted drives', function () {
		const result = checkConfirmation({
			imageName: 'test.iso',
			imageSize: 1e9,
			targetCount: 1,
			targets: [{ name: 'sdb', size: 16e9, isSystem: false, mountpoints: ['/media/usb'] }],
			isLargeTarget: false,
		});
		expect(result.severity).to.equal('warning');
		expect(result.message).to.include('/media/usb');
	});

	it('should warn about large drives', function () {
		const result = checkConfirmation({
			imageName: 'test.iso',
			imageSize: 1e9,
			targetCount: 1,
			targets: [{ name: 'sdb', size: 500e9, isSystem: false, mountpoints: [] }],
			isLargeTarget: true,
		});
		expect(result.severity).to.equal('warning');
		expect(result.title).to.include('Large');
	});

	it('should warn about multiple targets', function () {
		const result = checkConfirmation({
			imageName: 'test.iso',
			imageSize: 1e9,
			targetCount: 3,
			targets: [
				{ name: 'sdb', size: 16e9, isSystem: false, mountpoints: [] },
				{ name: 'sdc', size: 16e9, isSystem: false, mountpoints: [] },
				{ name: 'sdd', size: 16e9, isSystem: false, mountpoints: [] },
			],
			isLargeTarget: false,
		});
		expect(result.severity).to.equal('warning');
		expect(result.message).to.include('3 drives');
	});

	it('should show info for simple single target', function () {
		const result = checkConfirmation({
			imageName: 'ubuntu.iso',
			imageSize: 4e9,
			targetCount: 1,
			targets: [{ name: 'sdb', size: 16e9, isSystem: false, mountpoints: [] }],
			isLargeTarget: false,
		});
		expect(result.severity).to.equal('info');
		expect(result.message).to.include('ubuntu.iso');
	});
});
