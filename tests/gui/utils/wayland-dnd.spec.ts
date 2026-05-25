import { expect } from 'chai';
import { getDisplayServer, getElectronFlags } from '../../../lib/gui/app/utils/wayland-dnd';

describe('Wayland DnD', () => {
  it('should detect display server', () => {
    const ds = getDisplayServer();
    expect(['wayland', 'x11', 'other']).to.include(ds);
  });

  it('should return electron flags array', () => {
    const flags = getElectronFlags();
    expect(flags).to.be.an('array');
  });
});
