/*
 * Copyright 2019 balena.io
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

import * as _ from 'lodash';
import * as React from 'react';
import { Box, Checkbox, Flex, Txt } from 'rendition';
import styled from 'styled-components';

import { version } from '../../../../../package.json';
import * as settings from '../../models/settings';
import { Modal } from '../../styled-components';
import * as i18next from 'i18next';

interface Setting {
	name: string;
	label: string | JSX.Element;
}

interface SettingSection {
	title: string;
	settings: Setting[];
}

function getSettingsSections(): SettingSection[] {
	return [
		{
			title: 'Flashing',
			settings: [
				{
					name: 'autoBlockmapping',
					label: i18next.t('settings.trimExtPartitions'),
				},
				{
					name: 'decompressFirst',
					label: i18next.t('settings.decompressFirst'),
				},
				{
					name: 'validateWriteOnSuccess',
					label: i18next.t('settings.validateWriteOnSuccess'),
				},
				{
					name: 'confirmBeforeFlash',
					label: i18next.t('settings.confirmBeforeFlash'),
				},
			],
		},
		{
			title: 'Verification',
			settings: [
				{
					name: 'autoChecksumVerify',
					label: i18next.t('settings.autoChecksumVerify'),
				},
				{
					name: 'badSectorCheck',
					label: i18next.t('settings.badSectorCheck'),
				},
			],
		},
		{
			title: 'Interface',
			settings: [
				{
					name: 'desktopNotifications',
					label: i18next.t('settings.desktopNotifications'),
				},
				{
					name: 'showHiddenDrives',
					label: i18next.t('settings.showHiddenDrives'),
				},
			],
		},
	];
}

const SectionTitle = styled(Txt)`
	font-size: 13px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 1px;
	color: #9a9ab0;
	margin-bottom: 10px;
	margin-top: 20px;
`;

const ShortcutRow = styled(Flex)`
	justify-content: space-between;
	align-items: center;
	padding: 4px 0;
`;

const Kbd = styled.span`
	display: inline-block;
	padding: 2px 8px;
	font-size: 12px;
	font-family: monospace;
	color: #f0f0f0;
	background: #252542;
	border: 1px solid #3a3a5c;
	border-radius: 4px;
`;

const Divider = styled.div`
	height: 1px;
	background: #2d2d4a;
	margin: 16px 0;
`;

interface SettingsModalProps {
	toggleModal: (value: boolean) => void;
}

export function SettingsModal({ toggleModal }: SettingsModalProps) {
	const [sections] = React.useState<SettingSection[]>(getSettingsSections);
	const [currentSettings, setCurrentSettings] = React.useState<
		_.Dictionary<boolean>
	>({});

	React.useEffect(() => {
		(async () => {
			if (_.isEmpty(currentSettings)) {
				setCurrentSettings(await settings.getAll());
			}
		})();
	});

	const toggleSetting = async (setting: string) => {
		const value = currentSettings[setting];
		await settings.set(setting, !value);
		setCurrentSettings({
			...currentSettings,
			[setting]: !value,
		});
	};

	const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
	const mod = isMac ? '⌘' : 'Ctrl';

	return (
		<Modal
			titleElement={
				<Txt fontSize={24} mb={24}>
					{i18next.t('settings.settings')}
				</Txt>
			}
			done={() => toggleModal(false)}
		>
			<Flex flexDirection="column">
				{sections.map((section) => (
					<Box key={section.title}>
						<SectionTitle>{section.title}</SectionTitle>
						{section.settings.map((setting, i) => (
							<Flex key={setting.name} mb={14}>
								<Checkbox
									toggle
									tabIndex={6 + i}
									label={setting.label}
									checked={currentSettings[setting.name]}
									onChange={() => toggleSetting(setting.name)}
								/>
							</Flex>
						))}
					</Box>
				))}

				<Divider />

				<SectionTitle>{i18next.t('settings.keyboardShortcuts')}</SectionTitle>
				<Flex flexDirection="column" style={{ fontSize: 13, color: '#9a9ab0' }}>
					<ShortcutRow>
						<Txt>{i18next.t('settings.shortcutOpen')}</Txt>
						<Kbd>{mod}+O</Kbd>
					</ShortcutRow>
					<ShortcutRow>
						<Txt>{i18next.t('settings.shortcutSettings')}</Txt>
						<Kbd>{mod}+,</Kbd>
					</ShortcutRow>
					<ShortcutRow>
						<Txt>{i18next.t('settings.shortcutEsc')}</Txt>
						<Kbd>Esc</Kbd>
					</ShortcutRow>
				</Flex>

				<Divider />

				<Flex mt={4} alignItems="center" style={{ fontSize: 13, color: '#5a5a72' }}>
					<Txt>Spark v{version}</Txt>
				</Flex>
			</Flex>
		</Modal>
	);
}
