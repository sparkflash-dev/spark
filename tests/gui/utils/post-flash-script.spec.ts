import { expect } from 'chai';
import { validateScript, getScriptInterpreter, buildScriptEnv, getBuiltinScripts } from '../../../lib/gui/app/utils/post-flash-script';

describe('Post-flash Script', () => {
  it('should reject nonexistent script', () => {
    const errors = validateScript('/nonexistent/script.sh');
    expect(errors).to.have.length.greaterThan(0);
    expect(errors[0]).to.include('not found');
  });

  it('should get correct interpreter for .sh', () => {
    const interp = getScriptInterpreter('/tmp/test.sh');
    expect(interp).to.equal('/bin/bash');
  });

  it('should get correct interpreter for .py', () => {
    const interp = getScriptInterpreter('/tmp/test.py');
    expect(interp).to.include('python');
  });

  it('should build script env variables', () => {
    const env = buildScriptEnv('/tmp/image.iso', '/dev/sdb', { success: true, bytesWritten: 1024, duration: 5000 });
    expect(env.SPARK_IMAGE_PATH).to.equal('/tmp/image.iso');
    expect(env.SPARK_FLASH_SUCCESS).to.equal('1');
    expect(env.SPARK_BYTES_WRITTEN).to.equal('1024');
  });

  it('should have builtin scripts', () => {
    const builtins = getBuiltinScripts();
    expect(builtins.length).to.be.greaterThan(0);
    expect(builtins[0]).to.have.property('name');
    expect(builtins[0]).to.have.property('filename');
  });
});
