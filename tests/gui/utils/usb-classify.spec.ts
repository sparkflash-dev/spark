import { expect } from 'chai';
import { classifyUsbSpeed, estimateFlashTime } from '../../../lib/gui/app/utils/usb-classify';

describe('USB Classification', () => {
  it('should classify USB 2.0 speed', () => {
    const info = classifyUsbSpeed('EHCI', 30);
    expect(info.generation).to.equal('USB 2.0');
    expect(info.color).to.be.a('string');
  });

  it('should classify USB 3.0 speed', () => {
    const info = classifyUsbSpeed('xHCI', 200);
    expect(info.generation).to.equal('USB 3.0');
  });

  it('should classify by bus type when no speed given', () => {
    expect(classifyUsbSpeed('xHCI').generation).to.equal('USB 3.0');
    expect(classifyUsbSpeed('EHCI').generation).to.equal('USB 2.0');
  });

  it('should estimate flash time', () => {
    const speed = classifyUsbSpeed('xHCI', 200);
    const time = estimateFlashTime(4 * 1024 * 1024 * 1024, speed);
    expect(time).to.include('m');
  });

  it('should return Unknown for unrecognized bus', () => {
    const info = classifyUsbSpeed('SomeWeirdBus');
    expect(info.generation).to.equal('Unknown');
  });
});
