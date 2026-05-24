/**
 * Context isolation configuration — ensure renderer cannot access Node.js.
 */

export interface BrowserWindowSecurityConfig {
  contextIsolation: boolean;
  nodeIntegration: boolean;
  nodeIntegrationInWorker: boolean;
  nodeIntegrationInSubFrames: boolean;
  sandbox: boolean;
  webSecurity: boolean;
  allowRunningInsecureContent: boolean;
  experimentalFeatures: boolean;
}

export function getSecureBrowserWindowConfig(): BrowserWindowSecurityConfig {
  return {
    contextIsolation: true,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    nodeIntegrationInSubFrames: false,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
    experimentalFeatures: false,
  };
}

export function validateWindowConfig(config: Partial<BrowserWindowSecurityConfig>): string[] {
  const warnings: string[] = [];

  if (config.contextIsolation === false) {
    warnings.push('CRITICAL: contextIsolation is disabled — renderer has full Node.js access');
  }
  if (config.nodeIntegration === true) {
    warnings.push('CRITICAL: nodeIntegration is enabled — renderer can require() any module');
  }
  if (config.sandbox === false) {
    warnings.push('WARNING: sandbox is disabled — renderer has fewer restrictions');
  }
  if (config.webSecurity === false) {
    warnings.push('WARNING: webSecurity is disabled — same-origin policy not enforced');
  }
  if (config.allowRunningInsecureContent === true) {
    warnings.push('WARNING: insecure content allowed — HTTP resources on HTTPS pages');
  }

  return warnings;
}
