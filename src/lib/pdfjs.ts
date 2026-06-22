/**
 * lib/pdfjs.ts
 * 
 * Shared pdfjs-dist utility for all PDF tools.
 * 
 * Uses the installed `pdfjs-dist` npm package (v6+) instead of CDN script injection.
 * Worker is served via jsdelivr CDN matching the exact installed package version —
 * this is already allowed by the project's Content-Security-Policy.
 */

let _pdfjsLib: any = null;

/**
 * Returns the pdfjs-dist module, loading and configuring it once per session.
 * Safe to call multiple times — returns the cached instance after first load.
 */
export async function getPdfJs(): Promise<any> {
  if (_pdfjsLib) return _pdfjsLib;

  if (typeof window === 'undefined') {
    throw new Error('PDF.js requires a browser environment.');
  }

  const pdfjsLib = await import('pdfjs-dist');

  // Point worker to jsdelivr CDN matching the exact installed package version.
  // jsdelivr is already in the project's Content-Security-Policy worker-src allowlist.
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  _pdfjsLib = pdfjsLib;
  return pdfjsLib;
}

/**
 * Extract text items from a PDF page result, compatible with pdfjs-dist v4+.
 * 
 * In pdfjs-dist v4+, getTextContent() may return TextMarkedContent objects
 * (which lack a `str` property) alongside TextItem objects. This helper
 * filters to only TextItem objects with a `str` property.
 */
export function getTextItems(textContent: any): Array<{
  str: string;
  transform: number[];
  width: number;
  height: number;
  dir?: string;
  fontName?: string;
}> {
  return (textContent.items as any[]).filter((item: any) => typeof item.str === 'string');
}

/**
 * Group text items into visual lines based on Y-coordinate proximity.
 * Returns lines sorted top-to-bottom (descending Y in PDF coordinate space).
 */
export function groupItemsIntoLines(
  items: ReturnType<typeof getTextItems>
): Array<{ y: number; height: number; items: ReturnType<typeof getTextItems> }> {
  const lines: Array<{ y: number; height: number; items: ReturnType<typeof getTextItems> }> = [];

  for (const item of items) {
    const y = item.transform[5];
    const h = item.height;
    const existing = lines.find((l) => Math.abs(l.y - y) < Math.max(h * 0.7, 4));
    if (existing) {
      existing.items.push(item);
    } else {
      lines.push({ y, height: h, items: [item] });
    }
  }

  // Sort top-to-bottom (PDF Y axis is bottom-up, so higher Y = higher on page)
  lines.sort((a, b) => b.y - a.y);

  // Sort items within each line left-to-right
  for (const line of lines) {
    line.items.sort((a, b) => a.transform[4] - b.transform[4]);
  }

  return lines;
}

/**
 * Build a plain-text string from a set of lines with space gap estimation.
 */
export function linesToPlainText(
  lines: ReturnType<typeof groupItemsIntoLines>
): string {
  return lines
    .map((line) => {
      let text = '';
      let lastX = -1;
      for (const item of line.items) {
        const x = item.transform[4];
        if (lastX !== -1) {
          const gap = x - lastX;
          const spaceWidth = Math.max(item.height * 0.25, 3);
          if (gap > spaceWidth) {
            const spaces = Math.min(Math.round(gap / spaceWidth), 20);
            text += ' '.repeat(spaces);
          }
        }
        text += item.str;
        lastX = x + item.width;
      }
      return text;
    })
    .join('\n');
}
