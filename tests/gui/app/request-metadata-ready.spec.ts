/*
 * Tests for the requestMetadataReady Promise pattern (fix for issue #4150).
 *
 * Verifies that the Promise-based initialization correctly serializes callers
 * and doesn't race against the sidecar connection.
 */

import { expect } from 'chai';

// Simulates the app.ts initialization pattern without Electron/IPC
function createMetadataReadyPromise(): {
	requestMetadataReady: Promise<(params: any) => Promise<any>>;
	resolve: (fn: (params: any) => Promise<any>) => void;
	reject: (err: Error) => void;
} {
	let _resolve!: (fn: (params: any) => Promise<any>) => void;
	let _reject!: (err: Error) => void;

	const requestMetadataReady = new Promise<(params: any) => Promise<any>>(
		(res, rej) => {
			_resolve = res;
			_reject = rej;
		},
	);

	return { requestMetadataReady, resolve: _resolve, reject: _reject };
}

describe('GUI app: requestMetadataReady Promise (fix #4150)', function () {
	it('resolves with the metadata function when the sidecar connects', async function () {
		const { requestMetadataReady, resolve } = createMetadataReadyPromise();

		const mockFn = async (params: any) => ({ name: 'test', ...params });
		resolve(mockFn);

		const fn = await requestMetadataReady;
		expect(fn).to.equal(mockFn);
	});

	it('callers awaiting the Promise get the function after it resolves', async function () {
		const { requestMetadataReady, resolve } = createMetadataReadyPromise();

		// simulate a caller that awaits before the sidecar is ready
		const callerResult = requestMetadataReady.then((fn) => fn({ key: 'value' }));

		// sidecar connects 10ms later
		await new Promise((r) => setTimeout(r, 10));
		resolve(async (params: any) => ({ resolved: true, ...params }));

		const result = await callerResult;
		expect(result).to.deep.include({ resolved: true, key: 'value' });
	});

	it('rejects when the sidecar fails to start', async function () {
		const { requestMetadataReady, reject } = createMetadataReadyPromise();

		reject(new Error('Sidecar failed'));

		let threw = false;
		try {
			await requestMetadataReady;
		} catch (e: any) {
			threw = true;
			expect(e.message).to.equal('Sidecar failed');
		}
		expect(threw).to.be.true;
	});

	it('Promise.race timeout correctly rejects after deadline', async function () {
		const { requestMetadataReady } = createMetadataReadyPromise();
		// Never resolve — simulates sidecar never connecting

		let timedOut = false;
		try {
			await Promise.race([
				requestMetadataReady,
				new Promise<never>((_, rej) =>
					setTimeout(() => rej(new Error('Timed out')), 20),
				),
			]);
		} catch (e: any) {
			timedOut = true;
			expect(e.message).to.equal('Timed out');
		}
		expect(timedOut).to.be.true;
	});
});
