/**
 * Wayland drag-and-drop compatibility — handle Wayland-specific DnD quirks.
 */

import * as os from 'os';

export function isWayland(): boolean {
  if (os.platform() !== 'linux') return false;
  return !!(process.env.WAYLAND_DISPLAY || process.env.XDG_SESSION_TYPE === 'wayland');
}

export function getDisplayServer(): 'wayland' | 'x11' | 'other' {
  if (os.platform() !== 'linux') return 'other';
  if (process.env.WAYLAND_DISPLAY) return 'wayland';
  if (process.env.DISPLAY) return 'x11';
  return 'other';
}

export function getElectronFlags(): string[] {
  const flags: string[] = [];
  if (isWayland()) {
    flags.push('--enable-features=UseOzonePlatform');
    flags.push('--ozone-platform=wayland');
    flags.push('--enable-features=WaylandWindowDecorations');
  }
  return flags;
}

export function getWaylandNotes(): string[] {
  if (!isWayland()) return [];
  return [
    'Running on Wayland display server',
    'Drag-and-drop may require xdg-desktop-portal for file transfer',
    'If DnD is broken, try launching with: --ozone-platform=x11',
  ];
}
