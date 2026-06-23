/**
 * lib/pdfToWordEngine.ts
 *
 * High-fidelity PDF → DOCX conversion engine — dual-mode:
 *
 *   'visual'   (default) — Renders each PDF page as a high-resolution PNG image
 *                          and embeds it in the DOCX at full page width.
 *                          Result looks 100% identical to the original PDF.
 *                          Text is not editable/searchable.
 *
 *   'editable' — Extracts text, headings, images, alignment, indentation, and
 *                tables using coordinate-based reconstruction.
 *                Text is editable but layout may vary from the original.
 *
 * Constraints:
 *   - Runs 100% in the browser (no server required)
 *   - Vercel / Edge / Serverless compatible
 *   - No new npm packages — uses pdfjs-dist, docx, tesseract.js (already installed)
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
} from 'docx';

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export type ConversionMode = 'visual' | 'editable';

export interface PDFToWordOptions {
  file: File;
  /** 'visual' = page images (default, best fidelity). 'editable' = reconstructed text. */
  mode?: ConversionMode;
  /** Only applies to 'editable' mode — runs OCR on scanned pages. */
  useOcr?: boolean;
  onProgress?: (progress: string) => void;
}

export async function convertPdfToWord(options: PDFToWordOptions) {
  const { file, mode = 'visual', useOcr = false, onProgress } = options;
  const progress = (msg: string) => onProgress && onProgress(msg);

  progress('Loading PDF…');
  const pdfjsLib = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const docChildren: any[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    progress(`Processing page ${pageNum} of ${numPages}…`);
    const page = await pdf.getPage(pageNum);

    let pageChildren: any[];

    if (mode === 'visual') {
      pageChildren = await buildVisualPage(page, pageNum);
    } else {
      pageChildren = await buildEditablePage(page, pageNum, numPages, useOcr, pdfjsLib, progress);
    }

    docChildren.push(...pageChildren);

    if (pageNum < numPages) {
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  progress('Packaging Word document…');

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 360,    // 0.25 inch — minimal margins for image mode to look right
            right: 360,
            bottom: 360,
            left: 360,
          },
        },
      },
      children: docChildren,
    }],
  });

  const docBlob = await Packer.toBlob(doc);
  const downloadUrl = URL.createObjectURL(docBlob);
  const modeLabel = mode === 'visual' ? 'visual fidelity (image)' : 'editable text';

  return {
    downloadUrl,
    fileName: `${file.name.replace(/\.pdf$/i, '')}.docx`,
    resultData: `Successfully converted "${file.name}" — ${numPages} page(s) [${modeLabel} mode].`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// VISUAL MODE — Render each page to a high-res PNG, embed as image in DOCX
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a PDF page to a PNG at 2× scale and returns a DOCX Paragraph
 * containing that image at full usable page width (8 inches @ 96 DPI).
 *
 * At scale=2, a standard A4 page (595 pt wide) renders to ~1684px wide.
 * We embed it at a fixed 7.5-inch display width in the DOCX which fills the
 * page between the minimal margins.
 */
async function buildVisualPage(page: any, pageNum: number): Promise<any[]> {
  const RENDER_SCALE = 2.0;   // 2× for retina-quality output
  const viewport = page.getViewport({ scale: RENDER_SCALE });

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  // White background (PDFs may be transparent)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport }).promise;

  // Export as JPEG (smaller file than PNG for text documents)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const res = await fetch(dataUrl);
  const buffer = await res.arrayBuffer();

  // Display dimensions in EMU (English Metric Units — what docx uses internally)
  // 7.5 inches × 914400 EMU/inch = 6858000 EMU wide (fills page with 0.5in margins)
  const PAGE_WIDTH_EMU = 7.5 * 914400;
  const aspectRatio = canvas.height / canvas.width;
  const PAGE_HEIGHT_EMU = Math.round(PAGE_WIDTH_EMU * aspectRatio);

  // docx ImageRun transformation takes pixels at 96 DPI
  // 1 EMU = 1/914400 inch, at 96 DPI: 1 pixel = 914400/96 = 9525 EMU
  const widthPx = Math.round(PAGE_WIDTH_EMU / 9525);
  const heightPx = Math.round(PAGE_HEIGHT_EMU / 9525);

  return [
    new Paragraph({
      children: [
        new ImageRun({
          data: buffer,
          transformation: { width: widthPx, height: heightPx },
          type: 'jpg',
        } as any),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
    }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// EDITABLE MODE — Coordinate-based text/table/image reconstruction
// ─────────────────────────────────────────────────────────────────────────────

async function buildEditablePage(
  page: any,
  pageNum: number,
  totalPages: number,
  useOcr: boolean,
  pdfjsLib: any,
  progress: (msg: string) => void
): Promise<any[]> {
  const viewport = page.getViewport({ scale: 1.0 });
  const pageWidth = viewport.width;
  const pageHeight = viewport.height;

  // Phase 1: Extract content
  const textContent = await page.getTextContent({ includeMarkedContent: false } as any);
  const rawItems: RawTextItem[] = extractTextItems(textContent, pageHeight);
  const isScanned = rawItems.filter(i => i.text.trim().length > 0).length < 10;

  let pageItems: RawTextItem[] = rawItems;
  if (isScanned && useOcr) {
    progress(`Running OCR on scanned page ${pageNum}…`);
    pageItems = await extractOcrItems(page, pageWidth, pageHeight);
  }

  const images = await extractImages(page, pdfjsLib, pageHeight);

  // Phase 2: Layout reconstruction
  const lines = groupItemsIntoLines(pageItems);
  const blocks = reconstructLayout(lines, images, pageWidth, pageHeight);

  // Phase 3: DOCX elements
  return buildDocxElements(blocks, pageWidth);
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RawTextItem {
  text: string;
  x: number;
  y: number;       // top-down (0 = top of page)
  width: number;
  fontSize: number;
  fontName: string;
  bold: boolean;
  italic: boolean;
}

interface Line {
  y: number;
  fontSize: number;
  items: RawTextItem[];
  x: number;       // left-most X
  right: number;   // right-most edge
}

interface ContentBlock {
  type: 'paragraph' | 'heading' | 'image' | 'table';
  y: number;
}

interface ParagraphBlock extends ContentBlock {
  type: 'paragraph' | 'heading';
  level?: 1 | 2 | 3;
  lines: Line[];
  alignment: 'left' | 'center' | 'right' | 'justify';
  indent: number;  // in twips
}

interface ImageBlock extends ContentBlock {
  type: 'image';
  buffer: ArrayBuffer;
  width: number;   // pts
  height: number;  // pts
}

interface TableBlock extends ContentBlock {
  type: 'table';
  rows: Array<{ cells: Array<{ lines: Line[] }> }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1 – PDF Analysis (Editable mode)
// ─────────────────────────────────────────────────────────────────────────────

function extractTextItems(textContent: any, pageHeight: number): RawTextItem[] {
  const items: RawTextItem[] = [];
  for (const item of textContent.items as any[]) {
    if (typeof item.str !== 'string' || item.str.length === 0) continue;

    const [a, b, c, d, x, rawY] = item.transform as number[];
    // Font size from transform matrix scale (never 0)
    const fontSize = Math.max(Math.sqrt(a * a + b * b), Math.sqrt(c * c + d * d), item.height || 0) || 12;
    const y = pageHeight - rawY; // flip to top-down

    const fontName = item.fontName || '';
    items.push({
      text: item.str,
      x,
      y,
      width: item.width || 0,
      fontSize,
      fontName,
      bold: /bold/i.test(fontName),
      italic: /italic|oblique/i.test(fontName),
    });
  }
  return items;
}

async function extractOcrItems(page: any, pageWidth: number, pageHeight: number): Promise<RawTextItem[]> {
  const scale = 2.0;
  const ocrViewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = ocrViewport.width;
  canvas.height = ocrViewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  await page.render({ canvasContext: ctx, viewport: ocrViewport }).promise;

  try {
    const { recognizeImageStructured } = await import('./ocr-engine');
    const words = await recognizeImageStructured(canvas.toDataURL('image/png'));
    return words
      .filter(w => w.text.trim().length > 0)
      .map(w => ({
        text: w.text,
        x: w.x0 / scale,
        y: w.y0 / scale,
        width: (w.x1 - w.x0) / scale,
        fontSize: Math.max((w.y1 - w.y0) / scale * 0.75, 8),
        fontName: '',
        bold: false,
        italic: false,
      }));
  } catch (e) {
    console.warn('OCR failed', e);
    return [];
  }
}

async function extractImages(page: any, pdfjsLib: any, pageHeight: number): Promise<ImageBlock[]> {
  const images: ImageBlock[] = [];
  const operatorList = await page.getOperatorList();

  let ctm: number[] = [1, 0, 0, 1, 0, 0];
  const ctmStack: number[][] = [];

  for (let j = 0; j < operatorList.fnArray.length; j++) {
    const fn = operatorList.fnArray[j];
    const args = operatorList.argsArray[j];

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

    const imgY = pageHeight - ctm[5];

    let imgObj: any = null;
    if (isInline) {
      imgObj = args[0];
    } else {
      imgObj = await new Promise<any>(resolve => {
        let done = false;
        const t = setTimeout(() => { if (!done) { done = true; resolve(null); } }, 800);
        page.objs.get(args[0], (obj: any) => { if (!done) { done = true; clearTimeout(t); resolve(obj); } });
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
    if (drawable instanceof HTMLImageElement || drawable instanceof ImageBitmap || drawable instanceof HTMLCanvasElement) {
      ctx.drawImage(drawable, 0, 0);
      drawn = true;
    } else if (imgObj.data) {
      try {
        const imgData = ctx.createImageData(imgObj.width, imgObj.height);
        const src = imgObj.data;
        if (src.length === imgObj.width * imgObj.height * 3) {
          let s = 0, d = 0;
          for (let k = 0; k < imgObj.width * imgObj.height; k++) {
            imgData.data[d++] = src[s++]; imgData.data[d++] = src[s++];
            imgData.data[d++] = src[s++]; imgData.data[d++] = 255;
          }
          ctx.putImageData(imgData, 0, 0); drawn = true;
        } else if (src.length === imgObj.width * imgObj.height * 4) {
          imgData.data.set(src); ctx.putImageData(imgData, 0, 0); drawn = true;
        }
      } catch (_) { /* skip */ }
    }
    if (!drawn) continue;

    const res = await fetch(canvas.toDataURL('image/png'));
    const buffer = await res.arrayBuffer();

    images.push({
      type: 'image',
      y: imgY,
      buffer,
      width: Math.abs(ctm[0]) || imgObj.width,
      height: Math.abs(ctm[3]) || imgObj.height,
    });
  }
  return images;
}

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
// Phase 2 – Layout Reconstruction (Editable mode)
// ─────────────────────────────────────────────────────────────────────────────

function groupItemsIntoLines(items: RawTextItem[]): Line[] {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: Line[] = [];

  for (const item of sorted) {
    const tol = Math.max(item.fontSize * 0.55, 3);
    const existing = lines.find(l => Math.abs(l.y - item.y) <= tol);
    if (existing) {
      existing.items.push(item);
      existing.fontSize = Math.max(existing.fontSize, item.fontSize);
      existing.x = Math.min(existing.x, item.x);
      existing.right = Math.max(existing.right, item.x + item.width);
    } else {
      lines.push({ y: item.y, fontSize: item.fontSize, items: [item], x: item.x, right: item.x + item.width });
    }
  }

  for (const line of lines) line.items.sort((a, b) => a.x - b.x);
  return lines.sort((a, b) => a.y - b.y);
}

function reconstructLayout(lines: Line[], images: ImageBlock[], pageWidth: number, pageHeight: number): ContentBlock[] {
  if (lines.length === 0 && images.length === 0) return [];

  const allSizes = lines.map(l => l.fontSize).filter(s => s > 0);
  const medianSize = median(allSizes) || 12;
  const leftMargin = percentile(lines.map(l => l.x).filter(x => x >= 0), 10) || 36;

  const blocks: ContentBlock[] = [];
  let paragraphLines: Line[] = [];
  let lastY = -1;
  let lastFontSize = medianSize;

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push(classifyParagraph(paragraphLines, medianSize, pageWidth, leftMargin));
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
    const isFontJump = Math.abs(line.fontSize - lastFontSize) > medianSize * 0.3;
    const isGapBig = gap / lineHeight > 1.8;

    if (isGapBig || isFontJump) flushParagraph();

    paragraphLines.push(line);
    lastY = line.y;
    lastFontSize = line.fontSize;
  }
  flushParagraph();

  const allBlocks: ContentBlock[] = [...blocks, ...images];
  allBlocks.sort((a, b) => a.y - b.y);
  return detectAndConvertTables(allBlocks);
}

function classifyParagraph(lines: Line[], medianSize: number, pageWidth: number, leftMargin: number): ParagraphBlock {
  const primaryFontSize = lines[0]?.fontSize || medianSize;
  const sizeRatio = primaryFontSize / medianSize;

  let level: 1 | 2 | 3 | undefined;
  if (sizeRatio >= 1.5) level = 1;
  else if (sizeRatio >= 1.25) level = 2;
  else if (sizeRatio >= 1.1) level = 3;

  const alignment = detectAlignment(lines, pageWidth, leftMargin);
  const indentTwips = Math.round(Math.max(0, (lines[0]?.x || leftMargin) - leftMargin) * 20);

  return {
    type: level ? 'heading' : 'paragraph',
    y: lines[0]?.y || 0,
    level,
    lines,
    alignment,
    indent: indentTwips,
  };
}

function detectAlignment(lines: Line[], pageWidth: number, leftMargin: number): 'left' | 'center' | 'right' | 'justify' {
  if (lines.length === 0) return 'left';
  const widestLine = lines.reduce((a, b) => (b.right - b.x > a.right - a.x ? b : a));
  const lineX = widestLine.x;
  const lineRight = widestLine.right;
  const lineWidth = lineRight - lineX;
  const centerX = (lineX + lineRight) / 2;

  if (Math.abs(centerX - pageWidth / 2) < pageWidth * 0.08 && lineWidth < pageWidth * 0.7) return 'center';
  if (lineX > pageWidth * 0.6) return 'right';
  if (lines.length > 2 && lineWidth > (pageWidth - leftMargin * 2) * 0.9) return 'justify';
  return 'left';
}

function detectAndConvertTables(blocks: ContentBlock[]): ContentBlock[] {
  const result: ContentBlock[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    if (block.type !== 'paragraph' && block.type !== 'heading') {
      result.push(block); i++; continue;
    }

    const run: ParagraphBlock[] = [block as ParagraphBlock];
    let j = i + 1;
    while (j < blocks.length && (blocks[j].type === 'paragraph' || blocks[j].type === 'heading')) {
      const prev = blocks[j - 1] as ParagraphBlock;
      const curr = blocks[j] as ParagraphBlock;
      if (curr.y - prev.y > (prev.lines[0]?.fontSize || 12) * 3) break;
      run.push(curr as ParagraphBlock);
      j++;
    }

    if (run.length >= 3) {
      const table = tryBuildTable(run);
      if (table) { result.push(table); i = j; continue; }
    }

    result.push(block); i++;
  }
  return result;
}

function tryBuildTable(paragraphs: ParagraphBlock[]): TableBlock | null {
  const xPositions: number[] = [];
  for (const para of paragraphs)
    for (const line of para.lines)
      for (const item of line.items)
        xPositions.push(Math.round(item.x));

  const colX = clusterValues(xPositions, 20);
  if (colX.length < 2) return null;

  const tableRows: TableBlock['rows'] = [];
  for (const para of paragraphs) {
    const cells: Map<number, Line[]> = new Map();
    for (const cx of colX) cells.set(cx, []);

    for (const line of para.lines) {
      let nearestCol = colX[0];
      let minDist = Math.abs(line.x - colX[0]);
      for (const cx of colX) {
        const d = Math.abs(line.x - cx);
        if (d < minDist) { minDist = d; nearestCol = cx; }
      }
      cells.get(nearestCol)!.push(line);
    }

    const cellData = colX.map(cx => ({ lines: cells.get(cx) || [] }));
    if (cellData.filter(c => c.lines.length > 0).length < 2) return null;
    tableRows.push({ cells: cellData });
  }

  if (tableRows.length < 2) return null;
  return { type: 'table', y: paragraphs[0].y, rows: tableRows };
}

function clusterValues(values: number[], tolerance: number): number[] {
  if (values.length === 0) return [];
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const clusters: number[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - clusters[clusters.length - 1] > tolerance) clusters.push(sorted[i]);
  }
  return clusters;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 – DOCX Generation (Editable mode)
// ─────────────────────────────────────────────────────────────────────────────

// 6 inches max image width in EMU
const MAX_IMG_EMU = 6 * 914400;

function buildDocxElements(blocks: ContentBlock[], pageWidth: number): any[] {
  const children: any[] = [];
  for (const block of blocks) {
    if (block.type === 'paragraph' || block.type === 'heading') {
      children.push(...buildParagraphBlock(block as ParagraphBlock));
    } else if (block.type === 'image') {
      children.push(buildImageParagraph(block as ImageBlock));
    } else if (block.type === 'table') {
      children.push(buildTable(block as TableBlock));
    }
  }
  return children;
}

function buildParagraphBlock(block: ParagraphBlock): any[] {
  const elements: any[] = [];
  const alignMap: Record<string, any> = {
    left: AlignmentType.LEFT,
    center: AlignmentType.CENTER,
    right: AlignmentType.RIGHT,
    justify: AlignmentType.JUSTIFIED,
  };
  const alignment = alignMap[block.alignment] || AlignmentType.LEFT;

  for (const line of block.lines) {
    const runs = buildTextRuns(line);
    if (runs.length === 0) continue;

    const paraOptions: any = { children: runs, alignment };
    if (block.indent > 0) paraOptions.indent = { left: block.indent };
    if (block.type === 'heading' && block.level) {
      paraOptions.heading = [, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3][block.level];
    }

    const fs = line.fontSize || 12;
    paraOptions.spacing = {
      // Use auto line spacing (240 = single spacing in twips = 12pt × 20)
      // This is safer than 'exact' which can clip descenders
      line: Math.round(fs * 20 * 1.2),
      lineRule: 'auto',
    };

    elements.push(new Paragraph(paraOptions));
  }

  if (block.type === 'paragraph') {
    elements.push(new Paragraph({ text: '', spacing: { after: 80 } }));
  }
  return elements;
}

function buildTextRuns(line: Line): TextRun[] {
  const runs: TextRun[] = [];
  for (let i = 0; i < line.items.length; i++) {
    const item = line.items[i];
    const next = line.items[i + 1];

    let text = item.text;
    if (next) {
      const gap = next.x - (item.x + item.width);
      if (gap > Math.max(item.fontSize * 0.2, 2)) text += ' ';
    }

    const sizeHalfPts = Math.max(Math.round(item.fontSize * 2), 16);
    const fontFamily = cleanFontName(item.fontName);
    const run: any = { text, bold: item.bold, italics: item.italic, size: sizeHalfPts };
    if (fontFamily) run.font = { name: fontFamily };
    runs.push(new TextRun(run));
  }
  return runs;
}

function cleanFontName(fontName: string): string {
  if (!fontName) return '';
  const cleaned = fontName
    .replace(/^[A-Z]{6}\+/, '')
    .replace(/[-,](Bold|Italic|Regular|MT|BoldMT|ItalicMT|BoldItalicMT|Roman|Oblique|Light|Medium|Narrow|Condensed|Extended)/gi, '')
    .trim();
  const fontMap: Record<string, string> = {
    TimesNewRoman: 'Times New Roman', Times: 'Times New Roman',
    Arial: 'Arial', Helvetica: 'Arial',
    Calibri: 'Calibri', Courier: 'Courier New', CourierNew: 'Courier New',
    Georgia: 'Georgia', Verdana: 'Verdana', Garamond: 'Garamond',
  };
  return fontMap[cleaned] || cleaned || '';
}

function buildImageParagraph(imgBlock: ImageBlock): any {
  let wEmu = imgBlock.width * 12700;   // pts → EMU
  let hEmu = imgBlock.height * 12700;

  if (wEmu > MAX_IMG_EMU) {
    hEmu = Math.round((MAX_IMG_EMU / wEmu) * hEmu);
    wEmu = MAX_IMG_EMU;
  }
  if (wEmu < 914400 * 0.5) { // min 0.5 inch
    const ratio = hEmu / (wEmu || 1);
    wEmu = 914400;
    hEmu = Math.round(wEmu * ratio);
  }

  // docx ImageRun transformation takes pixels at 96 DPI (1 EMU = 1/914400 in, at 96dpi: 1px = 9525 EMU)
  const widthPx = Math.round(wEmu / 9525);
  const heightPx = Math.round(hEmu / 9525);

  return new Paragraph({
    children: [new ImageRun({ data: imgBlock.buffer, transformation: { width: widthPx, height: heightPx } } as any)],
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
  });
}

function buildTable(tableBlock: TableBlock): Table {
  const tableRows = tableBlock.rows.map(rowData =>
    new TableRow({
      children: rowData.cells.map(cellData =>
        new TableCell({
          children: cellData.lines.length > 0
            ? cellData.lines.map(line => {
                const runs = buildTextRuns(line);
                return new Paragraph({ children: runs.length > 0 ? runs : [new TextRun({ text: '' })] });
              })
            : [new Paragraph({ children: [new TextRun({ text: '' })] })],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
        })
      ),
    })
  );

  return new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } });
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}
