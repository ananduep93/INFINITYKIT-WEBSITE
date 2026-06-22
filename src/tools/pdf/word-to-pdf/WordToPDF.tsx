'use client';

import React from 'react';
import ToolWorkspace from '../../../components/ui/ToolWorkspace';

/** Parsed block of content ready for jsPDF rendering */
interface ContentBlock {
  text: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  bullet: boolean;
  spaceAfter: number; // vertical space to add after this block (in mm)
}

/**
 * Walk an HTML element tree produced by mammoth and extract ContentBlock[]
 * preserving headings, paragraphs, bold, italic, and list items.
 */
function parseHtmlToBlocks(html: string): ContentBlock[] {
  if (typeof window === 'undefined') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: ContentBlock[] = [];

  function extractText(node: Node, bold: boolean, italic: boolean): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const isBold = bold || tag === 'strong' || tag === 'b';
    const isItalic = italic || tag === 'em' || tag === 'i';
    return Array.from(el.childNodes)
      .map((child) => extractText(child, isBold, isItalic))
      .join('');
  }

  function hasBold(node: Element): boolean {
    const tag = node.tagName.toLowerCase();
    if (tag === 'strong' || tag === 'b') return true;
    return Array.from(node.querySelectorAll('strong,b')).length > 0;
  }

  function hasItalic(node: Element): boolean {
    const tag = node.tagName.toLowerCase();
    if (tag === 'em' || tag === 'i') return true;
    return Array.from(node.querySelectorAll('em,i')).length > 0;
  }

  function walkElement(el: Element) {
    const tag = el.tagName.toLowerCase();

    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      const level = parseInt(tag[1], 10);
      const fontSizeMap: Record<number, number> = { 1: 20, 2: 16, 3: 14, 4: 13, 5: 12, 6: 12 };
      blocks.push({
        text: (el.textContent ?? '').trim(),
        fontSize: fontSizeMap[level] ?? 12,
        bold: true,
        italic: false,
        bullet: false,
        spaceAfter: level <= 2 ? 4 : 2,
      });
    } else if (tag === 'p') {
      const text = (el.textContent ?? '').trim();
      if (text) {
        blocks.push({
          text,
          fontSize: 12,
          bold: hasBold(el),
          italic: hasItalic(el),
          bullet: false,
          spaceAfter: 2,
        });
      }
    } else if (tag === 'li') {
      const text = (el.textContent ?? '').trim();
      if (text) {
        blocks.push({
          text,
          fontSize: 12,
          bold: hasBold(el),
          italic: hasItalic(el),
          bullet: true,
          spaceAfter: 1,
        });
      }
    } else {
      // Recurse into containers (div, section, ul, ol, body, etc.)
      for (const child of Array.from(el.children)) {
        walkElement(child);
      }
    }
  }

  walkElement(doc.body);
  return blocks;
}

export default function WordToPDF() {
  const handleConvertToPDF = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a Word file.');
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();

    // 1. Convert docx → HTML (preserves headings, bold, italic, lists)
    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    if (!html.trim()) {
      throw new Error('No readable content found in the Word file.');
    }

    // 2. Parse HTML into structured content blocks
    const blocks = parseHtmlToBlocks(html);

    if (blocks.length === 0) {
      throw new Error('Could not extract any content from the Word file.');
    }

    // 3. Render with jsPDF using per-block font size/style
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    doc.setProperties({
      title: file.name.replace(/\.[^/.]+$/, ''),
      creator: 'InfinityKit',
    });

    const marginLeft = 15;
    const marginRight = 15;
    const marginTop = 20;
    const marginBottom = 20;
    const pageHeight: number = doc.internal.pageSize.getHeight();
    const pageWidth: number = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - marginLeft - marginRight;

    let y = marginTop;

    const addPageIfNeeded = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - marginBottom) {
        doc.addPage();
        y = marginTop;
      }
    };

    for (const block of blocks) {
      doc.setFontSize(block.fontSize);
      doc.setFont('helvetica', block.bold && block.italic ? 'bolditalic' : block.bold ? 'bold' : block.italic ? 'italic' : 'normal');

      const prefix = block.bullet ? '• ' : '';
      const fullText = prefix + block.text;
      const splitLines: string[] = doc.splitTextToSize(fullText, maxLineWidth);

      const lineHeight = block.fontSize * 0.35; // approximate mm per line at given pt size
      const blockHeight = splitLines.length * lineHeight;

      addPageIfNeeded(blockHeight + block.spaceAfter);

      for (const line of splitLines) {
        addPageIfNeeded(lineHeight);
        doc.text(line, marginLeft, y);
        y += lineHeight;
      }

      y += block.spaceAfter;
    }

    const pdfBlob = doc.output('blob');
    const downloadUrl = URL.createObjectURL(pdfBlob);

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.(docx|doc)$/i, '')}.pdf`,
      resultData: `Successfully converted "${file.name}" to PDF — ${doc.getNumberOfPages()} page(s).`,
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert Word to PDF (.docx)
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Parse Microsoft Word documents locally and compile clean paginated PDF files in-browser.
      </p>

      <ToolWorkspace
        toolId="word-to-pdf"
        accept=".docx,.doc"
        maxFiles={1}
        onProcess={handleConvertToPDF}
        actionButtonText="Convert to PDF"
        instructions={[
          'Upload your Word (.docx) document.',
          'Headings, bold, italic, and lists are preserved using HTML parsing.',
          'Download the compiled high-quality PDF document.',
        ]}
      />
    </div>
  );
}
