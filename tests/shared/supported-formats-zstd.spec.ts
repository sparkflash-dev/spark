/*
 * Tests for zstd/zst support added in supported-formats.ts
 */

import { expect } from 'chai';
import * as supportedFormats from '../../lib/shared/supported-formats';

describe('Shared: SupportedFormats — zstd support', function () {
	it('should include zst in SUPPORTED_EXTENSIONS', function () {
		expect(supportedFormats.SUPPORTED_EXTENSIONS).to.include('zst');
	});

	it('should include zstd in SUPPORTED_EXTENSIONS', function () {
		expect(supportedFormats.SUPPORTED_EXTENSIONS).to.include('zstd');
	});

	it('should have unique extensions (no duplicates)', function () {
		const exts = supportedFormats.SUPPORTED_EXTENSIONS;
		expect(exts.length).to.equal(new Set(exts).size);
	});

	it('should still include existing formats (gz, xz, zip, img)', function () {
		const exts = supportedFormats.SUPPORTED_EXTENSIONS;
		for (const fmt of ['gz', 'xz', 'zip', 'img', 'iso']) {
			expect(exts).to.include(fmt);
		}
	});
});
