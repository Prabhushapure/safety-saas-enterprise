/**
 * Parse game long_desc HTML into structured sections for display.
 * Each section has an optional heading and a list of text items.
 */
export const parseDescription = (html) => {
  if (!html) return null;
  const sections = [];
  const parts = html
    .split(/<br\s*\/?>\s*<br\s*\/?>/gi)
    .map((p) => p.replace(/<br\s*\/?>/gi, '\n').trim())
    .filter(Boolean);

  parts.forEach((part) => {
    const lines = part
      .split('\n')
      .map((l) => l.replace(/<[^>]*>/g, '').trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const firstLine = lines[0];
    if (firstLine.match(/^[A-Z\s&:]+$/) || firstLine.endsWith(':')) {
      sections.push({ heading: firstLine.replace(/:$/, ''), items: lines.slice(1) });
    } else {
      sections.push({ heading: null, items: lines });
    }
  });
  return sections;
};
