import { expect } from 'chai';
import {
	looksLikeWindowsImage,
	getWindowsImageDetails,
} from '../../lib/shared/supported-formats';

describe('Windows ISO detection', function () {
	describe('looksLikeWindowsImage()', function () {
		it('should detect Win11 ISOs', function () {
			expect(looksLikeWindowsImage('Win11_24H2_English_x64.iso')).to.be.true;
		});

		it('should detect Win10 ISOs', function () {
			expect(looksLikeWindowsImage('Win10_22H2_English_x64v2.iso')).to.be.true;
		});

		it('should detect Windows in various casing', function () {
			expect(looksLikeWindowsImage('WINDOWS_11_PRO.iso')).to.be.true;
			expect(looksLikeWindowsImage('windows10.iso')).to.be.true;
		});

		it('should detect Windows Server', function () {
			expect(looksLikeWindowsImage('win_server_2022.iso')).to.be.true;
		});

		it('should detect Windows Vista', function () {
			expect(looksLikeWindowsImage('WinVista_Ultimate.iso')).to.be.true;
		});

		it('should not detect non-Windows images', function () {
			expect(looksLikeWindowsImage('ubuntu-24.04-desktop-amd64.iso')).to.be
				.false;
			expect(looksLikeWindowsImage('archlinux-2024.01.01-x86_64.iso')).to.be
				.false;
		});
	});

	describe('getWindowsImageDetails()', function () {
		it('should detect Windows 11', function () {
			const details = getWindowsImageDetails('Win11_24H2_English_x64.iso');
			expect(details.detected).to.be.true;
			expect(details.version).to.equal('Windows 11');
		});

		it('should detect Windows 10 Pro', function () {
			const details = getWindowsImageDetails(
				'Win10_Pro_22H2_English_x64.iso',
			);
			expect(details.detected).to.be.true;
			expect(details.version).to.equal('Windows 10');
			expect(details.edition).to.equal('Pro');
		});

		it('should detect Enterprise edition', function () {
			const details = getWindowsImageDetails(
				'windows_11_enterprise_ltsc.iso',
			);
			expect(details.detected).to.be.true;
			expect(details.version).to.equal('Windows 11');
			expect(details.edition).to.equal('Enterprise');
		});

		it('should detect LTSC edition', function () {
			const details = getWindowsImageDetails(
				'windows_10_ltsc_2021.iso',
			);
			expect(details.detected).to.be.true;
			expect(details.edition).to.equal('LTSC');
		});

		it('should return detected:false for non-Windows', function () {
			const details = getWindowsImageDetails('ubuntu.iso');
			expect(details.detected).to.be.false;
			expect(details.version).to.be.undefined;
		});
	});
});
