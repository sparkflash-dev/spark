/**
 * USB device speed classification — detect and display USB generation.
 */

export type UsbGeneration = 'USB 2.0' | 'USB 3.0' | 'USB 3.1' | 'USB 3.2' | 'USB4' | 'Unknown';

export interface UsbSpeedInfo {
  generation: UsbGeneration;
  maxSpeedMBs: number;
  color: string;
  icon: string;
  recommendation: string;
}

const USB_SPEEDS: Record<UsbGeneration, Omit<UsbSpeedInfo, 'generation'>> = {
  'USB 2.0': {
    maxSpeedMBs: 60,
    color: '#808080',
    icon: '🐌',
    recommendation: 'Use a USB 3.0+ port for significantly faster writes',
  },
  'USB 3.0': {
    maxSpeedMBs: 625,
    color: '#2196F3',
    icon: '⚡',
    recommendation: 'Good speed — USB 3.0 provides up to 5 Gbps',
  },
  'USB 3.1': {
    maxSpeedMBs: 1250,
    color: '#00BCD4',
    icon: '⚡⚡',
    recommendation: 'Great speed — USB 3.1 provides up to 10 Gbps',
  },
  'USB 3.2': {
    maxSpeedMBs: 2500,
    color: '#4CAF50',
    icon: '🚀',
    recommendation: 'Excellent speed — USB 3.2 provides up to 20 Gbps',
  },
  'USB4': {
    maxSpeedMBs: 5000,
    color: '#FF9800',
    icon: '🚀🚀',
    recommendation: 'Maximum speed — USB4 provides up to 40 Gbps',
  },
  'Unknown': {
    maxSpeedMBs: 60,
    color: '#9E9E9E',
    icon: '❓',
    recommendation: 'USB speed could not be detected',
  },
};

export function classifyUsbSpeed(busType: string, speedMBs?: number): UsbSpeedInfo {
  if (speedMBs) {
    if (speedMBs > 2500) return { generation: 'USB4', ...USB_SPEEDS['USB4'] };
    if (speedMBs > 1250) return { generation: 'USB 3.2', ...USB_SPEEDS['USB 3.2'] };
    if (speedMBs > 625) return { generation: 'USB 3.1', ...USB_SPEEDS['USB 3.1'] };
    if (speedMBs > 60) return { generation: 'USB 3.0', ...USB_SPEEDS['USB 3.0'] };
    return { generation: 'USB 2.0', ...USB_SPEEDS['USB 2.0'] };
  }

  if (busType.includes('xHCI') || busType.includes('USB3')) {
    return { generation: 'USB 3.0', ...USB_SPEEDS['USB 3.0'] };
  }
  if (busType.includes('EHCI') || busType.includes('USB2')) {
    return { generation: 'USB 2.0', ...USB_SPEEDS['USB 2.0'] };
  }

  return { generation: 'Unknown', ...USB_SPEEDS['Unknown'] };
}

export function estimateFlashTime(imageSize: number, usbSpeed: UsbSpeedInfo): string {
  const speedBytes = usbSpeed.maxSpeedMBs * 1024 * 1024;
  // Real-world speed is ~60% of theoretical max
  const realSpeed = speedBytes * 0.6;
  const seconds = Math.ceil(imageSize / realSpeed);

  if (seconds < 60) return `~${seconds}s`;
  if (seconds < 3600) return `~${Math.ceil(seconds / 60)}m`;
  return `~${Math.floor(seconds / 3600)}h ${Math.ceil((seconds % 3600) / 60)}m`;
}
