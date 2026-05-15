import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
	exportSettings,
	importSettings,
	validateSettingsFile,
} from '../../../lib/gui/app/utils/config-export';

describe('Config export utilities', function () {
	let tmpDir: string;

	beforeEach(function () {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spark-config-'));
	});

	afterEach(function () {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	});

	describe('exportSettings()', function () {
		it('should export settings to JSON', function () {
			const filePath = path.join(tmpDir, 'export.json');
			const settings = { validateWriteOnSuccess: true, decompressFirst: false };
			exportSettings(settings, filePath);
			expect(fs.existsSync(filePath)).to.be.true;
			const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
			expect(data.settings.validateWriteOnSuccess).to.be.true;
		});

		it('should include version metadata', function () {
			const filePath = path.join(tmpDir, 'export.json');
			exportSettings({}, filePath);
			const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
			expect(data.version).to.be.a('string');
			expect(data.exportedAt).to.be.a('string');
		});
	});

	describe('validateSettingsFile()', function () {
		it('should validate correct settings file', function () {
			const filePath = path.join(tmpDir, 'valid.json');
			fs.writeFileSync(filePath, JSON.stringify({
				version: '3.1.0',
				exportedAt: new Date().toISOString(),
				settings: { validateWriteOnSuccess: true },
			}));
			const result = validateSettingsFile(filePath);
			expect(result.valid).to.be.true;
		});

		it('should reject non-JSON file', function () {
			const filePath = path.join(tmpDir, 'invalid.json');
			fs.writeFileSync(filePath, 'not json at all');
			const result = validateSettingsFile(filePath);
			expect(result.valid).to.be.false;
		});

		it('should reject file without version', function () {
			const filePath = path.join(tmpDir, 'noversion.json');
			fs.writeFileSync(filePath, JSON.stringify({ settings: {} }));
			const result = validateSettingsFile(filePath);
			expect(result.valid).to.be.false;
		});
	});
});
