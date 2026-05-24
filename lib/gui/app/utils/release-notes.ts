/**
 * Release notes generator — format changelog for display in app.
 */

export interface ReleaseNote {
  version: string;
  date: string;
  sections: Array<{
    title: string;
    items: string[];
  }>;
}

export function parseChangelog(changelog: string): ReleaseNote[] {
  const releases: ReleaseNote[] = [];
  const versionRegex = /^## \[(\d+\.\d+\.\d+)\]\s*—\s*(.+)/gm;
  let match;

  while ((match = versionRegex.exec(changelog)) !== null) {
    const version = match[1];
    const date = match[2].trim();
    const startIdx = match.index + match[0].length;
    const nextMatch = versionRegex.exec(changelog);
    const endIdx = nextMatch ? nextMatch.index : changelog.length;
    versionRegex.lastIndex = nextMatch ? nextMatch.index : changelog.length;

    const content = changelog.slice(startIdx, endIdx);
    const sections: ReleaseNote['sections'] = [];

    const sectionRegex = /^### (.+)/gm;
    let sectionMatch;
    const sectionStarts: Array<{ title: string; index: number }> = [];

    while ((sectionMatch = sectionRegex.exec(content)) !== null) {
      sectionStarts.push({ title: sectionMatch[1], index: sectionMatch.index + sectionMatch[0].length });
    }

    for (let i = 0; i < sectionStarts.length; i++) {
      const start = sectionStarts[i].index;
      const end = i + 1 < sectionStarts.length ? sectionStarts[i + 1].index - sectionStarts[i + 1].title.length - 4 : content.length;
      const sectionContent = content.slice(start, end);
      const items = sectionContent
        .split('\n')
        .map((line) => line.replace(/^[\s-]*\*?\*?/, '').trim())
        .filter((line) => line.length > 0);

      sections.push({ title: sectionStarts[i].title, items });
    }

    releases.push({ version, date, sections });
  }

  return releases;
}

export function getLatestVersion(notes: ReleaseNote[]): string | null {
  return notes.length > 0 ? notes[0].version : null;
}

export function formatReleaseForNotification(note: ReleaseNote): string {
  const highlights = note.sections
    .flatMap((s) => s.items.slice(0, 2))
    .slice(0, 5);
  return `v${note.version} (${note.date})\n${highlights.map((h) => `• ${h}`).join('\n')}`;
}
