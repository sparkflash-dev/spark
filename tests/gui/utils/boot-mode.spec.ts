import { expect } from 'chai';
import { detectSystemBootMode, getBootModeDescription } from '../../../lib/gui/app/utils/boot-mode';

describe('Boot Mode', () => {
  it('should detect a boot mode', () => {
    const mode = detectSystemBootMode();
    expect(['uefi', 'legacy', 'unknown']).to.include(mode);
  });

  it('should return description for UEFI', () => {
    const desc = getBootModeDescription('uefi');
    expect(desc).to.include('UEFI');
    expect(desc).to.include('GPT');
  });

  it('should return description for legacy', () => {
    const desc = getBootModeDescription('legacy');
    expect(desc).to.include('Legacy');
    expect(desc).to.include('MBR');
  });

  it('should return description for unknown', () => {
    const desc = getBootModeDescription('unknown');
    expect(desc).to.include('Unknown');
  });
});
