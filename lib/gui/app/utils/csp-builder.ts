/**
 * Content Security Policy builder — construct CSP headers dynamically.
 */

export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-src': string[];
  'object-src': string[];
  'base-uri': string[];
  'form-action': string[];
}

export function getDefaultCSP(): CSPDirectives {
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"], // styled-components needs this
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };
}

export function getStrictCSP(): CSPDirectives {
  return {
    'default-src': ["'none'"],
    'script-src': ["'self'"],
    'style-src': ["'self'"],
    'img-src': ["'self'", 'data:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'none'"],
    'form-action': ["'none'"],
  };
}

export function buildCSPString(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

export function addDirective(csp: CSPDirectives, directive: keyof CSPDirectives, value: string): CSPDirectives {
  const updated = { ...csp };
  if (!updated[directive].includes(value)) {
    updated[directive] = [...updated[directive], value];
  }
  return updated;
}

export function validateCSP(csp: CSPDirectives): string[] {
  const warnings: string[] = [];
  if (csp['script-src'].includes("'unsafe-eval'")) {
    warnings.push("'unsafe-eval' in script-src — potential XSS risk");
  }
  if (csp['script-src'].includes("'unsafe-inline'")) {
    warnings.push("'unsafe-inline' in script-src — consider using nonces");
  }
  if (csp['default-src'].includes('*')) {
    warnings.push("Wildcard in default-src — CSP provides no protection");
  }
  if (csp['frame-src'].includes('*') || !csp['frame-src'].includes("'none'")) {
    warnings.push("frame-src should be 'none' to prevent clickjacking");
  }
  return warnings;
}
