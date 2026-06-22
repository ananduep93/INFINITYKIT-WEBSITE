'use client';
import React, { useState, useMemo } from 'react';
import { useSync } from '../../hooks/useSync';
import ReusableLoading from '../ui/ReusableLoading';
import { TrendingDown, Calendar, Download, BarChart2, ShoppingBag } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  createdAt: number;
}

const CATEGORY_COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6','#f97316'];

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
}

function dateKey(d: Date) { return d.toISOString().slice(0, 10); }

export default function DailyMonthlyReport() {
  const { data, loading } = useSync('infinityKitExpenseDB');

  const expenses: Expense[] = useMemo(() => {
    if (!data?.expenses) return [];
    return Array.isArray(data.expenses) ? data.expenses : [];
  }, [data]);

  const today = new Date();
  const todayStr = dateKey(today);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = dateKey(yesterday);
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const todayTotal = useMemo(() => expenses.filter(e => e.date === todayStr).reduce((s, e) => s + e.amount, 0), [expenses, todayStr]);
  const yesterdayTotal = useMemo(() => expenses.filter(e => e.date === yesterdayStr).reduce((s, e) => s + e.amount, 0), [expenses, yesterdayStr]);
  const thisMonthTotal = useMemo(() => expenses.filter(e => e.date.startsWith(thisMonth)).reduce((s, e) => s + e.amount, 0), [expenses, thisMonth]);
  const lastMonthTotal = useMemo(() => expenses.filter(e => e.date.startsWith(lastMonth)).reduce((s, e) => s + e.amount, 0), [expenses, lastMonth]);

  const todayExpenses = useMemo(() => expenses.filter(e => e.date === todayStr).sort((a, b) => b.amount - a.amount), [expenses, todayStr]);
  const top5Today = todayExpenses.slice(0, 5);

  // Category breakdown for this month
  const catBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.filter(e => e.date.startsWith(thisMonth)).forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses, thisMonth]);

  const exportReport = () => {
    const lines = [
      `Expense Report — ${today.toDateString()}`,
      '',
      `Today (${todayStr}): ${formatCurrency(todayTotal)}`,
      `Yesterday (${yesterdayStr}): ${formatCurrency(yesterdayTotal)}`,
      `This Month (${thisMonth}): ${formatCurrency(thisMonthTotal)}`,
      `Last Month (${lastMonth}): ${formatCurrency(lastMonthTotal)}`,
      '',
      'Top Expenses Today:',
      ...top5Today.map((e, i) => `  ${i + 1}. ${e.category} — ${formatCurrency(e.amount)}${e.note ? ` (${e.note})` : ''}`),
      '',
      'Category Breakdown (This Month):',
      ...catBreakdown.map(([cat, amt]) => `  ${cat}: ${formatCurrency(amt)} (${thisMonthTotal > 0 ? ((amt / thisMonthTotal) * 100).toFixed(1) : 0}%)`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'expense-report.txt'; a.click();
  };

  if (loading) return <ReusableLoading type="skeleton" count={4} />;

  if (expenses.length === 0) {
    return (
      <div style={{ padding: '10px 0' }}>
        <div className="glass-panel" style={{ padding: '50px', textAlign: 'center' }}>
          <ShoppingBag size={48} color="var(--text-secondary)" style={{ opacity: 0.4, marginBottom: '16px' }} />
          <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>No Expenses Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Start adding expenses in the <strong>Add Expense Entry</strong> tool to see your reports here.</p>
        </div>
      </div>
    );
  }

  const summaryCards = [
    { label: 'Today', value: todayTotal, sub: todayStr, color: '#6366f1', icon: '📅' },
    { label: 'Yesterday', value: yesterdayTotal, sub: yesterdayStr, color: '#ec4899', icon: '📆' },
    { label: 'This Month', value: thisMonthTotal, sub: today.toLocaleString('default', { month: 'long', year: 'numeric' }), color: '#10b981', icon: '📊' },
    { label: 'Last Month', value: lastMonthTotal, sub: lastMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' }), color: '#f59e0b', icon: '📈' },
  ];

  return (
    <div style={{ padding: '10px 0' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '18px 22px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>📅 Daily / Monthly Report</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '4px 0 0' }}>Summary of your spending across time periods</p>
        </div>
        <button onClick={exportReport} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-color)', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {summaryCards.map(card => (
          <div key={card.label} style={{ background: card.color + '14', border: `1px solid ${card.color}30`, borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{card.icon}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{card.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: card.color, fontFamily: "'Outfit', sans-serif" }}>{formatCurrency(card.value)}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Category Breakdown */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <BarChart2 size={16} color="var(--primary-color)" /> Category Breakdown — {today.toLocaleString('default', { month: 'long' })}
          </h3>
          {catBreakdown.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No expenses this month.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {catBreakdown.map(([cat, amt], idx) => {
                const pct = thisMonthTotal > 0 ? (amt / thisMonthTotal) * 100 : 0;
                const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 600 }}>{cat}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(amt)} <span style={{ color, fontWeight: 700 }}>({pct.toFixed(1)}%)</span></span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(0,0,0,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.6s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top 5 Today */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <TrendingDown size={16} color="#ef4444" /> Top Expenses Today
          </h3>
          {top5Today.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No expenses recorded today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {top5Today.map((exp, i) => (
                <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length], flexShrink: 0 }}>#{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{exp.category}</div>
                    {exp.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.note}</div>}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>{formatCurrency(exp.amount)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Month-over-month comparison */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Month-over-Month</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>This Month</span>
              <span style={{ fontWeight: 800 }}>{formatCurrency(thisMonthTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Last Month</span>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{formatCurrency(lastMonthTotal)}</span>
            </div>
            {lastMonthTotal > 0 && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: 700, color: thisMonthTotal <= lastMonthTotal ? '#10b981' : '#ef4444' }}>
                {thisMonthTotal <= lastMonthTotal ? '✅ Spending down' : '⚠️ Spending up'} {lastMonthTotal > 0 ? `${Math.abs(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)}%` : ''} vs last month
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar mini-view: total by date */}
      <div className="glass-panel" style={{ padding: '20px', marginTop: '16px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Calendar size={16} color="var(--primary-color)" /> Daily Totals — {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {Array.from({ length: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() }, (_, i) => {
            const d = i + 1;
            const key = `${thisMonth}-${String(d).padStart(2, '0')}`;
            const dayTotal = expenses.filter(e => e.date === key).reduce((s, e) => s + e.amount, 0);
            const isToday = key === todayStr;
            const intensity = thisMonthTotal > 0 ? Math.min(dayTotal / (thisMonthTotal / 10), 1) : 0;
            return (
              <div key={d} title={dayTotal > 0 ? `${key}: ${formatCurrency(dayTotal)}` : key} style={{ width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: isToday ? 800 : 500, background: dayTotal > 0 ? `rgba(99,102,241,${0.1 + intensity * 0.7})` : 'var(--glass-bg)', border: isToday ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)', color: isToday ? 'var(--primary-color)' : 'var(--text-color)', cursor: 'default', transition: 'transform 0.15s' }}>
                {d}
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Darker color = higher spending. Hover for exact amount.</p>
      </div>
    </div>
  );
}
