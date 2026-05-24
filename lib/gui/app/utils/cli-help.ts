/**
 * CLI help formatter — consistent, colored help output.
 */

export interface HelpSection {
  title: string;
  entries: Array<{ command: string; description: string; args?: string }>;
}

export function getHelpSections(): HelpSection[] {
  return [
    {
      title: 'Commands',
      entries: [
        { command: 'flash', description: 'Flash an image to a drive', args: '--image <path> --drive <device>' },
        { command: 'verify', description: 'Verify a flashed drive against source image', args: '<image> <drive>' },
        { command: 'backup', description: 'Create a raw image backup of a drive', args: '<drive> [-o output]' },
        { command: 'list', description: 'List available drives' },
        { command: 'queue', description: 'Flash image to multiple drives in sequence', args: '--image <path>' },
        { command: 'info', description: 'Show system information and requirements' },
      ],
    },
    {
      title: 'Options',
      entries: [
        { command: '--verify, -V', description: 'Verify write after flashing' },
        { command: '--no-unmount', description: 'Do not unmount drive after flash' },
        { command: '--compress, -c', description: 'Compression for backup (none/gzip/zstd)' },
        { command: '--version', description: 'Show version number' },
        { command: '--help', description: 'Show help' },
      ],
    },
  ];
}

export function formatHelp(sections: HelpSection[]): string {
  const lines: string[] = ['', 'Spark — Flash OS images to USB drives', ''];

  for (const section of sections) {
    lines.push(`${section.title}:`);
    const maxCmd = Math.max(...section.entries.map((e) => (e.command + (e.args ? ' ' + e.args : '')).length));

    for (const entry of section.entries) {
      const cmd = entry.command + (entry.args ? ' ' + entry.args : '');
      const padding = ' '.repeat(Math.max(2, maxCmd - cmd.length + 4));
      lines.push(`  ${cmd}${padding}${entry.description}`);
    }
    lines.push('');
  }

  lines.push('Examples:');
  lines.push('  spark flash --image ubuntu.iso --drive /dev/sdb --verify');
  lines.push('  spark list');
  lines.push('  spark backup /dev/sdb -o backup.img -c gzip');
  lines.push('');

  return lines.join('\n');
}
