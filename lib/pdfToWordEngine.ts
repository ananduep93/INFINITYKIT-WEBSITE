import { getPdfJs } from './pdfjs';
import { Document, Packer, Paragraph, TextRun, ImageRun, PageBreak, Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType } from 'docx';
import { recognizeImageText } from './ocr-engine';

export interface PDFToWordOptions {
  file: File;
  useOcr?: boolean;
  onProgress?: (progress: string) => void;
}

interface Block {
  type: 'paragraph' | 'image' | 'table';
  y: number; // For sorting
  items?: any[]; // For paragraph
  imageData?: { buffer: ArrayBuffer; width: number; height: number }; // For image
}

export async function convertPdfToWord(options: PDFToWordOptions) {
  const { file, useOcr = false, onProgress } = options;
  const pdfjsLib = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const children: any[] = [];

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) onProgress(`Analyzing layout for page ${i} of ${numPages}…`);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const operatorList = await page.getOperatorList();

    const blocks: Block[] = [];

    // 1. Extract Text Items
    const items = textContent.items.filter((item: any) => item.str && item.str.trim().length > 0);
    
    // Determine if OCR is needed (very few text items but we have a page)
    if (useOcr && items.length < 10) {
      if (onProgress) onProgress(`Running OCR on scanned page ${i}…`);
      // For a real client-side OCR, we'd render the page to a canvas and pass it to Tesseract
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // High scale for better OCR
        const ocrViewport = page.getViewport({ scale: 2.0 });
        canvas.width = ocrViewport.width;
        canvas.height = ocrViewport.height;
        await page.render({ canvasContext: ctx, viewport: ocrViewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        
        try {
          const ocrText = await recognizeImageText(dataUrl);
          if (ocrText && ocrText.trim()) {
            blocks.push({
              type: 'paragraph',
              y: viewport.height, // top of page
              items: [{ str: ocrText.trim(), transform: [0,0,0,0,0,viewport.height], height: 12, fontName: '' }]
            });
          }
        } catch (e) {
          console.warn('OCR Failed for page', i, e);
        }
      }
    }

    // 2. Group Text into Lines by Y coordinate (tolerance of ~4 units)
    if (items.length > 0) {
      const lines: any[] = [];
      items.sort((a: any, b: any) => b.transform[5] - a.transform[5]); // Sort Top to Bottom

      let currentLine: any = null;
      for (const item of items) {
        if (!currentLine) {
          currentLine = { y: item.transform[5], items: [item] };
          lines.push(currentLine);
        } else {
          if (Math.abs(currentLine.y - item.transform[5]) < 5) {
            currentLine.items.push(item);
          } else {
            currentLine.items.sort((a: any, b: any) => a.transform[4] - b.transform[4]); // Sort Left to Right
            currentLine = { y: item.transform[5], items: [item] };
            lines.push(currentLine);
          }
        }
      }
      if (currentLine) {
        currentLine.items.sort((a: any, b: any) => a.transform[4] - b.transform[4]);
      }

      // Group Lines into Paragraph Blocks
      let currentParagraph: any[] = [];
      let lastLineY = -1;

      for (const line of lines) {
        if (lastLineY !== -1) {
          const gap = lastLineY - line.y;
          // If gap is large, new paragraph
          if (gap > 20) {
            if (currentParagraph.length > 0) {
              blocks.push({ type: 'paragraph', y: currentParagraph[0].y, items: currentParagraph });
              currentParagraph = [];
            }
          }
        }
        currentParagraph.push(line);
        lastLineY = line.y;
      }
      if (currentParagraph.length > 0) {
        blocks.push({ type: 'paragraph', y: currentParagraph[0].y, items: currentParagraph });
      }
    }

    // 3. Extract Images and determine their approximate Y coordinate
    if (onProgress) onProgress(`Extracting images for page ${i}…`);
    for (let j = 0; j < operatorList.fnArray.length; j++) {
      const fn = operatorList.fnArray[j];
      const isInline = fn === pdfjsLib.OPS.paintInlineImageXObject;
      const isImageOp = 
        fn === pdfjsLib.OPS.paintImageXObject || 
        fn === pdfjsLib.OPS.paintImageMaskXObject ||
        fn === pdfjsLib.OPS.paintXObject ||
        (pdfjsLib.OPS.paintJpegXObject && fn === pdfjsLib.OPS.paintJpegXObject);

      if (isImageOp || isInline) {
        let img: any = null;
        if (isInline) {
          img = operatorList.argsArray[j][0];
        } else {
          const imgKey = operatorList.argsArray[j][0];
          img = await new Promise<any>((resolve) => {
            let res = false;
            const timer = setTimeout(() => { if(!res){res=true; resolve(null);} }, 500);
            page.objs.get(imgKey, (obj: any) => { if(!res){res=true; clearTimeout(timer); resolve(obj);} });
          });
        }

        if (img && img.width && img.height) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            let hasDrawn = false;
            const drawable = img.bitmap || img.image || img;
            if (drawable && (drawable instanceof HTMLImageElement || drawable instanceof ImageBitmap || drawable instanceof HTMLCanvasElement)) {
              ctx.drawImage(drawable, 0, 0);
              hasDrawn = true;
            } else if (img.data) {
              try {
                const imgData = ctx.createImageData(img.width, img.height);
                if (img.data.length === img.width * img.height * 3) {
                  let src=0, dst=0;
                  for (let k=0; k<img.width*img.height; k++) {
                    imgData.data[dst++] = img.data[src++]; imgData.data[dst++] = img.data[src++]; imgData.data[dst++] = img.data[src++]; imgData.data[dst++] = 255;
                  }
                  ctx.putImageData(imgData, 0, 0); hasDrawn = true;
                } else if (img.data.length === img.width * img.height * 4) {
                  imgData.data.set(img.data); ctx.putImageData(imgData, 0, 0); hasDrawn = true;
                }
              } catch(e) {}
            }

            if (hasDrawn) {
              const dataUrl = canvas.toDataURL('image/png');
              const res = await fetch(dataUrl);
              const buffer = await res.arrayBuffer();
              
              // We estimate Y coordinate if possible, or append to end
              // To get real Y, we need to track CTM. For heuristic, we'll append to bottom
              blocks.push({
                type: 'image',
                y: -1000 - blocks.length, // Force image to bottom if we can't determine Y
                imageData: { buffer, width: img.width, height: img.height }
              });
            }
          }
        }
      }
    }

    // 4. Sort blocks by Y coordinate descending (Top to Bottom)
    blocks.sort((a, b) => b.y - a.y);

    // 5. Construct Docx Paragraphs
    for (const block of blocks) {
      if (block.type === 'paragraph' && block.items) {
        for (const line of block.items) {
          const runs = [];
          for (const item of line.items) {
            // Check for bold/italic via font name
            const isBold = /bold/i.test(item.fontName || '');
            const isItalic = /italic|oblique/i.test(item.fontName || '');
            
            runs.push(new TextRun({
              text: item.str + ' ',
              bold: isBold,
              italics: isItalic,
              size: Math.round(item.height * 2) || 24, // font size in half-points
            }));
          }
          children.push(new Paragraph({ children: runs }));
        }
        // Paragraph spacing
        children.push(new Paragraph({ text: '' }));
      } else if (block.type === 'image' && block.imageData) {
        let w = block.imageData.width;
        let h = block.imageData.height;
        if (w > 600) {
          h = Math.round((600 / w) * h);
          w = 600;
        }
        children.push(new Paragraph({
          children: [
            new ImageRun({
              data: block.imageData.buffer,
              transformation: { width: w, height: h }
            } as any)
          ],
          alignment: AlignmentType.CENTER
        }));
        children.push(new Paragraph({ text: '' }));
      }
    }

    if (i < numPages) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  if (onProgress) onProgress('Packaging Word document…');

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } }
      },
      children
    }]
  });

  const docBlob = await Packer.toBlob(doc);
  const downloadUrl = URL.createObjectURL(docBlob);

  return {
    downloadUrl,
    fileName: `${file.name.replace(/\.pdf$/i, '')}.docx`,
    resultData: `Successfully converted "${file.name}" with layout heuristics — ${numPages} page(s).`
  };
}
