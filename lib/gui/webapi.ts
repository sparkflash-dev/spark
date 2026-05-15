//
// Anything exported from this module will become available to the
// renderer process via preload. They're accessible as `window.spark.foo()`.
//

import { ipcRenderer } from 'electron';

// Returns the path to the spark-util sidecar binary via the main process.
export async function getSparkUtilPath(): Promise<string> {
	const utilPath = await ipcRenderer.invoke('get-util-path');
	console.log(utilPath);
	return utilPath;
}
