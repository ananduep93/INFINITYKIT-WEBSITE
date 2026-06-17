'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';
import { getPdfJs, getTextItems, groupItemsIntoLines } from '../../lib/pdfjs';

/**
 * Cluster X-coordinates into column buckets using a tolerance of ±10px.
 * Returns a sorted array of representative column X values.
 */
function clusterXCoordinates(xValues: number[], tolerance = 10): number[] {
  const sorted = [...xValues].sort((a, b) => a - b);
  const clusters: number[] = [];

  for (const x of sorted) {
    const existing = clusters.find((c) => Math.abs(c - x) <= tolerance);
    if (existing === undefined) {
      clusters.push(x);
    }
  }

  return clusters.sort((a, b) => a - b);
}

/**
 * Find the nearest column bucket index for a given X value.
 */
function nearestColumnIndex(x: number, columns: number[], tolerance = 10): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < columns.length; i++) {
    const dist = Math.abs(columns[i] - x);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  // If no column is within 2× tolerance, still use the nearest
  return best;
}

export default function PDFToExcel() {
  const [progress, setProgress] = useState<string>('');

  const handleConvertToExcel = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a PDF file.');
    }

    const file = files[0];
    setProgress('Loading PDF engine…');

    // 1. Load shared PDF.js utility (no CDN script injection)
    const pdfjsLib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages: number = pdf.numPages;

    // 2. Load SheetJS
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    for (let i = 1; i <= numPages; i++) {
      setProgress(`Processing page ${i} of ${numPages}…`);

      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Use shared helpers — safely filters TextMarkedContent objects in pdfjs v6+
      const items = getTextItems(textContent).filter((item) => item.str.trim() !== '');

      if (items.length === 0) {
        // Empty page — add a blank sheet
        const ws = XLSX.utils.aoa_to_sheet([[]]);
        XLSX.utils.book_append_sheet(wb, ws, `Sheet${i}`);
        continue;
      }

      // --- Column clustering ---
      const allX = items.map((item) => item.transform[4]);
      const columns = clusterXCoordinates(allX, 10);

      // --- Group items into lines ---
      const lines = groupItemsIntoLines(items);

      // --- Build rows matrix ---
      const sheetRows: string[][] = [];

      for (const line of lines) {
        const row: string[] = new Array(columns.length).fill('');

        for (const item of line.items) {
          const x = item.transform[4];
          const colIdx = nearestColumnIndex(x, columns, 10);
          // Concatenate if multiple items share the same column bucket on this line
          row[colIdx] = row[colIdx] ? row[colIdx] + ' ' + item.str.trim() : item.str.trim();
        }

        sheetRows.push(row);
      }

      // --- Create worksheet for this page ---
      const ws = XLSX.utils.aoa_to_sheet(sheetRows);
      XLSX.utils.book_append_sheet(wb, ws, `Sheet${i}`);
    }

    setProgress('Generating Excel file…');

    // 3. Write workbook as real .xlsx binary
    const buf: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const downloadUrl = URL.createObjectURL(blob);

    setProgress('');

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.pdf$/i, '')}.xlsx`,
      resultData: `Successfully extracted tabular data from "${file.name}" — ${numPages} page(s) → ${numPages} sheet(s).`,
    };
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Convert PDF to Excel (.xlsx)
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Extract tables and structured coordinate grids from PDF documents into real Excel spreadsheets 100% locally.
      </p>

      {progress && (
        <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginBottom: '12px', fontStyle: 'italic' }}>
          {progress}
        </p>
      )}

      <ToolWorkspace
        toolId="pdf-to-excel"
        accept="application/pdf"
        maxFiles={1}
        onProcess={handleConvertToExcel}
        actionButtonText="Convert to Excel"
        instructions={[
          'Upload your PDF file containing tabular data or structured text.',
          'X-coordinate column clustering maps each text cell to the correct spreadsheet column.',
          'Download the compiled multi-sheet Excel (.xlsx) file — one sheet per PDF page.',
        ]}
      />
    </div>
  );
}
