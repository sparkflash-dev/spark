/** This function will :
 * 	- start the ipc server (api)
 *  - spawn the child process (privileged or not)
 *  - wait for the child process to connect to the api
 *  - return a promise that will resolve with the emit function for the api
 *
 * //TODO:
 *  - this should be refactored to reverse the control flow:
 *    - the child process should be the server
 *    - this should be the client
 *  - replace the current node-ipc api with a websocket api
 *  - centralise the api for both the writer and the scanner instead of having two instances running
 */

import WebSocket from 'ws'; // (no types for wrapper, this is expected)
import { spawn } from 'child_process';
import * as os from 'os';
import * as packageJSON from '../../../../package.json';
import * as permissions from '../../../shared/permissions';
import * as errors from '../../../shared/errors';

const THREADS_PER_CPU = 16;
const connectionRetryDelay = 1000;
const connectionRetryAttempts = 10;

async function writerArgv(): Promise<string[]> {
	let entryPoint = await window.etcher.getEtcherUtilPath();
	// AppImages run over FUSE, so the files inside the mount point
	// can only be accessed by the user that mounted the AppImage.
	// This means we can't re-spawn Etcher as root from the same
	// mount-point, and as a workaround, we re-mount the original
	// AppImage as root.
	if (os.platform() === 'linux' && process.env.APPIMAGE && process.env.APPDIR) {
		entryPoint = entryPoint.replace(process.env.APPDIR, '');
		return [
			process.env.APPIMAGE,
			'-e',
			`require(\`\${process.env.APPDIR}${entryPoint}\`)`,
		];
	} else {
		return [entryPoint];
	}
}

async function spawnChild(
	withPrivileges: boolean,
	etcherServerId: string,
	etcherServerAddress: string,
	etcherServerPort: string,
) {
	const argv = await writerArgv();
	const env: any = {
		ETCHER_SERVER_ADDRESS: etcherServerAddress,
		ETCHER_SERVER_ID: etcherServerId,
		ETCHER_SERVER_PORT: etcherServerPort,
		UV_THREADPOOL_SIZE: (os.cpus().length * THREADS_PER_CPU).toString(),
		// This environment variable prevents the AppImages
		// desktop integration script from presenting the
		// "installation" dialog
		SKIP: '1',
		...(process.platform === 'win32' ? {} : process.env),
	};

	if (withPrivileges) {
		console.log('... with privileges ...');
		return permissions.elevateCommand(argv, {
			applicationName: packageJSON.displayName,
			env,
		});
	} else {
		if (process.platform === 'win32') {
			// Reset env vars using execFile (not exec) to prevent shell injection.
			// Each variable is set via a separate SetEnvironmentVariable call.
			const { execFile } = await import('child_process');
			for (const [key, value] of Object.entries(env)) {
				// Validate key: only alphanumeric + underscore allowed
				if (!/^\w+$/.test(key)) continue;
				await new Promise<void>((resolve, reject) => {
					execFile(
						'cmd.exe',
						['/C', `set "${key}=${String(value).replace(/"/g, '')}"`],
						(err) => (err ? reject(err) : resolve()),
					);
				});
			}
		}
		const spawned = await spawn(argv[0], argv.slice(1), {
			env,
		});
		return { cancelled: false, spawned };
	}
}

type ChildApi = {
	emit: (type: string, payload: any) => void;
	registerHandler: (event: string, handler: any) => void;
	failed: boolean;
};

async function connectToChildProcess(
	etcherServerAddress: string,
	etcherServerPort: string,
	etcherServerId: string,
): Promise<ChildApi | { failed: boolean }> {
	return new Promise((resolve, reject) => {
		// TODO: default to IPC connections https://github.com/websockets/ws/blob/master/doc/ws.md#ipc-connections
		// TODO: use the path as cheap authentication

		console.log(etcherServerId);

		const url = `ws://${etcherServerAddress}:${etcherServerPort}`;

		const ws = new WebSocket(url);

		let heartbeat: any;

		const startHeartbeat = (emit: any) => {
			console.log('start heartbeat');
			heartbeat = setInterval(() => {
				emit('heartbeat', {});
			}, 1000);
		};

		const stopHeartbeat = () => {
			console.log('stop heartbeat');
			clearInterval(heartbeat);
		};

		ws.on('error', (error: any) => {
			if (error.code === 'ECONNREFUSED') {
				resolve({
					failed: true,
				});
			} else {
				stopHeartbeat();
				reject({
					failed: true,
				});
			}
		});

		ws.on('open', () => {
			const emit = (type: string, payload: any) => {
				ws.send(JSON.stringify({ type, payload }));
			};

			emit('ready', {});

			// parse and route messages
			const messagesHandler: any = {
				log: (message: any) => {
					console.log(`CHILD LOG: ${message}`);
				},

				error: (error: any) => {
					const errorObject = errors.fromJSON(error);
					console.error('CHILD ERROR', errorObject);
					stopHeartbeat();
				},

				// once api is ready (means child process is connected) we pass the emit function to the caller
				ready: () => {
					console.log('CHILD READY');

					startHeartbeat(emit);

					resolve({
						failed: false,
						emit,
						registerHandler,
					});
				},
			};

			const CLIENT_ALLOWED_TYPES = new Set([
				'log', 'error', 'ready', 'state', 'fail',
				'done', 'abort', 'skip', 'drives', 'sourceMetadata',
			]);

			ws.on('message', (jsonData: any) => {
				let data: any;
				try {
					data = JSON.parse(jsonData);
				} catch {
					console.error('Received malformed JSON from sidecar — ignoring');
					return;
				}
				if (typeof data.type !== 'string' || !CLIENT_ALLOWED_TYPES.has(data.type)) {
					console.error(`Unknown message type from sidecar: ${data.type}`);
					return;
				}
				const message = messagesHandler[data.type];
				if (message) {
					message(data.payload);
				}
			});

			// api to register more handlers with callbacks
			const registerHandler = (event: string, handler: any) => {
				messagesHandler[event] = handler;
			};
		});
	});
}

async function spawnChildAndConnect({
	withPrivileges,
}: {
	withPrivileges: boolean;
}): Promise<ChildApi> {
	const etcherServerAddress = process.env.ETCHER_SERVER_ADDRESS ?? '127.0.0.1'; // localhost
	const etcherServerPort =
		process.env.ETCHER_SERVER_PORT ?? withPrivileges ? '3435' : '3434';
	const etcherServerId =
		process.env.ETCHER_SERVER_ID ??
		`etcher-${Math.random().toString(36).substring(7)}`;

	console.log(
		`Starting ${
			withPrivileges ? 'privileged' : 'unprivileged'
		} flasher sidecar on port ${etcherServerPort}`,
	);

	// spawn the child process, which will act as the ws server
	// ETCHER_NO_SPAWN_UTIL can be set to launch a GUI only version of etcher, in that case you'll probably want to set other ENV to match your setup
	if (!process.env.ETCHER_NO_SPAWN_UTIL) {
		try {
			const result = await spawnChild(
				withPrivileges,
				etcherServerId,
				etcherServerAddress,
				etcherServerPort,
			);
			if (result.cancelled) {
				throw new Error('Starting flasher sidecar process was cancelled');
			}
		} catch (error) {
			console.error('Error starting flasher sidecar process', error);
			throw new Error('Error starting flasher sidecar process');
		}
	}

	// try to connect to the ws server, retrying if necessary, until the connection is established
	try {
		let retry = 0;
		while (retry < connectionRetryAttempts) {
			const result = await connectToChildProcess(
				etcherServerAddress,
				etcherServerPort,
				etcherServerId,
			);
			if (result.failed) {
				retry++;
				console.log(
					`Connection to sidecar flasher process attempt ${retry} / ${connectionRetryAttempts} failed; retrying in ${connectionRetryDelay}ms...`,
				);
				await new Promise((resolve) =>
					setTimeout(resolve, connectionRetryDelay),
				);
				continue;
			}
			// result.failed is false here — emit and registerHandler are present
			return result as ChildApi;
		}
		throw new Error('Connection to sidecar flasher process timed out');
	} catch (error) {
		console.error('Error connecting to sidecar flasher process:', error);
		throw new Error('Connection to sidecar flasher process failed');
	}
}

export { spawnChildAndConnect };
