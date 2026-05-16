import { expect } from 'chai';
import {
	isAllowedChannel,
	sanitizeIPCData,
	isExternalUrlSafe,
} from '../../../lib/gui/app/utils/secure-ipc';

describe('Secure IPC utilities', function () {
	describe('isAllowedChannel()', function () {
		it('should allow dialog:openFile', function () {
			expect(isAllowedChannel('dialog:openFile')).to.be.true;
		});

		it('should allow flash:start', function () {
			expect(isAllowedChannel('flash:start')).to.be.true;
		});

		it('should allow settings:get', function () {
			expect(isAllowedChannel('settings:get')).to.be.true;
		});

		it('should reject arbitrary channels', function () {
			expect(isAllowedChannel('evil:channel')).to.be.false;
		});

		it('should reject empty channel', function () {
			expect(isAllowedChannel('')).to.be.false;
		});

		it('should reject shell:exec (not in allowlist)', function () {
			expect(isAllowedChannel('shell:exec')).to.be.false;
		});
	});

	describe('sanitizeIPCData()', function () {
		it('should pass primitives through', function () {
			expect(sanitizeIPCData('hello')).to.equal('hello');
			expect(sanitizeIPCData(42)).to.equal(42);
			expect(sanitizeIPCData(true)).to.be.true;
			expect(sanitizeIPCData(null)).to.be.null;
		});

		it('should deep-clone objects', function () {
			const input = { a: 1, b: { c: 2 } };
			const output = sanitizeIPCData(input) as any;
			expect(output.a).to.equal(1);
			expect(output.b.c).to.equal(2);
		});

		it('should strip prototype properties', function () {
			const obj = Object.create({ inherited: true });
			obj.own = 'value';
			const output = sanitizeIPCData(obj) as any;
			expect(output.own).to.equal('value');
			expect(output.inherited).to.be.undefined;
		});
	});

	describe('isExternalUrlSafe()', function () {
		it('should allow https URLs', function () {
			expect(isExternalUrlSafe('https://github.com')).to.be.true;
		});

		it('should allow http URLs', function () {
			expect(isExternalUrlSafe('http://example.com')).to.be.true;
		});

		it('should reject file:// URLs', function () {
			expect(isExternalUrlSafe('file:///etc/passwd')).to.be.false;
		});

		it('should reject javascript: URLs', function () {
			expect(isExternalUrlSafe('javascript:alert(1)')).to.be.false;
		});

		it('should reject invalid URLs', function () {
			expect(isExternalUrlSafe('not a url')).to.be.false;
		});
	});
});
