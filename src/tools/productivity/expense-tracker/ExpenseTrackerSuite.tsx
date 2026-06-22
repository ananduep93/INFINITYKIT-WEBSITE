'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Calendar, DollarSign, List, Award, TrendingUp, AlertCircle, Edit3, Check, X, Cloud } from 'lucide-react';
import { useSync } from '../../../hooks/useSync';
import ReusableLoading from '../../../components/ui/ReusableLoading';

const BASE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Health',
  'Entertainment',
  'Education',
  'Travel',
  'Other'
];

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  createdAt: number;
}

interface Budget {
  [category: string]: number;
}

interface ExpenseTrackerSuiteProps {
  defaultView?: 'add' | 'list' | 'budget' | 'analytics';
}

export default function ExpenseTrackerSuite({ defaultView = 'add' }: ExpenseTrackerSuiteProps) {
  const { data, saveData, loading } = useSync('infinityKitExpenseDB');
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'budget' | 'analytics'>(defaultView);

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState('');
  const [editingCategory, setEditingCategory] = useState('');
  const [editingDate, setEditingDate] = useState('');
  const [editingNote, setEditingNote] = useState('');

  // Budget Configuration State
  const [budgetCat, setBudgetCat] = useState('Food');
  const [budgetAmount, setBudgetAmount] = useState('');

  const db = useMemo(() => {
    const empty = { expenses: [] as Expense[], budgets: {} as Budget };
    if (!data) return empty;
    return {
      expenses: Array.isArray(data.expenses) ? data.expenses : [],
      budgets: ((data.budgets && typeof data.budgets === 'object') ? data.budgets : {}) as Budget
    };
  }, [data]);

  const expenses = db.expenses;
  const budgets: Budget = db.budgets;
  // Add Expense Entry
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newExpense: Expense = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      amount: parsedAmount,
      category: category.trim() || 'Other',
      date: date.slice(0, 10),
      note: note.trim(),
      createdAt: Date.now()
    };

    const nextDb = {
      ...db,
      expenses: [newExpense, ...expenses]
    };
    await saveData(nextDb);
    setAmount('');
    setNote('');
    alert('Expense recorded successfully!');
  };

  // Delete Expense Entry
  const handleDeleteExpense = async (id: string) => {
    if (confirm('Delete this expense entry?')) {
      const nextDb = {
        ...db,
        expenses: expenses.filter(exp => exp.id !== id)
      };
      await saveData(nextDb);
    }
  };

  // Edit Expense Entry
  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setEditingAmount(String(exp.amount));
    setEditingCategory(exp.category);
    setEditingDate(exp.date);
    setEditingNote(exp.note);
  };

  const handleSaveEdit = async () => {
    const parsedAmount = Number(editingAmount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const nextDb = {
      ...db,
      expenses: expenses.map(exp => 
        exp.id === editingId 
          ? { ...exp, amount: parsedAmount, category: editingCategory, date: editingDate, note: editingNote }
          : exp
      )
    };
    await saveData(nextDb);
    setEditingId(null);
  };

  // Set Budget Action
  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(budgetAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) return;

    const nextBudgets = { ...budgets };
    if (parsedAmount === 0) {
      delete nextBudgets[budgetCat];
    } else {
      nextBudgets[budgetCat] = parsedAmount;
    }

    const nextDb = {
      ...db,
      budgets: nextBudgets
    };
    await saveData(nextDb);
    setBudgetAmount('');
    alert(`Budget configured for ${budgetCat}!`);
  };

  // Calculations
  const categoryTotals = useMemo(() => {
    return expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  // Format currency Indian Rupees/INR standard as defined in original logic or standard USD
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  if (loading) {
    return <ReusableLoading type="skeleton" count={4} />;
  }

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      
      {/* Cloud status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800 }}>Finance Suite</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Track expenses, config budgets, and view visual analytics.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 600 }}>
          <Cloud size={16} /> Secured Cloud Sync
        </div>
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '5px' }}>
        {[
          { id: 'add', label: '➕ Record Expense' },
          { id: 'list', label: '📋 Outflow List' },
          { id: 'budget', label: '🎯 Set Budget' },
          { id: 'analytics', label: '📈 Visual Trends' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 18px',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              background: activeTab === tab.id ? 'var(--primary-gradient)' : 'var(--glass-bg)',
              color: activeTab === tab.id ? 'white' : 'var(--text-color)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-smooth)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Add Expense */}
      {activeTab === 'add' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          <form onSubmit={handleAddExpense} className="glass-panel" style={{ margin: 0, padding: '25px', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px' }}>Record Purchase</h3>
            
            <div className="form-group">
              <label>Amount (INR)</label>
              <input
                type="number"
                placeholder="e.g. 250.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                {BASE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Note / Description (Optional)</label>
              <textarea
                placeholder="Where or what was this spent on?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>

            <button type="submit" className="btn" style={{ width: '100%' }}>
              Save Entry
            </button>
          </form>

          {/* Quick status summary cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'var(--primary-gradient)', color: 'white', padding: '25px', borderRadius: '15px', boxShadow: 'var(--neon-shadow)' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Total Cumulative Spending</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', fontFamily: "'Outfit', sans-serif" }}>
                {formatCurrency(totalSpent)}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '12px' }}>
                All transaction outflows successfully recorded.
              </div>
            </div>

            <div className="glass-panel" style={{ margin: 0, padding: '20px', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '12px' }}>Quick Stats</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Transactions</span>
                  <span style={{ fontWeight: 600 }}>{expenses.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Active Budgets</span>
                  <span style={{ fontWeight: 600 }}>{Object.keys(budgets).length} categories</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Expense List */}
      {activeTab === 'list' && (
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Historical Transactions</h3>
          
          <div style={{ overflowX: 'auto' }}>
            {expenses.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                    <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>Date</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>Category</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>Note</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>Amount</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id} style={{ borderBottom: '1px dashed var(--glass-border)' }}>
                      {editingId === exp.id ? (
                        <>
                          <td style={{ padding: '8px 5px' }}>
                            <input
                              type="date"
                              value={editingDate}
                              onChange={(e) => setEditingDate(e.target.value)}
                              className="form-input"
                              style={{ padding: '6px', fontSize: '0.8rem' }}
                            />
                          </td>
                          <td style={{ padding: '8px 5px' }}>
                            <select
                              value={editingCategory}
                              onChange={(e) => setEditingCategory(e.target.value)}
                              className="form-select"
                              style={{ padding: '6px', fontSize: '0.8rem' }}
                            >
                              {BASE_CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '8px 5px' }}>
                            <input
                              type="text"
                              value={editingNote}
                              onChange={(e) => setEditingNote(e.target.value)}
                              className="form-input"
                              style={{ padding: '6px', fontSize: '0.8rem' }}
                            />
                          </td>
                          <td style={{ padding: '8px 5px' }}>
                            <input
                              type="number"
                              value={editingAmount}
                              onChange={(e) => setEditingAmount(e.target.value)}
                              className="form-input"
                              style={{ padding: '6px', fontSize: '0.8rem' }}
                            />
                          </td>
                          <td style={{ padding: '8px 5px', textAlign: 'right' }}>
                            <button onClick={handleSaveEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success-color)', marginRight: '8px' }}>
                              <Check size={16} />
                            </button>
                            <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-color)' }}>
                              <X size={16} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: '12px 10px' }}>{exp.date}</td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{
                              background: 'rgba(0,161,155,0.06)',
                              color: 'var(--primary-color)',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {exp.category}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{exp.note || '—'}</td>
                          <td style={{ padding: '12px 10px', fontWeight: 600 }}>{formatCurrency(exp.amount)}</td>
                          <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                            <button onClick={() => startEdit(exp)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: '10px', opacity: 0.7 }}>
                              <Edit3 size={15} />
                            </button>
                            <button onClick={() => handleDeleteExpense(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-color)', opacity: 0.7 }}>
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                No expenses logged yet. Switch to the 'Record' tab to start logging.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Budget Configure */}
      {activeTab === 'budget' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          <form onSubmit={handleSetBudget} className="glass-panel" style={{ margin: 0, padding: '25px', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '15px' }}>Configure Category Budget</h3>

            <div className="form-group">
              <label>Select Category</label>
              <select
                value={budgetCat}
                onChange={(e) => setBudgetCat(e.target.value)}
                className="form-select"
              >
                {BASE_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Monthly Spending Limit (INR)</label>
              <input
                type="number"
                placeholder="e.g. 5000 (Enter 0 to clear)"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn" style={{ width: '100%' }}>
              Configure Budget Limit
            </button>
          </form>

          {/* Budget progress bar tracking list */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Active Budget Statuses</h3>
            
            {Object.keys(budgets).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Object.entries(budgets).map(([cat, limit]) => {
                  const spent = categoryTotals[cat] || 0;
                  const limitNum = Number(limit);
                  const ratio = Math.min((spent / limitNum) * 100, 100);
                  const isOver = spent > limitNum;
                  return (
                    <div key={cat} style={{ background: 'rgba(0,0,0,0.01)', border: '1px solid var(--glass-border)', padding: '15px', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 700 }}>{cat}</span>
                        <span style={{ color: isOver ? 'var(--error-color)' : 'var(--text-secondary)', fontWeight: 600 }}>
                          {formatCurrency(spent)} / {formatCurrency(limit)}
                        </span>
                      </div>
                      
                      {/* Bar container */}
                      <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${ratio}%`,
                          height: '100%',
                          background: isOver ? 'var(--error-color)' : 'var(--primary-color)',
                          borderRadius: '4px',
                          transition: 'width 0.5s'
                        }} />
                      </div>
                      
                      {isOver && (
                        <div style={{ color: 'var(--error-color)', fontSize: '0.75rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <AlertCircle size={12} /> Budget Limit Exceeded!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: '0.85rem', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                No active category limits set.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Visual Analytics Trends */}
      {activeTab === 'analytics' && (
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--primary-color)" /> Category Outflow Distribution
          </h3>

          {expenses.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', alignItems: 'center' }}>
              
              {/* Progress bars of category ratios */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {Object.entries(categoryTotals).map(([cat, total]) => {
                  const totalNum = Number(total);
                  const ratio = ((totalNum / totalSpent) * 100).toFixed(1);
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span>{cat} ({ratio}%)</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(totalNum)}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px' }}>
                        <div style={{
                          width: `${ratio}%`,
                          height: '100%',
                          background: 'var(--primary-color)',
                          borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Graphic visual box displaying spending breakdown */}
              <div className="glass-panel" style={{ margin: 0, padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: '15px', fontSize: '0.95rem' }}>Financial Insights</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)', fontFamily: "'Outfit', sans-serif" }}>
                  {Object.keys(categoryTotals).length}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '6px' }}>
                  Different categories have active transactional outflows registered.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
              Add and log some outflow entries to compile graphical trends automatically.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
