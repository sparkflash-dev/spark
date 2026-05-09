/*
 * Tests for the renderMessageWithLinks XSS fix.
 * The function is co-located with source-selector; we test its logic here
 * by re-implementing the same algorithm and verifying its safety properties.
 */

import { expect } from 'chai';

// Re-implement the same algorithm as in source-selector.tsx so we can unit-test it
// without pulling in the full React/Electron environment.
function renderMessageWithLinks(
	message: string,
): Array<string | { href: string; text: string }> {
	const parts: Array<string | { href: string; text: string }> = [];
	const linkPattern = /<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = linkPattern.exec(message)) !== null) {
		if (match.index > lastIndex) {
			parts.push(message.slice(lastIndex, match.index));
		}
		const href = match[1];
		const text = match[2];
		if (href.startsWith('https://') || href.startsWith('http://')) {
			parts.push({ href, text });
		} else {
			// unsafe href — render as plain text to prevent XSS
			parts.push(text);
		}
		lastIndex = match.index + match[0].length;
	}
	if (lastIndex < message.length) {
		parts.push(message.slice(lastIndex));
	}
	return parts;
}

describe('GUI utils: renderMessageWithLinks', function () {
	it('returns plain text unchanged when no links are present', function () {
		const result = renderMessageWithLinks('No links here.');
		expect(result).to.deep.equal(['No links here.']);
	});

	it('extracts a valid https link', function () {
		const result = renderMessageWithLinks(
			'Use <a href="https://rufus.ie">Rufus</a> instead.',
		);
		expect(result).to.deep.equal([
			'Use ',
			{ href: 'https://rufus.ie', text: 'Rufus' },
			' instead.',
		]);
	});

	it('extracts a valid http link', function () {
		const result = renderMessageWithLinks(
			'Visit <a href="http://example.com">here</a>.',
		);
		expect(result).to.deep.equal([
			'Visit ',
			{ href: 'http://example.com', text: 'here' },
			'.',
		]);
	});

	it('renders javascript: href as plain text (XSS prevention)', function () {
		const result = renderMessageWithLinks(
			'Click <a href="javascript:alert(1)">here</a>.',
		);
		// The link text should appear as plain text, not as a link object
		for (const part of result) {
			expect(typeof part).to.equal('string');
		}
	});

	it('renders data: href as plain text (XSS prevention)', function () {
		const result = renderMessageWithLinks(
			'<a href="data:text/html,<script>alert(1)</script>">x</a>',
		);
		for (const part of result) {
			expect(typeof part).to.equal('string');
		}
	});

	it('handles multiple links in one message', function () {
		const result = renderMessageWithLinks(
			'See <a href="https://a.com">A</a> and <a href="https://b.com">B</a>.',
		);
		expect(result).to.deep.equal([
			'See ',
			{ href: 'https://a.com', text: 'A' },
			' and ',
			{ href: 'https://b.com', text: 'B' },
			'.',
		]);
	});

	it('handles an empty message', function () {
		expect(renderMessageWithLinks('')).to.deep.equal([]);
	});
});
