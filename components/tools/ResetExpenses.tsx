'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Trash2, AlertTriangle, Download, ShieldCheck, RefreshCw, Key } from 'lucide-react';
import { useSync } from '../../hooks/useSync';

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  createdAt: number;
}

export default function ResetExpenses() {
  const { data: syncData, saveData, loading: syncLoading } = useSync('infinityKitExpenseDB');
  const [confirmText, setConfirmText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  // Read local storage 'infinitykit_expenses'
  const localStorageExpenses = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('infinitykit_expenses');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.expenses)) return parsed.expenses;
      }
    } catch (e) {
      console.error('Error reading infinitykit_expenses key', e);
    }
    return [];
  }, [triggerRefresh]);

  // Combine databases for calculations
  const expenses: Expense[] = useMemo(() => {
    if (localStorageExpenses.length > 0) {
      return localStorageExpenses;
    }
    if (syncData) {
      if (Array.isArray(syncData.expenses)) return syncData.expenses;
      if (Array.isArray(syncData)) return syncData;
    }
    return [];
  }, [localStorageExpenses, syncData]);

  const handleManualRefresh = () => {
    setTriggerRefresh(prev => prev + 1);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    try {
      const backupData = {
        infinitykit_expenses: localStorageExpenses,
        infinityKitExpenseDB: syncData || null,
        exportedAt: new Date().toISOString(),
        totalExpenses: expenses.length,
        expensesList: expenses
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `infinitykit_expenses_backup_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to generate backup file.');
    }
  };

  // Confirm and Reset Action
  const handleReset = async () => {
    if (confirmText !== 'DELETE') return;

    try {
      // 1. Clear infinitykit_expenses key
      if (typeof window !== 'undefined') {
        localStorage.removeItem('infinitykit_expenses');
      }

      // 2. Clear cloud synced infinityKitExpenseDB (set to empty template)
      if (saveData) {
        await saveData({ expenses: [], budgets: {} });
      }

      // 3. Dispatch global sync event to update other tools instantly
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('infinityKitDataSynced'));
      }

      setIsSuccess(true);
      setConfirmText('');
    } catch (e) {
      alert('Error occurred while erasing logs. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div style={{ padding: '10px 0', width: '100%' }}>
        <div 
          className="glass-panel" 
          style={{ 
            padding: '40px 30px', 
            textAlign: 'center', 
            borderRadius: '20px',
            maxWidth: '520px',
            margin: '0 auto',
            border: '1px solid var(--glass-border)'
          }}
        >
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.12)', 
              color: '#10B981',
              marginBottom: '20px'
            }}
          >
            <ShieldCheck size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-color)' }}>
            Spending Records Cleared!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 25px' }}>
            All transaction history, local ledger cookies, and synced budget databases have been permanently wiped from InfinityKit. Your ledger is now a clean slate.
          </p>

          <button 
            onClick={() => {
              setIsSuccess(false);
              setTriggerRefresh(prev => prev + 1);
            }} 
            style={{ 
              width: '100%',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '12px',
              background: 'var(--primary-color)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 161, 155, 0.2)'
            }}
          >
            Start A New Ledger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px 0', width: '100%' }}>
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px 28px', 
          marginBottom: '20px', 
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
            <Trash2 color="#EF4444" size={24} /> Clear Spending Records
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '6px 0 0' }}>
            Irreversibly erase historical transaction logs, metadata, and active monthly budget limits.
          </p>
        </div>

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
          title="Refresh active transactions"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Side: Ledger Info and Danger Alert */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px' }}>Active Ledger Summary</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
              The following resources will be targeted and deleted:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid var(--glass-border)', padding: '12px 14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Logged Transactions</span>
              <strong style={{ fontSize: '1rem', color: 'var(--text-color)' }}>{expenses.length} entries</strong>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.015)', border: '1px solid var(--glass-border)', padding: '12px 14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category Budgets</span>
              <strong style={{ fontSize: '1rem', color: 'var(--text-color)' }}>
                {syncData?.budgets ? Object.keys(syncData.budgets).length : 0} limits
              </strong>
            </div>
          </div>

          {/* Danger Warning Box */}
          <div 
            style={{ 
              background: 'rgba(239, 68, 68, 0.08)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: '12px', 
              padding: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}
          >
            <AlertTriangle color="#EF4444" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#EF4444', display: 'block', marginBottom: '4px' }}>
                Crucial Warning Notice
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                This action will permanently delete all your expense logs from this browser and associated cloud profiles. It is immediate and completely irreversible.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Export Backup and Reset Confirmation */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px' }}>Safety Options & Execution</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
              Export your data safely before clearing to prevent permanent information loss.
            </p>
          </div>

          {/* Export JSON backup button */}
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '15px 18px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>Save JSON Data Backup</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Download full expense records as a static local backup.</span>
              </div>
              
              <button 
                onClick={handleExportBackup} 
                disabled={expenses.length === 0}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '8px 14px', 
                  border: '1px solid var(--glass-border)', 
                  background: 'var(--glass-bg)', 
                  color: 'var(--text-color)', 
                  borderRadius: '10px', 
                  fontWeight: 600, 
                  fontSize: '0.8rem', 
                  cursor: 'pointer',
                  opacity: expenses.length === 0 ? 0.5 : 1
                }}
              >
                <Download size={14} /> Export JSON
              </button>
            </div>
          </div>

          {/* Security unlock form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Confirm deletion by entering &quot;DELETE&quot;:
            </label>
            
            <div style={{ position: 'relative' }}>
              <Key size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="Type DELETE to unlock" 
                style={{ 
                  width: '100%',
                  padding: '11px 12px 11px 34px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--glass-bg)',
                  color: 'var(--text-color)',
                  outline: 'none',
                  fontSize: '0.88rem'
                }} 
              />
            </div>

            <button 
              onClick={handleReset} 
              disabled={confirmText !== 'DELETE'}
              style={{ 
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '12px',
                background: confirmText === 'DELETE' ? '#EF4444' : 'rgba(239, 68, 68, 0.1)',
                color: confirmText === 'DELETE' ? '#fff' : 'rgba(239, 68, 68, 0.4)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: confirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                marginTop: '6px',
                boxShadow: confirmText === 'DELETE' ? '0 4px 12px rgba(239, 68, 68, 0.2)' : 'none',
                transition: 'var(--transition-smooth)'
              }}
            >
              Confirm Permanent Reset
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
