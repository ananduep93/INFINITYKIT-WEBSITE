'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { useSync } from '../../../hooks/useSync';
import ReusableLoading from '../../../components/ui/ReusableLoading';
import { Search, Download, ArrowUp, ArrowDown, ShoppingBag, X } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  createdAt: number;
}

type SortKey = 'date' | 'amount' | 'category';
type SortDir = 'asc' | 'desc';

const BASE_CATEGORIES = ['Food','Transport','Shopping','Bills','Health','Entertainment','Education','Travel','Other'];

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
}

export default function SearchExpenses() {
  const { data, loading } = useSync('infinityKitExpenseDB');
  const [query, setQuery] = useState('');
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [category, setCategory] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const expenses: Expense[] = useMemo(() => {
    if (!data?.expenses) return [];
    return Array.isArray(data.expenses) ? data.expenses : [];
  }, [data]);

  const filtered = useMemo(() => {
    let res = [...expenses];
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter(e => e.note?.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
    }
    if (minAmt) res = res.filter(e => e.amount >= Number(minAmt));
    if (maxAmt) res = res.filter(e => e.amount <= Number(maxAmt));
    if (fromDate) res = res.filter(e => e.date >= fromDate);
    if (toDate) res = res.filter(e => e.date <= toDate);
    if (category) res = res.filter(e => e.category === category);

    res.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortKey === 'amount') cmp = a.amount - b.amount;
      else cmp = a.category.localeCompare(b.category);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return res;
  }, [expenses, query, minAmt, maxAmt, fromDate, toDate, category, sortKey, sortDir]);

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const clearFilters = () => {
    setQuery(''); setMinAmt(''); setMaxAmt(''); setFromDate(''); setToDate(''); setCategory('');
  };

  const exportCSV = useCallback(() => {
    const header = ['Date', 'Category', 'Amount (INR)', 'Note'];
    const rows = filtered.map(e => [e.date, e.category, e.amount.toFixed(2), e.note || ''].map(v => `"${v}"`).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'expenses-filtered.csv'; a.click();
  }, [filtered]);

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return null;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  if (loading) return <ReusableLoading type="skeleton" count={4} />;

  const hasFilters = query || minAmt || maxAmt || fromDate || toDate || category;

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '18px 22px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>🔍 Filter & Search Ledger</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '4px 0 0' }}>
            {filtered.length} of {expenses.length} transactions · Total: {formatCurrency(total)}
          </p>
        </div>
        <button onClick={exportCSV} disabled={filtered.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', opacity: filtered.length === 0 ? 0.5 : 1 }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '18px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search notes, categories..." className="form-input" style={{ paddingLeft: '34px' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>MIN AMOUNT</label>
            <input type="number" value={minAmt} onChange={e => setMinAmt(e.target.value)} placeholder="0" className="form-input" min={0} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>MAX AMOUNT</label>
            <input type="number" value={maxAmt} onChange={e => setMaxAmt(e.target.value)} placeholder="∞" className="form-input" min={0} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>FROM DATE</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="form-input" />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>TO DATE</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="form-input" />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>CATEGORY</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="form-select">
              <option value="">All categories</option>
              {BASE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '12px', padding: '7px 12px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
            <X size={13} /> Clear Filters
          </button>
        )}
      </div>

      {/* Results */}
      {expenses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '50px', textAlign: 'center' }}>
          <ShoppingBag size={48} color="var(--text-secondary)" style={{ opacity: 0.4, marginBottom: '16px' }} />
          <h3 style={{ fontWeight: 700 }}>No Expenses Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>Add expenses in the "Add Expense Entry" tool to see them here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <Search size={36} color="var(--text-secondary)" style={{ opacity: 0.4, marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No results match your filters. Try adjusting the search criteria.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '4px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--glass-bg)' }}>
                {[['date', 'Date'], ['category', 'Category'], ['amount', 'Amount']].map(([key, label]) => (
                  <th key={key} onClick={() => toggleSort(key as SortKey)} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: sortKey === key ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{label} <SortIcon k={key as SortKey} /></span>
                  </th>
                ))}
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp, idx) => (
                <tr key={exp.id} style={{ borderTop: '1px solid var(--glass-border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '11px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{exp.date}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)', padding: '3px 9px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700 }}>{exp.category}</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontWeight: 800, color: 'var(--text-color)', whiteSpace: 'nowrap' }}>{formatCurrency(exp.amount)}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.note || '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.85rem' }}>Total ({filtered.length} transactions)</td>
                <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 900, fontSize: '1rem', color: 'var(--primary-color)' }}>{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
