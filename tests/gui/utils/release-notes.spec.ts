import { expect } from 'chai';
import { parseChangelog, getLatestVersion, formatReleaseForNotification } from '../../../lib/gui/app/utils/release-notes';

describe('Release Notes', () => {
  const sampleChangelog = `
## [3.4.0] — 2026-05-25

### Added
- Windows ISO support
- Queue mode

### Fixed
- macOS SD card issue

## [3.3.0] — 2026-05-19

### Added
- Feature flags
`;

  it('should parse changelog versions', () => {
    const notes = parseChangelog(sampleChangelog);
    expect(notes.length).to.be.greaterThan(0);
    expect(notes[0].version).to.equal('3.4.0');
  });

  it('should get latest version', () => {
    const notes = parseChangelog(sampleChangelog);
    expect(getLatestVersion(notes)).to.equal('3.4.0');
  });

  it('should return null for empty', () => {
    expect(getLatestVersion([])).to.be.null;
  });

  it('should format for notification', () => {
    const notes = parseChangelog(sampleChangelog);
    const formatted = formatReleaseForNotification(notes[0]);
    expect(formatted).to.include('3.4.0');
  });
});
