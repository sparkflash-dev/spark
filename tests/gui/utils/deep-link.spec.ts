import { expect } from 'chai';
import {
	parseDeepLink,
	isDeepLink,
	buildDeepLink,
} from '../../../lib/gui/app/utils/deep-link';

describe('Deep link handler', function () {
	describe('parseDeepLink()', function () {
		it('should parse flash with local path', function () {
			const result = parseDeepLink('spark://flash?image=/tmp/ubuntu.iso');
			expect(result.action).to.equal('flash');
			expect(result.imagePath).to.equal('/tmp/ubuntu.iso');
		});

		it('should parse flash with URL', function () {
			const result = parseDeepLink('spark://flash?url=https://example.com/image.iso');
			expect(result.action).to.equal('flash');
			expect(result.imageUrl).to.equal('https://example.com/image.iso');
		});

		it('should error when no image or url provided', function () {
			const result = parseDeepLink('spark://flash');
			expect(result.error).to.include('No image');
		});

		it('should reject non-http URLs', function () {
			const result = parseDeepLink('spark://flash?url=ftp://evil.com/payload');
			expect(result.error).to.include('HTTP/HTTPS');
		});

		it('should handle unknown actions', function () {
			const result = parseDeepLink('spark://settings');
			expect(result.action).to.equal('unknown');
		});
	});

	describe('isDeepLink()', function () {
		it('should detect spark:// URLs', function () {
			expect(isDeepLink('spark://flash?image=test')).to.be.true;
		});

		it('should reject other protocols', function () {
			expect(isDeepLink('http://example.com')).to.be.false;
		});
	});

	describe('buildDeepLink()', function () {
		it('should build valid URL', function () {
			const link = buildDeepLink('/tmp/test.iso');
			expect(link).to.include('spark://flash');
			expect(link).to.include('image=');
		});
	});
});
