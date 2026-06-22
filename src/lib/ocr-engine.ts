/**
 * lib/ocr-engine.ts
 *
 * OCR engine using Tesseract.js.
 *
 * Exports two functions:
 *  - recognizeImageText: Simple full-page text extraction (legacy/simple use)
 *  - recognizeImageStructured: Word-level bounding boxes for layout reconstruction
 */

import { createWorker, PSM } from 'tesseract.js';

/** Simple text extraction — returns the full page as a single string. */
export async function recognizeImageText(imageDataUrl: string): Promise<string> {
  const worker = await createWorker('eng');

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO_OSD,
    preserve_interword_spaces: '1',
  });

  const { data: { text } } = await worker.recognize(imageDataUrl);
  await worker.terminate();

  return text;
}

/** A single recognized word with its bounding box in canvas pixels (top-down). */
export interface OcrWord {
  text: string;
  x0: number; // left
  y0: number; // top
  x1: number; // right
  y1: number; // bottom
  confidence: number;
}

/**
 * Structured OCR extraction — returns word-level bounding boxes.
 *
 * The coordinates are in canvas pixels with Y=0 at the TOP of the image
 * (matches the standard canvas coordinate system used by the caller).
 *
 * Words with confidence < 30 or empty text are filtered out.
 */
export async function recognizeImageStructured(imageDataUrl: string): Promise<OcrWord[]> {
  const worker = await createWorker('eng');

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO_OSD,
    preserve_interword_spaces: '1',
  });

  const { data } = await worker.recognize(imageDataUrl);
  await worker.terminate();

  const words: OcrWord[] = [];

  for (const block of (data as any).blocks || []) {
    for (const para of block.paragraphs || []) {
      for (const line of para.lines || []) {
        for (const word of line.words || []) {
          if (!word.text?.trim()) continue;
          if ((word.confidence ?? 0) < 30) continue;

          words.push({
            text: word.text,
            x0: word.bbox.x0,
            y0: word.bbox.y0,
            x1: word.bbox.x1,
            y1: word.bbox.y1,
            confidence: word.confidence,
          });
        }
      }
    }
  }

  return words;
}
