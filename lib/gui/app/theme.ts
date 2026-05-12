/*
 * Copyright 2018 balena.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License"),
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

import * as _ from 'lodash';
import { Theme } from 'rendition';

export const colors = {
	dark: {
		foreground: '#f0f0f0',
		background: '#1a1a2e',
		soft: {
			foreground: '#c8c8d4',
			background: '#252542',
		},
		disabled: {
			foreground: '#5a5a72',
			background: '#14142a',
		},
	},
	light: {
		foreground: '#666',
		background: '#fff',
		soft: {
			foreground: '#b3b3b3',
		},
		disabled: {
			foreground: '#787c7f',
			background: '#d5d5d5',
		},
	},
	default: {
		foreground: '#9a9ab0',
		background: '#252542',
	},
	primary: {
		foreground: '#fff',
		background: '#f59e0b',
	},
	secondary: {
		foreground: '#000',
		background: '#2d2d4a',
		main: '#fff',
	},
	warning: {
		foreground: '#fff',
		background: '#f59e0b',
	},
	danger: {
		foreground: '#fff',
		background: '#ef4444',
	},
	success: {
		foreground: '#fff',
		background: '#22c55e',
	},
};

const font = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const theme = _.merge({}, Theme, {
	colors,
	font,
	header: {
		height: '40px',
	},
	global: {
		font: {
			family: font,
			size: 16,
		},
		text: {
			medium: {
				size: 16,
			},
		},
	},
	button: {
		border: {
			width: '0',
			radius: '24px',
		},
		disabled: {
			opacity: 1,
		},
		extend: () => `
			width: 200px;
			font-size: 16px;

			&& {
				width: 200px;
				height: 48px;
			}

			:disabled {
				background-color: ${colors.dark.disabled.background};
				color: ${colors.dark.disabled.foreground};
				opacity: 1;

				:hover {
					background-color: ${colors.dark.disabled.background};
					color: ${colors.dark.disabled.foreground};
				}
			}
		`,
	},
	layer: {
		extend: () => `
			> div:first-child {
				background-color: transparent;
			}
		`,
	},
});
