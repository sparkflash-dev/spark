/*
 * Copyright 2016 balena.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { basename } from 'path';

export const SUPPORTED_EXTENSIONS = [
	'bin',
	'bz2',
	'dmg',
	'dsk',
	'etch',
	'gz',
	'hddimg',
	'img',
	'iso',
	'raw',
	'rpi-sdimg',
	'sdcard',
	'vhd',
	'wic',
	'xz',
	'zip',
	'zst',
	'zstd',
];

export function looksLikeWindowsImage(imagePath: string): boolean {
	const regex = /windows|win7|win8|win10|win11|winxp|win_?vista|win_?server/i;
	return regex.test(basename(imagePath));
}

export interface WindowsImageDetails {
	detected: boolean;
	version?: string;
	edition?: string;
}

/**
 * Detect Windows version and edition from the image filename.
 * Common ISO naming: Win11_24H2_English_x64.iso, en-us_windows_11_*.iso
 */
export function getWindowsImageDetails(imagePath: string): WindowsImageDetails {
	const name = basename(imagePath).toLowerCase();

	if (!looksLikeWindowsImage(imagePath)) {
		return { detected: false };
	}

	const versionPatterns: Array<{ pattern: RegExp; version: string }> = [
		{ pattern: /win(?:dows)?[\s_-]*11/i, version: 'Windows 11' },
		{ pattern: /win(?:dows)?[\s_-]*10/i, version: 'Windows 10' },
		{ pattern: /win(?:dows)?[\s_-]*8\.1/i, version: 'Windows 8.1' },
		{ pattern: /win(?:dows)?[\s_-]*8/i, version: 'Windows 8' },
		{ pattern: /win(?:dows)?[\s_-]*7/i, version: 'Windows 7' },
		{ pattern: /win(?:dows)?[\s_-]*vista/i, version: 'Windows Vista' },
		{ pattern: /win(?:dows)?[\s_-]*xp/i, version: 'Windows XP' },
		{ pattern: /win(?:dows)?[\s_-]*server/i, version: 'Windows Server' },
	];

	let version = 'Windows';
	for (const { pattern, version: v } of versionPatterns) {
		if (pattern.test(name)) {
			version = v;
			break;
		}
	}

	let edition: string | undefined;
	if (/pro/i.test(name)) edition = 'Pro';
	else if (/enterprise/i.test(name)) edition = 'Enterprise';
	else if (/education/i.test(name)) edition = 'Education';
	else if (/home/i.test(name)) edition = 'Home';
	else if (/ltsc/i.test(name)) edition = 'LTSC';

	return { detected: true, version, edition };
}
