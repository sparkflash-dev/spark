import { expect } from 'chai';
import { getDefaultCSP, getStrictCSP, buildCSPString, addDirective, validateCSP } from '../../../lib/gui/app/utils/csp-builder';

describe('CSP Builder', () => {
  it('should build default CSP string', () => {
    const csp = buildCSPString(getDefaultCSP());
    expect(csp).to.include("default-src 'self'");
    expect(csp).to.include("object-src 'none'");
  });

  it('should build strict CSP', () => {
    const csp = buildCSPString(getStrictCSP());
    expect(csp).to.include("default-src 'none'");
    expect(csp).to.include("frame-src 'none'");
  });

  it('should add directive', () => {
    let csp = getDefaultCSP();
    csp = addDirective(csp, 'connect-src', 'https://api.github.com');
    expect(csp['connect-src']).to.include('https://api.github.com');
  });

  it('should not add duplicate directive', () => {
    let csp = getDefaultCSP();
    csp = addDirective(csp, 'default-src', "'self'");
    expect(csp['default-src'].filter((v) => v === "'self'")).to.have.length(1);
  });

  it('should validate unsafe-eval', () => {
    const csp = getDefaultCSP();
    csp['script-src'].push("'unsafe-eval'");
    const warnings = validateCSP(csp);
    expect(warnings.some((w) => w.includes('unsafe-eval'))).to.be.true;
  });
});
