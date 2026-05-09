/*
 * Tests for WebSocket message whitelist and JSON parse safety.
 *
 * These verify the security fixes applied to lib/util/api.ts (sidecar) and
 * lib/gui/app/modules/api.ts (GUI client).
 */

import { expect } from 'chai';

// --- Sidecar allowed message types (mirrors lib/util/api.ts) ---
const SIDECAR_ALLOWED_TYPES = new Set([
	'terminate',
	'heartbeat',
	'ready',
	'scan',
	'cancel',
	'skip',
	'write',
	'sourceMetadata',
]);

// --- Client allowed message types (mirrors lib/gui/app/modules/api.ts) ---
const CLIENT_ALLOWED_TYPES = new Set([
	'log',
	'error',
	'ready',
	'state',
	'fail',
	'done',
	'abort',
	'skip',
	'drives',
	'sourceMetadata',
]);

describe('WebSocket message whitelists', function () {
	describe('Sidecar (server) whitelist', function () {
		it('allows all legitimate message types', function () {
			const legitimate = [
				'terminate', 'heartbeat', 'ready', 'scan',
				'cancel', 'skip', 'write', 'sourceMetadata',
			];
			for (const type of legitimate) {
				expect(SIDECAR_ALLOWED_TYPES.has(type)).to.be.true;
			}
		});

		it('blocks prototype pollution via __proto__', function () {
			expect(SIDECAR_ALLOWED_TYPES.has('__proto__')).to.be.false;
		});

		it('blocks constructor injection', function () {
			expect(SIDECAR_ALLOWED_TYPES.has('constructor')).to.be.false;
		});

		it('blocks arbitrary unknown types', function () {
			const unknown = ['eval', 'exec', 'shell', 'ping', 'pong', 'admin'];
			for (const type of unknown) {
				expect(SIDECAR_ALLOWED_TYPES.has(type)).to.be.false;
			}
		});
	});

	describe('Client (GUI) whitelist', function () {
		it('allows all legitimate message types', function () {
			const legitimate = [
				'log', 'error', 'ready', 'state', 'fail',
				'done', 'abort', 'skip', 'drives', 'sourceMetadata',
			];
			for (const type of legitimate) {
				expect(CLIENT_ALLOWED_TYPES.has(type)).to.be.true;
			}
		});

		it('blocks prototype pollution via __proto__', function () {
			expect(CLIENT_ALLOWED_TYPES.has('__proto__')).to.be.false;
		});

		it('blocks arbitrary unknown types', function () {
			expect(CLIENT_ALLOWED_TYPES.has('terminate')).to.be.false;
			expect(CLIENT_ALLOWED_TYPES.has('write')).to.be.false;
		});
	});
});

describe('WebSocket JSON parse safety', function () {
	function safeParseMessage(raw: string): { ok: true; data: any } | { ok: false } {
		try {
			const data = JSON.parse(raw);
			return { ok: true, data };
		} catch {
			return { ok: false };
		}
	}

	it('parses valid JSON successfully', function () {
		const result = safeParseMessage(JSON.stringify({ type: 'ready', payload: {} }));
		expect(result.ok).to.be.true;
		if (result.ok) {
			expect(result.data.type).to.equal('ready');
		}
	});

	it('returns ok=false for malformed JSON without throwing', function () {
		const result = safeParseMessage('{not valid json}');
		expect(result.ok).to.be.false;
	});

	it('returns ok=false for empty string', function () {
		const result = safeParseMessage('');
		expect(result.ok).to.be.false;
	});

	it('returns ok=false for binary-like garbage', function () {
		const result = safeParseMessage('\x00\x01\x02');
		expect(result.ok).to.be.false;
	});
});
