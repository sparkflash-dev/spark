import { expect } from 'chai';
import { detectWindowsIso, getWindowsFlashRecommendation } from '../../../lib/gui/app/utils/windows-iso';

describe('Windows ISO Detection', () => {
  it('should detect Windows 11 ISO', () => {
    const info = detectWindowsIso('Win11_23H2_English_x64v2.iso');
    expect(info.isWindowsIso).to.be.true;
    expect(info.version).to.equal('Windows 11');
    expect(info.architecture).to.equal('x64');
  });

  it('should detect Windows 10 with edition', () => {
    const info = detectWindowsIso('Windows_10_Pro_x64.iso');
    expect(info.isWindowsIso).to.be.true;
    expect(info.version).to.equal('Windows 10');
    expect(info.edition).to.equal('Pro');
  });

  it('should detect Windows Server', () => {
    const info = detectWindowsIso('Server_2022_Datacenter_x64.iso');
    expect(info.isWindowsIso).to.be.true;
    expect(info.version).to.equal('Windows Server 2022');
    expect(info.edition).to.equal('Server Datacenter');
  });

  it('should return false for non-Windows ISO', () => {
    const info = detectWindowsIso('ubuntu-22.04-desktop-amd64.iso');
    expect(info.isWindowsIso).to.be.false;
  });

  it('should recommend GPT/UEFI for Windows 11', () => {
    const info = detectWindowsIso('Win11_x64.iso');
    const rec = getWindowsFlashRecommendation(info);
    expect(rec.partitionScheme).to.equal('gpt');
    expect(rec.bootMode).to.equal('uefi');
  });

  it('should recommend MBR/Legacy for Windows 7', () => {
    const info = detectWindowsIso('Win7_Ultimate_x64.iso');
    const rec = getWindowsFlashRecommendation(info);
    expect(rec.partitionScheme).to.equal('mbr');
    expect(rec.bootMode).to.equal('legacy');
  });
});
