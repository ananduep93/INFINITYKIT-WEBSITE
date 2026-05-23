'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Search, Edit3, Check, X, ChevronUp, ChevronDown, ChevronsUpDown, FileText, Clipboard } from 'lucide-react';

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (ch === '\r') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter(r => r.some(c => c.trim().length > 0));
}

function exportCSV(headers: string[], rows: string[][]): string {
  const escape = (v: string) => {
    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  const lines = [headers.map(escape).join(',')];
  rows.forEach(row => lines.push(row.map(escape).join(',')));
  return lines.join('\n');
}

const SAMPLE_CSV = `Name,Age,City,Salary,Department
Alice Johnson,32,New York,85000,Engineering
Bob Smith,28,San Francisco,72000,Marketing
Carol White,45,Chicago,95000,Engineering
David Brown,38,Austin,68000,Sales
Eve Davis,26,Seattle,78000,Design
Frank Miller,51,Boston,110000,Engineering
Grace Wilson,34,Denver,73000,Marketing
Henry Taylor,29,Miami,65000,Sales`;

export default function CSVViewer() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [pasteText, setPasteText] = useState('');
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingCell, setEditingCell] = useState<{ r: number; c: number } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [view, setView] = useState<'upload' | 'table'>('upload');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadCSV = (text: string) => {
    const parsed = parseCSV(text.trim());
    if (parsed.length < 2) return;
    setHeaders(parsed[0]);
    setRows(parsed.slice(1));
    setView('table');
    setSearch('');
    setSortCol(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => loadCSV(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleSort = (col: number) => {
    if (sortCol === col) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const handleEditStart = (r: number, c: number) => {
    setEditingCell({ r, c });
    setEditValue(rows[r][c] ?? '');
  };

  const handleEditConfirm = () => {
    if (!editingCell) return;
    const updated = rows.map((row, ri) =>
      ri === editingCell.r ? row.map((cell, ci) => (ci === editingCell.c ? editValue : cell)) : row
    );
    setRows(updated);
    setEditingCell(null);
  };

  const handleEditCancel = () => setEditingCell(null);

  const handleExport = () => {
    const csv = exportCSV(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCSV = () => {
    const csv = exportCSV(headers, rows);
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRows = rows.filter(row =>
    row.some(cell => cell.toLowerCase().includes(search.toLowerCase()))
  );

  const sortedRows = sortCol !== null
    ? [...filteredRows].sort((a, b) => {
        const av = a[sortCol] ?? '';
        const bv = b[sortCol] ?? '';
        const an = Number(av), bn = Number(bv);
        const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filteredRows;

  const SortIcon = ({ col }: { col: number }) => {
    if (sortCol !== col) return <ChevronsUpDown size={13} style={{ opacity: 0.4 }} />;
    return sortDir === 'asc' ? <ChevronUp size={13} style={{ color: 'var(--primary-color)' }} /> : <ChevronDown size={13} style={{ color: 'var(--primary-color)' }} />;
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>CSV Viewer & Editor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
              Upload, paste, sort, search, and edit CSV data in-browser.
            </p>
          </div>
          {view === 'table' && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setView('upload')}>
                <Upload size={14} /> New File
              </button>
              <button className="btn btn-secondary" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleCopyCSV}>
                {copied ? <Check size={14} color="#28a745" /> : <Clipboard size={14} />} Copy CSV
              </button>
              <button className="btn" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleExport}>
                <Download size={14} /> Export CSV
              </button>
            </div>
          )}
        </div>

        {view === 'upload' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Drop Zone */}
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed var(--glass-border)',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                background: 'rgba(255,255,255,0.02)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary-color)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--glass-border)')}
            >
              <Upload size={36} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>Click to Upload CSV</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem' }}>Supports .csv files with quoted fields</p>
              <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            {/* Paste Zone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                className="form-textarea"
                placeholder={'Paste CSV text here...\n\nExample:\nName,Age,City\nAlice,30,NYC'}
                style={{ flex: 1, minHeight: '160px', fontFamily: 'monospace', fontSize: '0.82rem', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--glass-border)', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn" style={{ flex: 1, fontSize: '0.82rem' }} onClick={() => pasteText.trim() && loadCSV(pasteText)}>
                  <FileText size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Parse CSV
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.82rem' }} onClick={() => loadCSV(SAMPLE_CSV)}>
                  Load Sample
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search + Stats bar */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ position: 'relative', flex: '1 1 220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search rows..."
                  className="form-input"
                  style={{ paddingLeft: '36px', width: '100%', fontSize: '0.85rem' }}
                />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {sortedRows.length} / {rows.length} rows · {headers.length} columns
              </span>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', width: '48px', borderBottom: '1px solid var(--glass-border)' }}>#</th>
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        onClick={() => handleSort(i)}
                        style={{
                          padding: '10px 14px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          userSelect: 'none',
                          borderBottom: '1px solid var(--glass-border)',
                          whiteSpace: 'nowrap',
                          color: sortCol === i ? 'var(--primary-color)' : 'var(--text-color)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          transition: 'var(--transition-smooth)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {h} <SortIcon col={i} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((row, ri) => (
                    <tr
                      key={ri}
                      style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '9px 12px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{ri + 1}</td>
                      {headers.map((_, ci) => {
                        const isEditing = editingCell?.r === ri && editingCell?.c === ci;
                        return (
                          <td key={ci} style={{ padding: '9px 14px', position: 'relative' }}>
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input
                                  autoFocus
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') handleEditConfirm(); if (e.key === 'Escape') handleEditCancel(); }}
                                  style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--primary-color)', borderRadius: '6px', padding: '4px 8px', color: 'var(--text-color)', width: '100%', outline: 'none' }}
                                />
                                <button onClick={handleEditConfirm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#28a745', padding: '2px' }}><Check size={14} /></button>
                                <button onClick={handleEditCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', padding: '2px' }}><X size={14} /></button>
                              </div>
                            ) : (
                              <span
                                onClick={() => handleEditStart(ri, ci)}
                                style={{ cursor: 'text', display: 'block', borderRadius: '4px', padding: '2px 4px', transition: 'background 0.15s' }}
                                title="Click to edit"
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                              >
                                {row[ci] ?? ''}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {sortedRows.length === 0 && (
                    <tr>
                      <td colSpan={headers.length + 1} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                        No rows match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
              <Edit3 size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Click any cell to edit inline. Press Enter to confirm, Escape to cancel.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
