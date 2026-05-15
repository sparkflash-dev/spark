import { expect } from 'chai';
import {
	detectPersistenceSupport,
	isLiveLinuxISO,
	getPersistenceFilename,
	getPersistenceDescription,
} from '../../../lib/gui/app/utils/persistent-storage';

describe('Persistent storage utilities', function () {
	describe('detectPersistenceSupport()', function () {
		it('should detect Ubuntu live ISO', function () {
			const result = detectPersistenceSupport(
				'ubuntu-24.04-desktop-amd64.iso',
			);
			expect(result.supported).to.be.true;
			expect(result.distro).to.equal('Ubuntu');
			expect(result.method).to.equal('casper-rw');
		});

		it('should detect Linux Mint ISO', function () {
			const result = detectPersistenceSupport(
				'linuxmint-21.3-cinnamon-64bit.iso',
			);
			expect(result.supported).to.be.true;
			expect(result.distro).to.equal('Linux Mint');
		});

		it('should detect Kubuntu ISO', function () {
			const result = detectPersistenceSupport(
				'kubuntu-24.04-desktop-amd64.iso',
			);
			expect(result.supported).to.be.true;
			expect(result.distro).to.equal('Kubuntu');
		});

		it('should detect Pop!_OS ISO', function () {
			const result = detectPersistenceSupport(
				'pop-os_22.04_amd64_intel_11.iso',
			);
			expect(result.supported).to.be.true;
			expect(result.distro).to.equal('Pop!_OS');
		});

		it('should not detect Arch Linux (no casper-rw support)', function () {
			const result = detectPersistenceSupport(
				'archlinux-2024.01.01-x86_64.iso',
			);
			expect(result.supported).to.be.false;
		});

		it('should not detect Windows ISOs', function () {
			const result = detectPersistenceSupport('Win11_24H2.iso');
			expect(result.supported).to.be.false;
		});

		it('should provide suggested sizes', function () {
			const result = detectPersistenceSupport('ubuntu-24.04.iso');
			expect(result.suggestedSizes).to.have.length.greaterThan(0);
			expect(result.suggestedSizes[0]).to.be.a('number');
		});
	});

	describe('isLiveLinuxISO()', function () {
		it('should return true for Ubuntu ISO', function () {
			expect(isLiveLinuxISO('ubuntu-24.04-desktop-amd64.iso')).to.be.true;
		});

		it('should return false for non-ISO files', function () {
			expect(isLiveLinuxISO('ubuntu-24.04.img')).to.be.false;
		});

		it('should return false for non-Linux ISOs', function () {
			expect(isLiveLinuxISO('freebsd-14.0-RELEASE-amd64.iso')).to.be.false;
		});
	});

	describe('getPersistenceFilename()', function () {
		it('should return casper-rw for casper method', function () {
			expect(getPersistenceFilename('casper-rw')).to.equal('casper-rw');
		});

		it('should return writable for writable method', function () {
			expect(getPersistenceFilename('writable')).to.equal('writable');
		});
	});

	describe('getPersistenceDescription()', function () {
		it('should return description for supported config', function () {
			const desc = getPersistenceDescription({
				supported: true,
				method: 'casper-rw',
				distro: 'Ubuntu',
				suggestedSizes: [512, 1024],
			});
			expect(desc).to.include('Ubuntu');
			expect(desc).to.include('casper-rw');
		});

		it('should return empty string for unsupported', function () {
			const desc = getPersistenceDescription({
				supported: false,
				method: null,
				suggestedSizes: [],
			});
			expect(desc).to.equal('');
		});
	});
});
