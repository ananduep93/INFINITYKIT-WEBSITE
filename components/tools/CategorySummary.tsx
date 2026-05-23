'use client';

import React, { useState, useRef } from 'react';
import { 
  BarChart3, 
  Upload, 
  FileSpreadsheet, 
  Clipboard, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  FileText, 
  TrendingUp, 
  Settings2,
  HelpCircle
} from 'lucide-react';

interface CSVData {
  headers: string[];
  rows: string[][];
}

interface FreqItem {
  value: string;
  count: number;
  percentage: number;
}

export default function CategorySummary() {
  const [csvText, setCsvText] = useState<string>('');
  const [parsedData, setParsedData] = useState<CSVData | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [columnType, setColumnType] = useState<'categorical' | 'numeric'>('categorical');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample data for quick testing
  const loadSampleData = () => {
    const sample = `Product Name,Category,Quantity Sold,Price Per Unit,Country,Rating\n` +
      `iPhone 15,Electronics,120,999.00,United States,4.8\n` +
      `Galaxy S24,Electronics,85,899.99,South Korea,4.6\n` +
      `Leather Wallet,Accessories,340,45.00,Italy,4.5\n` +
      `Wireless Mouse,Electronics,510,29.99,China,4.2\n` +
      `Yoga Mat,Fitness,220,39.95,India,4.7\n` +
      `Bluetooth Speaker,Electronics,180,79.99,United States,4.4\n` +
      `Running Shoes,Footwear,290,120.00,Germany,4.3\n` +
      `Coffee Maker,Appliances,150,89.50,Italy,4.5\n` +
      `Stainless Flask,Kitchen,410,24.99,China,4.6\n` +
      `Ergonomic Chair,Furniture,75,249.00,Germany,4.7\n` +
      `Wool Scarf,Accessories,180,35.00,Italy,4.1\n` +
      `Sports Backpack,Accessories,250,59.99,India,4.4\n` +
      `Smart Watch,Electronics,200,199.99,South Korea,4.5\n` +
      `Dumbbells 10kg,Fitness,130,49.99,Germany,4.6\n` +
      `Ceramic Plate,Kitchen,600,12.50,China,4.0`;
    
    setCsvText(sample);
    handleParse(sample, 'Sample Product Sales dataset loaded');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileInfo(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      handleParse(text, file.name);
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  const handleParse = (textToParse: string, sourceLabel: string = 'Input data') => {
    setError(null);
    try {
      const dataText = textToParse.trim();
      if (!dataText) {
        throw new Error('Tabular text is empty.');
      }

      const lines = dataText.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        throw new Error('Dataset must contain at least a header row and one data row.');
      }

      // Delimiter detection (supports comma, semicolon, tab)
      const firstLine = lines[0];
      const delimiters = [',', ';', '\t'];
      let delimiter = ',';
      let maxCount = -1;
      
      delimiters.forEach(d => {
        const count = (firstLine.match(new RegExp(`\\${d}`, 'g')) || []).length;
        if (count > maxCount) {
          maxCount = count;
          delimiter = d;
        }
      });

      // Split headers
      const headers = firstLine.split(delimiter).map(h => {
        // Strip quotes
        return h.trim().replace(/^["']|["']$/g, '').trim();
      });

      // Split rows
      const rows = lines.slice(1).map((line, idx) => {
        let cells: string[] = [];
        
        // Smart quote support for commas
        if (delimiter === ',') {
          // split commas not inside quotes
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
          cells = matches.map(c => c.trim().replace(/^["']|["']$/g, '').trim());
        } else {
          cells = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, '').trim());
        }

        // Align column length
        if (cells.length < headers.length) {
          while (cells.length < headers.length) {
            cells.push('');
          }
        } else if (cells.length > headers.length) {
          cells = cells.slice(0, headers.length);
        }
        
        return cells;
      });

      setParsedData({ headers, rows });
      
      // Auto-select first column
      if (headers.length > 0) {
        const defaultCol = headers[0];
        setSelectedColumn(defaultCol);
        autoDetectType(headers[0], headers, rows);
      }
      
      setFileInfo(`${sourceLabel} parsed successfully: ${rows.length} rows, ${headers.length} columns.`);
    } catch (err: any) {
      setError(err.message || 'Error parsing CSV/tabular data.');
      setParsedData(null);
    }
  };

  const autoDetectType = (colName: string, headers: string[], rows: string[][]) => {
    const colIdx = headers.indexOf(colName);
    if (colIdx === -1) return;

    // Get non-empty values
    const vals = rows.map(r => r[colIdx]).filter(v => v !== '');
    if (vals.length === 0) {
      setColumnType('categorical');
      return;
    }

    // Check if > 75% of non-empty values are numeric
    let numericCount = 0;
    vals.forEach(v => {
      // Remove symbols like $, %, commas
      const cleanVal = v.replace(/[$,%]/g, '').trim();
      if (cleanVal !== '' && !isNaN(Number(cleanVal))) {
        numericCount++;
      }
    });

    if (numericCount / vals.length > 0.75) {
      setColumnType('numeric');
    } else {
      setColumnType('categorical');
    }
  };

  const handleColumnChange = (colName: string) => {
    setSelectedColumn(colName);
    if (parsedData) {
      autoDetectType(colName, parsedData.headers, parsedData.rows);
    }
  };

  // Analysis computations
  const getSelectedColumnIndex = () => {
    if (!parsedData || !selectedColumn) return -1;
    return parsedData.headers.indexOf(selectedColumn);
  };

  const calculateCategoricalSummary = (): FreqItem[] => {
    const idx = getSelectedColumnIndex();
    if (!parsedData || idx === -1) return [];

    const counts: Record<string, number> = {};
    let validCount = 0;

    parsedData.rows.forEach(r => {
      const val = r[idx]?.trim() || '(blank)';
      counts[val] = (counts[val] || 0) + 1;
      validCount++;
    });

    return Object.entries(counts)
      .map(([value, count]) => ({
        value,
        count,
        percentage: validCount > 0 ? (count / validCount) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const calculateNumericSummary = () => {
    const idx = getSelectedColumnIndex();
    if (!parsedData || idx === -1) return null;

    const rawVals = parsedData.rows
      .map(r => r[idx]?.trim() || '')
      .filter(v => v !== '');
      
    const numbers: number[] = [];
    rawVals.forEach(v => {
      const clean = v.replace(/[$,%]/g, '').trim();
      const num = Number(clean);
      if (!isNaN(num)) {
        numbers.push(num);
      }
    });

    if (numbers.length === 0) {
      return {
        count: 0,
        validCount: 0,
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        sum: 0,
        stdDev: 0
      };
    }

    const count = rawVals.length;
    const validCount = numbers.length;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / validCount;

    // Median
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 
      ? sorted[mid] 
      : (sorted[mid - 1] + sorted[mid]) / 2;

    // Standard deviation
    const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / validCount;
    const stdDev = Math.sqrt(variance);

    return {
      count,
      validCount,
      min,
      max,
      mean,
      median,
      sum,
      stdDev
    };
  };

  // Summary output string creator for Copy/Export
  const getSummaryString = (): string => {
    if (!parsedData || !selectedColumn) return '';

    let out = `INFINITY KIT - CATEGORY SUMMARY INSIGHTS\n`;
    out += `=========================================\n`;
    out += `Column Analyzed : ${selectedColumn}\n`;
    out += `Data Type       : ${columnType.toUpperCase()}\n`;
    out += `Total Row Count : ${parsedData.rows.length}\n`;
    out += `Timestamp       : ${new Date().toLocaleString()}\n`;
    out += `=========================================\n\n`;

    if (columnType === 'categorical') {
      const summary = calculateCategoricalSummary();
      out += `FREQUENCY DISTRIBUTION:\n`;
      out += `------------------------------------------------------\n`;
      out += `Rank | Value                      | Count | Percentage\n`;
      out += `------------------------------------------------------\n`;
      summary.forEach((item, idx) => {
        const valStr = item.value.padEnd(26).substring(0, 26);
        const cntStr = String(item.count).padStart(5);
        const pctStr = `${item.percentage.toFixed(2)}%`.padStart(10);
        out += `${String(idx + 1).padStart(4)} | ${valStr} | ${cntStr} | ${pctStr}\n`;
      });
      out += `------------------------------------------------------\n`;
    } else {
      const stats = calculateNumericSummary();
      if (stats) {
        out += `NUMERICAL SUMMARY STATISTICS:\n`;
        out += `-----------------------------------------\n`;
        out += `Total Rows (Non-empty) : ${stats.count}\n`;
        out += `Parsed Numeric Rows    : ${stats.validCount}\n`;
        out += `Minimum Value          : ${stats.min.toLocaleString()}\n`;
        out += `Maximum Value          : ${stats.max.toLocaleString()}\n`;
        out += `Sum Total              : ${stats.sum.toLocaleString()}\n`;
        out += `Arithmetic Mean (Avg)  : ${stats.mean.toLocaleString(undefined, { maximumFractionDigits: 4 })}\n`;
        out += `Median (50th percentile): ${stats.median.toLocaleString()}\n`;
        out += `Standard Deviation (σ) : ${stats.stdDev.toLocaleString(undefined, { maximumFractionDigits: 4 })}\n`;
        out += `-----------------------------------------\n`;
      }
    }
    return out;
  };

  const copyToClipboard = () => {
    const text = getSummaryString();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadSummaryText = () => {
    const text = getSummaryString();
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Summary_${selectedColumn.replace(/[^a-zA-Z0-9]/g, '_')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Styles
  const inputStyle: React.CSSProperties = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    color: 'var(--text-color)',
    padding: '10px 14px',
    fontSize: '0.95rem',
    width: '100%',
    outline: 'none',
    transition: 'var(--transition-smooth)',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    minHeight: '140px',
    resize: 'vertical',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const btnStyle: React.CSSProperties = {
    background: 'var(--primary-color)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'var(--transition-smooth)',
  };

  const outlineBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: 'transparent',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-color)',
  };

  const stats = columnType === 'numeric' ? calculateNumericSummary() : null;
  const categoricalSummary = columnType === 'categorical' ? calculateCategoricalSummary() : [];

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <BarChart3 size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Category Summary Insights</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Instantly upload or paste CSV data to inspect specific columns. View detailed numeric metrics or visual categorical frequency distributions client-side.
        </p>

        {/* Action Panel for Data Source */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '24px' }}>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Input CSV or Tabular Data</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={loadSampleData} 
                  style={{ 
                    ...outlineBtnStyle, 
                    padding: '6px 12px', 
                    fontSize: '0.8rem',
                    borderRadius: '8px'
                  }}
                >
                  <FileSpreadsheet size={14} /> Try Sample Data
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  style={{ 
                    ...btnStyle, 
                    padding: '6px 12px', 
                    fontSize: '0.8rem',
                    borderRadius: '8px'
                  }}
                >
                  <Upload size={14} /> Upload File
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".csv,.txt,.tsv" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
              </div>
            </div>
            
            <textarea
              style={textareaStyle}
              placeholder="Paste comma, semicolon, or tab-delimited records here. First row should contain column headers..."
              value={csvText}
              onChange={handleTextChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => handleParse(csvText)} 
              style={{ ...btnStyle, flex: 1, minWidth: '150px' }}
            >
              <FileText size={18} /> Parse & Analyze Dataset
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '14px 18px', 
            borderRadius: '12px', 
            background: 'rgba(220, 53, 69, 0.06)', 
            border: '1px solid rgba(220, 53, 69, 0.25)', 
            color: '#dc3545',
            fontSize: '0.9rem',
            marginBottom: '20px'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* File and Stats info */}
        {fileInfo && !error && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '-12px', marginBottom: '20px', fontStyle: 'italic' }}>
            {fileInfo}
          </p>
        )}

        {/* Main Analysis Sections */}
        {parsedData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
            
            {/* Column & Type Selection */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: '20px',
              background: 'var(--glass-bg)',
              padding: '18px',
              borderRadius: '14px',
              border: '1px solid var(--glass-border)'
            }}>
              <div>
                <label style={labelStyle}>Select Column to Analyze</label>
                <select 
                  value={selectedColumn} 
                  onChange={(e) => handleColumnChange(e.target.value)} 
                  style={inputStyle}
                >
                  {parsedData.headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Analysis Type / Variable Mode</label>
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', padding: '4px', border: '1px solid var(--glass-border)' }}>
                  {(['categorical', 'numeric'] as const).map((t) => (
                    <button 
                      key={t}
                      onClick={() => setColumnType(t)}
                      style={{
                        flex: 1,
                        background: columnType === t ? 'var(--primary-color)' : 'transparent',
                        color: columnType === t ? '#fff' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)',
                        textTransform: 'capitalize'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Rendering */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} color="var(--primary-color)" /> Summary Report for "{selectedColumn}"
                </h3>
                
                {/* Export Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={copyToClipboard}
                    style={{ ...outlineBtnStyle, padding: '8px 14px', fontSize: '0.82rem', borderRadius: '10px' }}
                    title="Copy Summary"
                  >
                    {copied ? <Check size={14} color="#28a745" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Summary'}
                  </button>
                  <button 
                    onClick={downloadSummaryText}
                    style={{ ...outlineBtnStyle, padding: '8px 14px', fontSize: '0.82rem', borderRadius: '10px' }}
                    title="Download Report"
                  >
                    <Download size={14} /> Download TXT
                  </button>
                </div>
              </div>

              {/* Categorical Mode UI */}
              {columnType === 'categorical' && (
                <div style={{ 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '14px', 
                  overflow: 'hidden' 
                }}>
                  <div style={{ 
                    overflowX: 'auto' 
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '450px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--glass-border)', background: 'rgba(0,161,155,0.05)' }}>
                          <th style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>VALUE / CATEGORY</th>
                          <th style={{ padding: '14px 16px', width: '100px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>COUNT</th>
                          <th style={{ padding: '14px 16px', width: '120px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>PROPORTION</th>
                          <th style={{ padding: '14px 16px', width: '260px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DISTRIBUTION BAR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoricalSummary.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="table-row-hover">
                            <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600, wordBreak: 'break-all' }}>{item.value}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-color)', textAlign: 'right', fontWeight: 700 }}>{item.count.toLocaleString()}</td>
                            <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--primary-color)', textAlign: 'right', fontWeight: 700 }}>{item.percentage.toFixed(2)}%</td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ 
                                width: '100%', 
                                background: 'rgba(255,255,255,0.06)', 
                                border: '1px solid var(--glass-border)', 
                                borderRadius: '6px', 
                                height: '12px',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  width: `${item.percentage}%`, 
                                  background: 'linear-gradient(90deg, var(--primary-color) 0%, #00d2c7 100%)', 
                                  height: '100%',
                                  borderRadius: '6px',
                                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Numeric Mode UI */}
              {columnType === 'numeric' && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  
                  {/* Min */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                  }}>
                    <span style={labelStyle}>Minimum Value</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-color)', marginTop: '4px' }}>
                      {stats.min.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                  </div>

                  {/* Max */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                  }}>
                    <span style={labelStyle}>Maximum Value</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-color)', marginTop: '4px' }}>
                      {stats.max.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                  </div>

                  {/* Average/Mean */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(0, 161, 155, 0.05)',
                    border: '1px solid rgba(0, 161, 155, 0.2)',
                  }}>
                    <span style={{ ...labelStyle, color: 'var(--primary-color)' }}>Average (Mean)</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-color)', marginTop: '4px' }}>
                      {stats.mean.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </div>
                  </div>

                  {/* Median */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                  }}>
                    <span style={labelStyle}>Median (50%)</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-color)', marginTop: '4px' }}>
                      {stats.median.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                  </div>

                  {/* Sum Total */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                  }}>
                    <span style={labelStyle}>Sum Total</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-color)', marginTop: '4px' }}>
                      {stats.sum.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Std Dev */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                  }}>
                    <span style={labelStyle}>Std Dev (σ)</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-color)', marginTop: '4px' }}>
                      {stats.stdDev.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </div>
                  </div>

                  {/* Row count stats */}
                  <div style={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>Valid Numeric Entries: <strong>{stats.validCount}</strong> / {stats.count} total records</span>
                    <span>Dataset Rows: <strong>{parsedData.rows.length}</strong></span>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
