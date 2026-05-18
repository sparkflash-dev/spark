import { expect } from 'chai';
import {
	hexToRgb,
	rgbToHex,
	darken,
	lighten,
	withAlpha,
	getContrastTextColor,
} from '../../../lib/gui/app/utils/color-utils';

describe('Color utilities', function () {
	describe('hexToRgb()', function () {
		it('should parse hex color', function () {
			const rgb = hexToRgb('#ff0000');
			expect(rgb).to.deep.equal({ r: 255, g: 0, b: 0 });
		});

		it('should handle without hash', function () {
			const rgb = hexToRgb('00ff00');
			expect(rgb).to.deep.equal({ r: 0, g: 255, b: 0 });
		});

		it('should return null for invalid', function () {
			expect(hexToRgb('xyz')).to.be.null;
		});
	});

	describe('rgbToHex()', function () {
		it('should convert RGB to hex', function () {
			expect(rgbToHex(255, 0, 0)).to.equal('#ff0000');
		});

		it('should clamp values', function () {
			expect(rgbToHex(300, -10, 128)).to.equal('#ff0080');
		});
	});

	describe('darken()', function () {
		it('should darken a color', function () {
			const result = darken('#ffffff', 50);
			const rgb = hexToRgb(result)!;
			expect(rgb.r).to.be.lessThan(255);
			expect(rgb.r).to.equal(rgb.g);
		});
	});

	describe('lighten()', function () {
		it('should lighten a color', function () {
			const result = lighten('#000000', 50);
			const rgb = hexToRgb(result)!;
			expect(rgb.r).to.be.greaterThan(0);
		});
	});

	describe('withAlpha()', function () {
		it('should return rgba string', function () {
			expect(withAlpha('#ff0000', 0.5)).to.equal('rgba(255, 0, 0, 0.5)');
		});
	});

	describe('getContrastTextColor()', function () {
		it('should return white for dark backgrounds', function () {
			expect(getContrastTextColor('#000000')).to.equal('#ffffff');
		});

		it('should return black for light backgrounds', function () {
			expect(getContrastTextColor('#ffffff')).to.equal('#000000');
		});
	});
});
