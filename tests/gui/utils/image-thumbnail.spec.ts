import { expect } from 'chai';
import {
	detectImageOS,
	getOSColor,
	getOSLabel,
} from '../../../lib/gui/app/utils/image-thumbnail';

describe('Image thumbnail utilities', function () {
	describe('detectImageOS()', function () {
		it('should detect Ubuntu', function () {
			expect(detectImageOS('ubuntu-22.04-desktop-amd64.iso')).to.equal('ubuntu');
		});

		it('should detect Kubuntu as Ubuntu variant', function () {
			expect(detectImageOS('kubuntu-24.04.iso')).to.equal('ubuntu');
		});

		it('should detect Fedora', function () {
			expect(detectImageOS('Fedora-Workstation-40.iso')).to.equal('fedora');
		});

		it('should detect Debian', function () {
			expect(detectImageOS('debian-12.5-amd64-netinst.iso')).to.equal('debian');
		});

		it('should detect Arch Linux', function () {
			expect(detectImageOS('archlinux-2024.05.01-x86_64.iso')).to.equal('arch');
		});

		it('should detect Manjaro as Arch variant', function () {
			expect(detectImageOS('manjaro-kde-24.0.iso')).to.equal('arch');
		});

		it('should detect Windows', function () {
			expect(detectImageOS('Win11_24H2_English_x64.iso')).to.equal('windows');
		});

		it('should detect Raspberry Pi', function () {
			expect(detectImageOS('raspios-bookworm-arm64.img.xz')).to.equal('raspberrypi');
		});

		it('should detect Android/LineageOS', function () {
			expect(detectImageOS('lineage-21.0-x86_64.iso')).to.equal('android');
		});

		it('should return generic for unknown', function () {
			expect(detectImageOS('my-custom-image.iso')).to.equal('generic');
		});
	});

	describe('getOSColor()', function () {
		it('should return orange for Ubuntu', function () {
			expect(getOSColor('ubuntu')).to.equal('#E95420');
		});

		it('should return blue for Fedora', function () {
			expect(getOSColor('fedora')).to.equal('#3C6EB4');
		});
	});

	describe('getOSLabel()', function () {
		it('should return display name', function () {
			expect(getOSLabel('ubuntu')).to.equal('Ubuntu');
			expect(getOSLabel('raspberrypi')).to.equal('Raspberry Pi OS');
			expect(getOSLabel('generic')).to.equal('Disk Image');
		});
	});
});
