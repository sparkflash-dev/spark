import { expect } from 'chai';
import {
	SHORTCUTS,
	matchesShortcut,
	formatShortcut,
	getShortcutForAction,
} from '../../../lib/gui/app/utils/keyboard-shortcuts';

describe('Keyboard shortcuts', function () {
	describe('SHORTCUTS', function () {
		it('should have open-file shortcut', function () {
			const shortcut = SHORTCUTS.find((s) => s.action === 'open-file');
			expect(shortcut).to.exist;
			expect(shortcut!.key).to.equal('o');
			expect(shortcut!.ctrl).to.be.true;
		});

		it('should have quit shortcut', function () {
			const shortcut = SHORTCUTS.find((s) => s.action === 'quit');
			expect(shortcut).to.exist;
		});
	});

	describe('matchesShortcut()', function () {
		it('should match Ctrl+O', function () {
			const event = { key: 'o', ctrlKey: true, altKey: false, shiftKey: false, metaKey: false } as any;
			const shortcut = SHORTCUTS.find((s) => s.action === 'open-file')!;
			expect(matchesShortcut(event, shortcut)).to.be.true;
		});

		it('should not match without Ctrl', function () {
			const event = { key: 'o', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false } as any;
			const shortcut = SHORTCUTS.find((s) => s.action === 'open-file')!;
			expect(matchesShortcut(event, shortcut)).to.be.false;
		});

		it('should match Escape for close-dialog', function () {
			const event = { key: 'Escape', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false } as any;
			const shortcut = SHORTCUTS.find((s) => s.action === 'close-dialog')!;
			expect(matchesShortcut(event, shortcut)).to.be.true;
		});
	});

	describe('formatShortcut()', function () {
		it('should format Ctrl+O', function () {
			const shortcut = SHORTCUTS.find((s) => s.action === 'open-file')!;
			expect(formatShortcut(shortcut)).to.equal('Ctrl+O');
		});

		it('should format Escape', function () {
			const shortcut = SHORTCUTS.find((s) => s.action === 'close-dialog')!;
			expect(formatShortcut(shortcut)).to.equal('Esc');
		});
	});

	describe('getShortcutForAction()', function () {
		it('should find existing action', function () {
			const shortcut = getShortcutForAction('open-file');
			expect(shortcut).to.exist;
			expect(shortcut!.key).to.equal('o');
		});

		it('should return undefined for unknown action', function () {
			expect(getShortcutForAction('nonexistent')).to.be.undefined;
		});
	});
});
