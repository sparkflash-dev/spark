import { expect } from 'chai';
import { DEFAULT_SHORTCUTS, getShortcutsByCategory, findShortcutByKeys, formatShortcutsHelp } from '../../../lib/gui/app/utils/shortcut-manager';

describe('Shortcut Manager', () => {
  it('should have default shortcuts', () => {
    expect(DEFAULT_SHORTCUTS.length).to.be.greaterThan(5);
  });

  it('should filter by category', () => {
    const fileShortcuts = getShortcutsByCategory('file');
    expect(fileShortcuts.length).to.be.greaterThan(0);
    expect(fileShortcuts.every((s) => s.category === 'file')).to.be.true;
  });

  it('should find shortcut by keys', () => {
    const found = findShortcutByKeys('CmdOrCtrl+O');
    expect(found).to.not.be.undefined;
    expect(found!.action).to.equal('open-image');
  });

  it('should return undefined for unknown keys', () => {
    expect(findShortcutByKeys('F99')).to.be.undefined;
  });

  it('should format help text', () => {
    const help = formatShortcutsHelp();
    expect(help).to.include('Keyboard Shortcuts');
    expect(help).to.include('Open image');
  });
});
