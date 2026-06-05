// Generate a GitHub-style Table of Contents from markdown ## / ### headings.
export function generateTOC(markdown: string): string {
  const headings = markdown.match(/^#{2,3}\s+.+$/gm) || [];

  const tocLines = headings
    // Don't include the TOC heading itself if present
    .filter(h => !/^##\s+table of contents/i.test(h))
    .map(heading => {
      const level  = (heading.match(/^#+/) || [''])[0].length;
      const text   = heading.replace(/^#+\s+/, '').trim();
      const anchor = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      const indent = level === 2 ? '' : '  ';
      return `${indent}- [${text}](#${anchor})`;
    });

  return tocLines.length > 0
    ? '## Table of Contents\n\n' + tocLines.join('\n') + '\n'
    : '';
}

// Insert (or replace) a TOC right after the first heading in the document.
export function insertTOC(markdown: string): string {
  const toc = generateTOC(markdown);
  if (!toc) return markdown;

  // Remove an existing TOC block if present (## Table of Contents up to next heading)
  let body = markdown.replace(
    /## Table of Contents\n[\s\S]*?(?=\n#{1,3}\s)/i,
    '',
  ).replace(/## Table of Contents\n[\s\S]*$/i, '').trimEnd();

  // Find the first heading line; insert TOC after its block
  const lines = body.split('\n');
  const firstHeadingIdx = lines.findIndex(l => /^#{1,3}\s+/.test(l));

  if (firstHeadingIdx === -1) {
    return `${toc}\n${body}`;
  }

  // Insert after the first heading (and any immediate description paragraph)
  const before = lines.slice(0, firstHeadingIdx + 1).join('\n');
  const after  = lines.slice(firstHeadingIdx + 1).join('\n').replace(/^\n+/, '');
  return `${before}\n\n${toc}\n${after}`.replace(/\n{3,}/g, '\n\n');
}
