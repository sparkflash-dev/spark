import { expect } from 'chai';
import { convertToRawDevice, needsSDCardWorkaround, getUnmountCommand, getSafeWriteConfig } from '../../../lib/gui/app/utils/macos-sd-fix';

describe('macOS SD Card Fix', () => {
  it('should convert to raw device', () => {
    expect(convertToRawDevice('/dev/disk4')).to.equal('/dev/rdisk4');
    expect(convertToRawDevice('/dev/disk12')).to.equal('/dev/rdisk12');
  });

  it('should generate unmount command', () => {
    const cmd = getUnmountCommand('/dev/disk4');
    expect(cmd).to.include('diskutil');
    expect(cmd).to.include('unmountDisk');
    expect(cmd).to.include('/dev/disk4');
  });

  it('should return safe write config', () => {
    const config = getSafeWriteConfig();
    expect(config.maxRetries).to.equal(3);
    expect(config.verifyAfterWrite).to.be.true;
    expect(config.useRawDevice).to.be.true;
  });
});
