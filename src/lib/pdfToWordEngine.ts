/**
 * lib/pdfToWordEngine.ts
 *
 * High-fidelity PDF → DOCX conversion engine.
 *
 * Architecture:
 *   Phase 1 – PDF Analysis      : Extract all content with positional metadata
 *   Phase 2 – Layout Reconstruction: Classify headings, detect alignment, columns, tables
 *   Phase 3 – DOCX Generation   : Build the Word document preserving structure
 *
 * Constraints:
 *   - Runs 100% in the browser (no server required)
 *   - Vercel / Edge / Serverless compatible
 *   - Uses only already-installed packages: pdfjs-dist, docx, tesseract.js
 *   - No LibreOffice, Docker, or native binaries
 */

import { getPdfJs } from './pdfjs';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  HeadingLevel,
  ShadingType,
} from 'docx';

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface PDFToWordOptions {
  file: File;
  useOcr?: boolean;
  onProgress?: (progress: string) => void;
}

export async function convertPdfToWord(options: PDFToWordOptions) {
  const { file, useOcr = false, onProgress } = options;
  const progress = (msg: string) => onProgress && onProgress(msg);

  progress('Loading PDF…');
  const pdfjsLib = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const allPageChildren: any[][] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    progress(`Analyzing page ${pageNum} of ${numPages}…`);
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const pageWidth = viewport.width;
    const pageHeight = viewport.height;

    // ── Phase 1: Extract content ──────────────────────────────────────────
    const textContent = await page.getTextContent({ includeMarkedContent: false } as any);
    const rawItems: RawTextItem[] = extractTextItems(textContent, pageHeight);

    // Detect scanned page: fewer than 10 meaningful text items
    const isScanned = rawItems.filter(i => i.text.trim().length > 0).length < 10;

    let pageItems: RawTextItem[] = rawItems;

    if (isScanned && useOcr) {
      progress(`Running OCR on scanned page ${pageNum}…`);
      pageItems = await extractOcrItems(page, pageWidth, pageHeight);
    }

    // Extract images with real Y positions from CTM tracking
    progress(`Extracting images for page ${pageNum}…`);
    const images = await extractImages(page, pdfjsLib, pageHeight);

    // ── Phase 2: Layout Reconstruction ───────────────────────────────────
    progress(`Reconstructing layout for page ${pageNum}…`);
    const lines = groupItemsIntoLines(pageItems);
    const blocks = reconstructLayout(lines, images, pageWidth, pageHeight);

    // ── Phase 3: DOCX elements ────────────────────────────────────────────
    progress(`Building document elements for page ${pageNum}…`);
    const children = buildDocxElements(blocks, pageWidth);

    allPageChildren.push(children);
  }

  progress('Packaging Word document…');

  // Flatten all pages with page breaks between them
  const docChildren: any[] = [];
  for (let i = 0; i < allPageChildren.length; i++) {
    docChildren.push(...allPageChildren[i]);
    if (i < allPageChildren.length - 1) {
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 720,     // 0.5 inch in twips
            right: 720,
            bottom: 720,
            left: 720,
          },
        },
      },
      children: docChildren,
    }],
  });

  const docBlob = await Packer.toBlob(doc);
  const downloadUrl = URL.createObjectURL(docBlob);

  return {
    downloadUrl,
    fileName: `${file.name.replace(/\.pdf$/i, '')}.docx`,
    resultData: `Successfully converted "${file.name}" — ${numPages} page(s) with layout reconstruction.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RawTextItem {
  text: string;
  x: number;       // left edge (PDF pts, origin = bottom-left)
  y: number;       // baseline Y (flipped to top-down: 0 = top)
  width: number;
  fontSize: number;
  fontName: string;
  bold: boolean;
  italic: boolean;
  color?: string;  // hex string if available
}

interface Line {
  y: number;
  fontSize: number;
  items: RawTextItem[];
  x: number;       // left-most X of line
  right: number;   // right-most edge
}

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'table';
  y: number;
}

interface ParagraphBlock extends ContentBlock {
  type: 'paragraph' | 'heading';
  level?: 1 | 2 | 3;        // heading level
  lines: Line[];
  alignment: 'left' | 'center' | 'right' | 'justify';
  indent: number;            // twips from left margin
}

interface ImageBlock extends ContentBlock {
  type: 'image';
  buffer: ArrayBuffer;
  width: number;
  height: number;
}

interface TableBlock extends ContentBlock {
  type: 'table';
  rows: TableRowData[];
}

interface TableRowData {
  cells: TableCellData[];
}

interface TableCellData {
  lines: Line[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 – PDF Analysis
// ─────────────────────────────────────────────────────────────────────────────

function extractTextItems(textContent: any, pageHeight: number): RawTextItem[] {
  const items: RawTextItem[] = [];

  for (const item of textContent.items as any[]) {
    if (typeof item.str !== 'string' || item.str.length === 0) continue;

    const transform: number[] = item.transform; // [a, b, c, d, x, y]
    const a = transform[0];
    const b = transform[1];
    const c = transform[2];
    const d = transform[3];
    const x = transform[4];
    const rawY = transform[5];

    // Font size = scale of transform matrix (handles rotation, skew)
    const scaleX = Math.sqrt(a * a + b * b);
    const scaleY = Math.sqrt(c * c + d * d);
    const fontSize = Math.max(scaleX, scaleY, item.height || 0);

    // Flip Y to top-down coordinate (0 = top of page)
    const y = pageHeight - rawY;

    const fontName = item.fontName || '';
    const bold = /bold/i.test(fontName);
    const italic = /italic|oblique/i.test(fontName);

    items.push({
      text: item.str,
      x,
      y,
      width: item.width || 0,
      fontSize: fontSize || 12,
      fontName,
      bold,
      italic,
    });
  }

  return items;
}

async function extractOcrItems(
  page: any,
  pageWidth: number,
  pageHeight: number
): Promise<RawTextItem[]> {
  // Render page to canvas for OCR
  const scale = 2.0; // higher res for better OCR accuracy
  const ocrViewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = ocrViewport.width;
  canvas.height = ocrViewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  await page.render({ canvasContext: ctx, viewport: ocrViewport }).promise;
  const dataUrl = canvas.toDataURL('image/png');

  try {
    const { recognizeImageStructured } = await import('./ocr-engine');
    const words = await recognizeImageStructured(dataUrl);
    const items: RawTextItem[] = [];

    for (const word of words) {
      if (!word.text.trim()) continue;
      // Convert from scaled canvas coords back to PDF pts
      const x = word.x0 / scale;
      const y = word.y0 / scale; // already top-down from canvas
      const w = (word.x1 - word.x0) / scale;
      const h = (word.y1 - word.y0) / scale;

      items.push({
        text: word.text,
        x,
        y,
        width: w,
        fontSize: h * 0.75, // Estimate font size from word height
        fontName: '',
        bold: false,
        italic: false,
      });
    }

    return items;
  } catch (e) {
    console.warn('OCR failed, returning empty items', e);
    return [];
  }
}

async function extractImages(
  page: any,
  pdfjsLib: any,
  pageHeight: number
): Promise<ImageBlock[]> {
  const images: ImageBlock[] = [];
  const operatorList = await page.getOperatorList();

  // Track current transformation matrix (CTM) stack to determine image Y
  let ctm: number[] = [1, 0, 0, 1, 0, 0];
  const ctmStack: number[][] = [];

  for (let j = 0; j < operatorList.fnArray.length; j++) {
    const fn = operatorList.fnArray[j];
    const args = operatorList.argsArray[j];

    // Track CTM operations
    if (fn === pdfjsLib.OPS.save) {
      ctmStack.push([...ctm]);
    } else if (fn === pdfjsLib.OPS.restore) {
      if (ctmStack.length > 0) ctm = ctmStack.pop()!;
    } else if (fn === pdfjsLib.OPS.transform) {
      ctm = matMul(ctm, args as number[]);
    }

    const isImageOp =
      fn === pdfjsLib.OPS.paintImageXObject ||
      fn === pdfjsLib.OPS.paintImageMaskXObject ||
      (pdfjsLib.OPS.paintJpegXObject && fn === pdfjsLib.OPS.paintJpegXObject);
    const isInline = fn === pdfjsLib.OPS.paintInlineImageXObject;

    if (!isImageOp && !isInline) continue;

    // Y position of image from CTM translation component (flipped top-down)
    const imgY = pageHeight - ctm[5];

    let imgObj: any = null;
    if (isInline) {
      imgObj = args[0];
    } else {
      const imgKey = args[0];
      imgObj = await new Promise<any>((resolve) => {
        let done = false;
        const timer = setTimeout(() => { if (!done) { done = true; resolve(null); } }, 800);
        page.objs.get(imgKey, (obj: any) => {
          if (!done) { done = true; clearTimeout(timer); resolve(obj); }
        });
      });
    }

    if (!imgObj || !imgObj.width || !imgObj.height) continue;

    const canvas = document.createElement('canvas');
    canvas.width = imgObj.width;
    canvas.height = imgObj.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    let drawn = false;
    const drawable = imgObj.bitmap || imgObj.image || imgObj;
    if (
      drawable instanceof HTMLImageElement ||
      drawable instanceof ImageBitmap ||
      drawable instanceof HTMLCanvasElement
    ) {
      ctx.drawImage(drawable, 0, 0);
      drawn = true;
    } else if (imgObj.data) {
      try {
        const imgData = ctx.createImageData(imgObj.width, imgObj.height);
        const src = imgObj.data;
        if (src.length === imgObj.width * imgObj.height * 3) {
          let s = 0, d = 0;
          for (let k = 0; k < imgObj.width * imgObj.height; k++) {
            imgData.data[d++] = src[s++];
            imgData.data[d++] = src[s++];
            imgData.data[d++] = src[s++];
            imgData.data[d++] = 255;
          }
          ctx.putImageData(imgData, 0, 0);
          drawn = true;
        } else if (src.length === imgObj.width * imgObj.height * 4) {
          imgData.data.set(src);
          ctx.putImageData(imgData, 0, 0);
          drawn = true;
        }
      } catch (_) { /* skip unrenderable images */ }
    }

    if (!drawn) continue;

    const dataUrl = canvas.toDataURL('image/png');
    const res = await fetch(dataUrl);
    const buffer = await res.arrayBuffer();

    // Real dimensions in pts from CTM scale
    const imgWidthPts = Math.abs(ctm[0]) || imgObj.width;
    const imgHeightPts = Math.abs(ctm[3]) || imgObj.height;

    images.push({
      type: 'image',
      y: imgY,
      buffer,
      width: imgWidthPts,
      height: imgHeightPts,
    });
  }

  return images;
}

/** Multiply two 6-element CTM matrices [a,b,c,d,e,f] */
function matMul(m1: number[], m2: number[]): number[] {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 – Layout Reconstruction
// ─────────────────────────────────────────────────────────────────────────────

function groupItemsIntoLines(items: RawTextItem[]): Line[] {
  if (items.length === 0) return [];

  // Sort top-to-bottom, then left-to-right
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);

  const lines: Line[] = [];

  for (const item of sorted) {
    // Tolerance: half the font size, minimum 3 pts
    const tol = Math.max(item.fontSize * 0.55, 3);
    const existing = lines.find(l => Math.abs(l.y - item.y) <= tol);
    if (existing) {
      existing.items.push(item);
      existing.fontSize = Math.max(existing.fontSize, item.fontSize);
      existing.x = Math.min(existing.x, item.x);
      existing.right = Math.max(existing.right, item.x + item.width);
    } else {
      lines.push({
        y: item.y,
        fontSize: item.fontSize,
        items: [item],
        x: item.x,
        right: item.x + item.width,
      });
    }
  }

  // Sort items within each line left-to-right
  for (const line of lines) {
    line.items.sort((a, b) => a.x - b.x);
  }

  return lines.sort((a, b) => a.y - b.y);
}

function reconstructLayout(
  lines: Line[],
  images: ImageBlock[],
  pageWidth: number,
  pageHeight: number
): ContentBlock[] {
  if (lines.length === 0 && images.length === 0) return [];

  // Collect all font sizes to determine heading hierarchy
  const allSizes = lines.map(l => l.fontSize).filter(s => s > 0);
  const medianSize = median(allSizes) || 12;

  // Determine page margins from content distribution
  const leftMargin = percentile(lines.map(l => l.x).filter(x => x >= 0), 10) || 36;

  // Paragraph segmentation: group lines by vertical gap
  const blocks: ContentBlock[] = [];
  let paragraphLines: Line[] = [];
  let lastY = -1;
  let lastFontSize = medianSize;

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;

    const block = classifyParagraph(paragraphLines, medianSize, pageWidth, leftMargin);
    blocks.push(block);
    paragraphLines = [];
  };

  for (const line of lines) {
    if (lastY < 0) {
      paragraphLines.push(line);
      lastY = line.y;
      lastFontSize = line.fontSize;
      continue;
    }

    const gap = line.y - lastY;
    const lineHeight = Math.max(lastFontSize, line.fontSize, 10);
    const gapRatio = gap / lineHeight;

    // New block if: gap > 1.8× line height, or font size change is large (heading boundary)
    const isFontJump = Math.abs(line.fontSize - lastFontSize) > medianSize * 0.3;
    const isGapBig = gapRatio > 1.8;

    if (isGapBig || isFontJump) {
      flushParagraph();
    }

    paragraphLines.push(line);
    lastY = line.y;
    lastFontSize = line.fontSize;
  }
  flushParagraph();

  // Merge images into blocks at correct Y positions
  const allBlocks: ContentBlock[] = [...blocks, ...images];
  allBlocks.sort((a, b) => a.y - b.y);

  // Detect and convert table-like blocks
  return detectAndConvertTables(allBlocks);
}

function classifyParagraph(
  lines: Line[],
  medianSize: number,
  pageWidth: number,
  leftMargin: number
): ParagraphBlock {
  const primaryFontSize = lines[0]?.fontSize || medianSize;
  const sizeRatio = primaryFontSize / medianSize;

  // Heading detection by size ratio
  let level: 1 | 2 | 3 | undefined;
  if (sizeRatio >= 1.5) level = 1;
  else if (sizeRatio >= 1.25) level = 2;
  else if (sizeRatio >= 1.1) level = 3;

  // Alignment detection based on first line's x position and line width
  const alignment = detectAlignment(lines, pageWidth, leftMargin);

  // Indentation: how far right of left margin is the first line
  const firstX = lines[0]?.x || leftMargin;
  const indentPts = Math.max(0, firstX - leftMargin);
  // Convert pts to twips (1 pt = 20 twips)
  const indentTwips = Math.round(indentPts * 20);

  return {
    type: level ? 'heading' : 'paragraph',
    y: lines[0]?.y || 0,
    level,
    lines,
    alignment,
    indent: indentTwips,
  };
}

function detectAlignment(
  lines: Line[],
  pageWidth: number,
  leftMargin: number
): 'left' | 'center' | 'right' | 'justify' {
  if (lines.length === 0) return 'left';

  // Use the longest line for alignment detection
  const widestLine = lines.reduce((a, b) => (b.right - b.x > a.right - a.x ? b : a));

  const lineX = widestLine.x;
  const lineRight = widestLine.right;
  const lineWidth = lineRight - lineX;
  const rightMargin = pageWidth - leftMargin;

  const centerX = (lineX + lineRight) / 2;
  const pageCenterX = pageWidth / 2;

  // Center: line center is near page center and short
  if (Math.abs(centerX - pageCenterX) < pageWidth * 0.08 && lineWidth < pageWidth * 0.7) {
    return 'center';
  }

  // Right: line starts far right
  if (lineX > pageWidth * 0.6) {
    return 'right';
  }

  // Justify: line fills most of the page width across multiple lines
  if (
    lines.length > 2 &&
    lineWidth > (rightMargin - leftMargin) * 0.9
  ) {
    return 'justify';
  }

  return 'left';
}

function detectAndConvertTables(blocks: ContentBlock[]): ContentBlock[] {
  // Look for consecutive paragraph blocks whose lines have many shared X alignments
  const result: ContentBlock[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type !== 'paragraph' && block.type !== 'heading') {
      result.push(block);
      i++;
      continue;
    }

    // Collect a run of paragraph blocks to check for table pattern
    const runStart = i;
    const run: ParagraphBlock[] = [block as ParagraphBlock];
    let j = i + 1;
    while (j < blocks.length && (blocks[j].type === 'paragraph' || blocks[j].type === 'heading')) {
      const prev = blocks[j - 1] as ParagraphBlock;
      const curr = blocks[j] as ParagraphBlock;
      // Only include nearby blocks (within 2× line height gap)
      const gap = curr.y - prev.y;
      const avgSize = (prev.lines[0]?.fontSize || 12 + curr.lines[0]?.fontSize || 12) / 2;
      if (gap > avgSize * 3) break;
      run.push(curr as ParagraphBlock);
      j++;
    }

    // Check if run looks like a table (≥2 rows, each with ≥2 lines at shared X positions)
    if (run.length >= 3) {
      const table = tryBuildTable(run);
      if (table) {
        result.push(table);
        i = j;
        continue;
      }
    }

    result.push(block);
    i++;
  }

  return result;
}

function tryBuildTable(paragraphs: ParagraphBlock[]): TableBlock | null {
  // Gather all X positions of items across the run
  const xPositions: number[] = [];
  for (const para of paragraphs) {
    for (const line of para.lines) {
      for (const item of line.items) {
        xPositions.push(Math.round(item.x));
      }
    }
  }

  // Find clustered X positions (column dividers)
  const colX = clusterValues(xPositions, 20);
  if (colX.length < 2) return null; // Need at least 2 columns for a table

  // Each paragraph block becomes a row; each item assigned to nearest column
  const tableRows: TableRowData[] = [];
  for (const para of paragraphs) {
    const cells: Map<number, Line[]> = new Map();
    for (const colXVal of colX) cells.set(colXVal, []);

    for (const line of para.lines) {
      // Assign line to nearest column
      const lineX = line.x;
      let nearestCol = colX[0];
      let minDist = Math.abs(lineX - colX[0]);
      for (const cx of colX) {
        const d = Math.abs(lineX - cx);
        if (d < minDist) { minDist = d; nearestCol = cx; }
      }
      cells.get(nearestCol)!.push(line);
    }

    const cellData: TableCellData[] = colX.map(cx => ({ lines: cells.get(cx) || [] }));
    // Only include as table row if at least 2 cells have content
    const filledCells = cellData.filter(c => c.lines.length > 0);
    if (filledCells.length < 2) return null;
    tableRows.push({ cells: cellData });
  }

  if (tableRows.length < 2) return null;

  return {
    type: 'table',
    y: paragraphs[0].y,
    rows: tableRows,
  };
}

/** Cluster numeric values that are within `tolerance` of each other */
function clusterValues(values: number[], tolerance: number): number[] {
  if (values.length === 0) return [];
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const clusters: number[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - clusters[clusters.length - 1] > tolerance) {
      clusters.push(sorted[i]);
    }
  }
  return clusters;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 – DOCX Generation
// ─────────────────────────────────────────────────────────────────────────────

/** Max image width in EMU (English Metric Units). 6 inches × 914400 EMU/inch */
const MAX_IMG_WIDTH_EMU = 6 * 914400;

function buildDocxElements(blocks: ContentBlock[], pageWidth: number): any[] {
  const children: any[] = [];

  for (const block of blocks) {
    if (block.type === 'paragraph' || block.type === 'heading') {
      children.push(...buildParagraphBlock(block as ParagraphBlock));
    } else if (block.type === 'image') {
      const imgBlock = block as ImageBlock;
      children.push(buildImageParagraph(imgBlock));
    } else if (block.type === 'table') {
      children.push(buildTable(block as TableBlock));
    }
  }

  return children;
}

function buildParagraphBlock(block: ParagraphBlock): any[] {
  const elements: any[] = [];

  const alignmentMap: Record<string, typeof AlignmentType[keyof typeof AlignmentType]> = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
    justify: AlignmentType.JUSTIFIED,
  };
  const alignment = alignmentMap[block.alignment] || AlignmentType.LEFT;

  for (const line of block.lines) {
    const runs = buildTextRuns(line);
    if (runs.length === 0) continue;

    const paraOptions: any = {
      children: runs,
      alignment,
    };

    // Indentation
    if (block.indent > 0) {
      paraOptions.indent = { left: block.indent };
    }

    // Heading level
    if (block.type === 'heading' && block.level) {
      const headingMap: Record<number, any> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
      };
      paraOptions.heading = headingMap[block.level];
    }

    // Line spacing: use font size to determine spacing
    const lineFontSize = line.fontSize || 12;
    paraOptions.spacing = {
      line: Math.round(lineFontSize * 2 * 1.15 * 20), // 115% line spacing in twips
      lineRule: 'exact',
    };

    elements.push(new Paragraph(paraOptions));
  }

  // Add spacing after paragraph block (if not a heading)
  if (block.type === 'paragraph') {
    elements.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  }

  return elements;
}

function buildTextRuns(line: Line): TextRun[] {
  const runs: TextRun[] = [];

  for (let i = 0; i < line.items.length; i++) {
    const item = line.items[i];
    const next = line.items[i + 1];

    // Detect inter-word gap and add space if needed
    let text = item.text;
    if (next) {
      const gap = next.x - (item.x + item.width);
      const spaceThreshold = Math.max(item.fontSize * 0.2, 2);
      if (gap > spaceThreshold) {
        text += ' ';
      }
    }

    // Font size in half-points (docx unit)
    const sizeHalfPts = Math.max(Math.round(item.fontSize * 2), 16); // min 8pt

    // Clean up font name to a usable family
    const fontFamily = cleanFontName(item.fontName);

    const run: any = {
      text,
      bold: item.bold,
      italics: item.italic,
      size: sizeHalfPts,
    };

    if (fontFamily) {
      run.font = { name: fontFamily };
    }

    runs.push(new TextRun(run));
  }

  return runs;
}

/** Strip PDF internal font name prefixes and return a clean family name */
function cleanFontName(fontName: string): string {
  if (!fontName) return '';
  // PDF fonts often look like "ABCDEF+TimesNewRoman" or "Arial-BoldMT"
  const cleaned = fontName
    .replace(/^[A-Z]{6}\+/, '') // Strip 6-char subset prefix
    .replace(/[-,](Bold|Italic|Regular|MT|BoldMT|ItalicMT|BoldItalicMT|Roman|Oblique|Light|Medium|Narrow|Condensed|Extended)/gi, '')
    .trim();

  // Map common PDF font names to safe web-safe families
  const fontMap: Record<string, string> = {
    'TimesNewRoman': 'Times New Roman',
    'Times': 'Times New Roman',
    'Arial': 'Arial',
    'Helvetica': 'Arial',
    'Calibri': 'Calibri',
    'Courier': 'Courier New',
    'CourierNew': 'Courier New',
    'Georgia': 'Georgia',
    'Verdana': 'Verdana',
    'TrebuchetMS': 'Trebuchet MS',
    'ComicSansMS': 'Comic Sans MS',
    'GaramondRegular': 'Garamond',
    'Garamond': 'Garamond',
  };

  return fontMap[cleaned] || cleaned || '';
}

function buildImageParagraph(imgBlock: ImageBlock): any {
  // Scale image to fit within page width
  let w = imgBlock.width;
  let h = imgBlock.height;

  // Convert pts to EMU (1 pt = 12700 EMU)
  const wEmu = w * 12700;
  const hEmu = h * 12700;

  let finalW = wEmu;
  let finalH = hEmu;

  if (finalW > MAX_IMG_WIDTH_EMU) {
    finalH = Math.round((MAX_IMG_WIDTH_EMU / finalW) * finalH);
    finalW = MAX_IMG_WIDTH_EMU;
  }

  // Minimum sensible size
  if (finalW < 914400 * 0.5) { // less than 0.5 inch
    finalW = 914400; // 1 inch
    finalH = Math.round((hEmu / wEmu) * finalW) || 914400;
  }

  return new Paragraph({
    children: [
      new ImageRun({
        data: imgBlock.buffer,
        transformation: {
          width: Math.round(finalW / 9144),  // EMU → points (for docx lib)
          height: Math.round(finalH / 9144),
        },
      } as any),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 100 },
  });
}

function buildTable(tableBlock: TableBlock): Table {
  const numCols = Math.max(...tableBlock.rows.map(r => r.cells.length));

  const tableRows = tableBlock.rows.map(rowData => {
    const cells = rowData.cells.map(cellData => {
      const cellParas = cellData.lines.length > 0
        ? cellData.lines.map(line => {
            const runs = buildTextRuns(line);
            return new Paragraph({ children: runs.length > 0 ? runs : [new TextRun({ text: '' })] });
          })
        : [new Paragraph({ children: [new TextRun({ text: '' })] })];

      return new TableCell({
        children: cellParas,
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
      });
    });

    return new TableRow({ children: cells });
  });

  return new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}
