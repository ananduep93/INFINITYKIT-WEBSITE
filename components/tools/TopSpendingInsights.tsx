'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Calendar, AlertCircle, Sparkles, ArrowUpRight, ArrowDownRight, RefreshCw, Landmark } from 'lucide-react';
import { useSync } from '../../hooks/useSync';

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
  createdAt: number;
}

const CATEGORY_COLORS = [
  'var(--primary-color)', // Teal
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#10B981', // Green
];

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val);
}

export default function TopSpendingInsights() {
  const { data: syncData, loading: syncLoading } = useSync('infinityKitExpenseDB');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('all');
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  // Read database directly from syncData
  const expenses: Expense[] = useMemo(() => {
    if (!syncData) return [];
    if (Array.isArray(syncData.expenses)) return syncData.expenses;
    if (Array.isArray(syncData)) return syncData;
    return [];
  }, [syncData]);

  // Allow manual refreshing in case of background updates
  const handleManualRefresh = () => {
    setTriggerRefresh(prev => prev + 1);
  };

  // Date Filtering Logic
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(exp => {
      if (!exp.date) return false;
      const expDate = new Date(exp.date);
      if (isNaN(expDate.getTime())) return false;

      if (dateRange === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return expDate >= oneWeekAgo && expDate <= now;
      } else if (dateRange === 'month') {
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        return expDate.getFullYear() === currentYear && expDate.getMonth() === currentMonth;
      }
      return true;
    });
  }, [expenses, dateRange]);

  // Total filtered spending
  const totalFilteredSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  // Calculate Top Spending Categories
  const categoryStats = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      groups[exp.category] = (groups[exp.category] || 0) + exp.amount;
    });

    const sorted = Object.entries(groups)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return sorted;
  }, [filteredExpenses]);

  // Month-over-month Analysis
  const MoMAnalysis = useMemo(() => {
    const now = new Date();
    
    // Current Month String
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Previous Month Dates
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonthMonth = lastMonthDate.getMonth();

    let thisMonthTotal = 0;
    let lastMonthTotal = 0;

    const thisMonthCats: Record<string, number> = {};
    const lastMonthCats: Record<string, number> = {};

    expenses.forEach(exp => {
      if (!exp.date) return;
      const expDate = new Date(exp.date);
      if (isNaN(expDate.getTime())) return;

      const isCurrentMonth = expDate.getFullYear() === currentYear && expDate.getMonth() === currentMonth;
      const isLastMonth = expDate.getFullYear() === lastMonthYear && expDate.getMonth() === lastMonthMonth;

      if (isCurrentMonth) {
        thisMonthTotal += exp.amount;
        thisMonthCats[exp.category] = (thisMonthCats[exp.category] || 0) + exp.amount;
      } else if (isLastMonth) {
        lastMonthTotal += exp.amount;
        lastMonthCats[exp.category] = (lastMonthCats[exp.category] || 0) + exp.amount;
      }
    });

    return {
      thisMonthTotal,
      lastMonthTotal,
      thisMonthCats,
      lastMonthCats,
      hasOlderTransactions: expenses.some(exp => {
        if (!exp.date) return false;
        const expDate = new Date(exp.date);
        return expDate < new Date(currentYear, currentMonth, 1);
      })
    };
  }, [expenses]);

  // Generate automated natural language insights
  const insights = useMemo(() => {
    const list: string[] = [];
    if (expenses.length === 0) return [];

    // Insight 1: Top Category
    if (categoryStats.length > 0) {
      const topCat = categoryStats[0];
      const percentage = totalFilteredSpent > 0 ? ((topCat.amount / totalFilteredSpent) * 100).toFixed(1) : '0';
      list.push(
        `**${topCat.category}** is your single largest expense category, accounting for **${formatCurrency(topCat.amount)}** (${percentage}% of total spend) during this period.`
      );
    }

    // Insight 2: Cumulative and MoM
    if (MoMAnalysis.hasOlderTransactions) {
      const diff = MoMAnalysis.thisMonthTotal - MoMAnalysis.lastMonthTotal;
      const pct = MoMAnalysis.lastMonthTotal > 0 
        ? ((diff / MoMAnalysis.lastMonthTotal) * 100).toFixed(1)
        : null;

      if (pct !== null) {
        const changeStr = diff >= 0 ? 'up 📈' : 'down 📉';
        const absoluteDiff = Math.abs(diff);
        list.push(
          `Your total spending this month is **${formatCurrency(MoMAnalysis.thisMonthTotal)}**, which is **${changeStr} by ${Math.abs(Number(pct))}%** (${formatCurrency(absoluteDiff)}) compared to last month (${formatCurrency(MoMAnalysis.lastMonthTotal)}).`
        );
      }

      // Insight 3: Category level MoM
      if (categoryStats.length > 0) {
        const topCat = categoryStats[0].category;
        const curCatSpent = MoMAnalysis.thisMonthCats[topCat] || 0;
        const lastCatSpent = MoMAnalysis.lastMonthCats[topCat] || 0;

        if (lastCatSpent > 0) {
          const catDiff = curCatSpent - lastCatSpent;
          const catPct = ((catDiff / lastCatSpent) * 100).toFixed(1);
          const dirStr = catDiff >= 0 ? 'increased' : 'decreased';
          list.push(
            `Spending on your top category **${topCat}** has **${dirStr} by ${Math.abs(Number(catPct))}%** compared to last month (Current: ${formatCurrency(curCatSpent)} vs Last: ${formatCurrency(lastCatSpent)}).`
          );
        } else if (curCatSpent > 0) {
          list.push(
            `**${topCat}** is a newly active major spending category this month, with **${formatCurrency(curCatSpent)}** logged.`
          );
        }
      }
    } else {
      list.push(
        `Month-over-month trends are generating! Log older transactions from prior months to unlock direct sequential spend comparisons.`
      );
    }

    // Insight 4: Healthy advice
    if (categoryStats.length > 1) {
      const top2Sum = categoryStats.slice(0, 2).reduce((sum, c) => sum + c.amount, 0);
      const ratio = totalFilteredSpent > 0 ? ((top2Sum / totalFilteredSpent) * 100).toFixed(0) : '0';
      if (Number(ratio) > 60) {
        list.push(
          `⚠️ High Concentration: Your top 2 categories make up **${ratio}%** of your total outflow. Consider placing category budget caps on these areas.`
        );
      }
    }

    return list;
  }, [categoryStats, totalFilteredSpent, MoMAnalysis, expenses]);

  return (
    <div style={{ padding: '10px 0', width: '100%' }}>
      {/* Header and Controls */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px 24px', 
          marginBottom: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '16px',
          borderRadius: '16px'
        }}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            <TrendingUp color="var(--primary-color)" size={26} /> Top Spending Insights
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '6px 0 0' }}>
            Interactive category distribution analysis and sequential spending metrics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleManualRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '9px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--text-color)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
            title="Refresh local storage key"
          >
            <RefreshCw size={15} />
          </button>
          
          <div style={{ display: 'flex', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '3px' }}>
            {(['all', 'month', 'week'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  background: dateRange === range ? 'var(--primary-color)' : 'transparent',
                  color: dateRange === range ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {range === 'all' ? 'All Time' : range === 'month' ? 'This Month' : 'This Week'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', borderRadius: '16px' }}>
          <Landmark size={48} color="var(--text-secondary)" style={{ opacity: 0.4, marginBottom: '16px' }} />
          <h3 style={{ fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>No Expense Records Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '8px 0 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            Please log expenses inside the "Add Expense Entry" or "Finance Suite" tools to activate these insights automatically.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Left panel: Top 5 categories */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--primary-color)" /> Category Outflow Share
            </h3>

            {categoryStats.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', margin: '40px 0' }}>
                No expenses fall within the chosen date filter.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {categoryStats.slice(0, 5).map((stat, idx) => {
                  const percent = totalFilteredSpent > 0 ? (stat.amount / totalFilteredSpent) * 100 : 0;
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  
                  return (
                    <div key={stat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: 500 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                          {stat.category}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--text-color)' }}>
                          {formatCurrency(stat.amount)}
                          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '6px' }}>
                            ({percent.toFixed(1)}%)
                          </span>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div 
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: color,
                            borderRadius: '5px',
                            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}

                {categoryStats.length > 5 && (
                  <div style={{ padding: '12px 14px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Plus <strong>{categoryStats.length - 5} other</strong> minor spending categories recorded.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel: Month-over-month sequential trends and natural language insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* MoM stats card */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px' }}>Month-over-Month Summary</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>This Month</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-color)' }}>
                    {formatCurrency(MoMAnalysis.thisMonthTotal)}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Last Month</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-secondary)' }}>
                    {formatCurrency(MoMAnalysis.lastMonthTotal)}
                  </div>
                </div>
              </div>

              {MoMAnalysis.hasOlderTransactions ? (
                (() => {
                  const diff = MoMAnalysis.thisMonthTotal - MoMAnalysis.lastMonthTotal;
                  const percent = MoMAnalysis.lastMonthTotal > 0 ? (diff / MoMAnalysis.lastMonthTotal) * 100 : 0;
                  const isUp = diff >= 0;

                  return (
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        padding: '14px 18px',
                        background: isUp ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                        border: `1px solid ${isUp ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`,
                        borderRadius: '12px'
                      }}
                    >
                      {isUp ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: '#EF4444', color: '#fff' }}>
                          <ArrowUpRight size={18} />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: '#10B981', color: '#fff' }}>
                          <ArrowDownRight size={18} />
                        </div>
                      )}
                      
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-color)' }}>
                          Spending is {isUp ? 'Up' : 'Down'} by {Math.abs(percent).toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {isUp ? 'You spent ' : 'You saved '} <strong>{formatCurrency(Math.abs(diff))}</strong> compared to the previous calendar month.
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', background: 'rgba(0,0,0,0.015)', border: '1px dashed var(--glass-border)', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <AlertCircle size={15} /> Sequential trend comparison will automatically activate once you have transactions logged from prior months.
                </div>
              )}
            </div>

            {/* Smart insights card */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', flexGrow: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--primary-color)" /> Smart Spending Insights
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {insights.map((insight, idx) => {
                  // Basic rich-text parsing for strong markdown tags
                  const parts = insight.split('**');
                  const renderedText = parts.map((part, pIdx) => {
                    if (pIdx % 2 !== 0) {
                      return <strong key={pIdx} style={{ color: 'var(--text-color)' }}>{part}</strong>;
                    }
                    return part;
                  });

                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        fontSize: '0.84rem', 
                        lineHeight: '1.45', 
                        color: 'var(--text-secondary)',
                        paddingBottom: idx === insights.length - 1 ? '0' : '10px',
                        borderBottom: idx === insights.length - 1 ? 'none' : '1px dashed var(--glass-border)',
                        display: 'flex',
                        gap: '6px'
                      }}
                    >
                      <span>•</span>
                      <span>{renderedText}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
