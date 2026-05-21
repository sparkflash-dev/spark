import { expect } from 'chai';
import { validateManifest, isPluginCompatible, getPluginsDirectory } from '../../../lib/gui/app/utils/plugin-system';

describe('Plugin System', () => {
  it('should validate valid manifest', () => {
    const errors = validateManifest({
      name: 'test-plugin',
      version: '1.0.0',
      description: 'Test',
      author: 'dev',
      sparkVersion: '3.0.0',
      main: 'index.js',
      type: 'post-flash',
      permissions: ['fs-read'],
    });
    expect(errors).to.have.length(0);
  });

  it('should reject manifest without name', () => {
    const errors = validateManifest({
      name: '',
      version: '1.0.0',
      description: '',
      author: '',
      sparkVersion: '',
      main: 'index.js',
      type: 'post-flash',
      permissions: [],
    });
    expect(errors).to.include('Plugin name is required');
  });

  it('should flag dangerous permissions', () => {
    const errors = validateManifest({
      name: 'danger',
      version: '1.0.0',
      description: '',
      author: '',
      sparkVersion: '',
      main: 'index.js',
      type: 'post-flash',
      permissions: ['shell', 'drive-access'],
    });
    expect(errors.some((e) => e.includes('dangerous'))).to.be.true;
  });

  it('should check compatibility', () => {
    expect(isPluginCompatible({ name: '', version: '', description: '', author: '', sparkVersion: '3.0.0', main: '', type: 'post-flash', permissions: [] }, '3.4.0')).to.be.true;
    expect(isPluginCompatible({ name: '', version: '', description: '', author: '', sparkVersion: '4.0.0', main: '', type: 'post-flash', permissions: [] }, '3.4.0')).to.be.false;
  });

  it('should return plugins directory', () => {
    expect(getPluginsDirectory()).to.include('.spark');
  });
});
