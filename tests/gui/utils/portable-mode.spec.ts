import { expect } from 'chai';
import { isPortableMode, getPortableConfig, getExecutableDirectory } from '../../../lib/gui/app/utils/portable-mode';

describe('Portable Mode', () => {
  it('should detect non-portable by default', () => {
    expect(isPortableMode()).to.be.false;
  });

  it('should return standard config when not portable', () => {
    const config = getPortableConfig();
    expect(config.isPortable).to.be.false;
    expect(config.configDir).to.include('.config');
  });

  it('should return executable directory', () => {
    const dir = getExecutableDirectory();
    expect(dir).to.be.a('string');
    expect(dir.length).to.be.greaterThan(0);
  });
});
