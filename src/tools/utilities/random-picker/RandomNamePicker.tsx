'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shuffle, History, Trash2, RotateCcw, AlertCircle, Sparkles, User, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PickHistoryItem {
  id: string;
  timestamp: string;
  winners: string[];
}

export default function RandomNamePicker() {
  const [inputText, setInputText] = useState("Alex Smith\nSarah Connor\nBruce Wayne\nDiana Prince\nClark Kent\nTony Stark\nPeter Parker\nSelina Kyle");
  const [pickCount, setPickCount] = useState<number>(1);
  const [removeOnPick, setRemoveOnPick] = useState<boolean>(false);
  const [isPicking, setIsPicking] = useState<boolean>(false);
  const [currentCycleName, setCurrentCycleName] = useState<string>('');
  const [winners, setWinners] = useState<string[]>([]);
  const [history, setHistory] = useState<PickHistoryItem[]>([]);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  
  // Animation state/refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cycleCountRef = useRef<number>(0);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('infkit_name_picker_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: PickHistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('infkit_name_picker_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  };

  const handlePick = () => {
    setError('');
    setWinners([]);
    
    const items = inputText
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (items.length === 0) {
      setError('Please enter at least one name or item.');
      return;
    }

    if (pickCount < 1) {
      setError('You must pick at least 1 item.');
      return;
    }

    if (pickCount > items.length) {
      setError(`Cannot pick ${pickCount} items. You only entered ${items.length} items.`);
      return;
    }

    setIsPicking(true);
    cycleCountRef.current = 0;
    
    // Cycle animation
    let speed = 40;
    const maxCycles = 40; // Total cycles

    const cycle = () => {
      const randomIdx = Math.floor(Math.random() * items.length);
      setCurrentCycleName(items[randomIdx]);
      cycleCountRef.current += 1;

      if (cycleCountRef.current < maxCycles) {
        // Slow down the scrolling towards the end
        if (cycleCountRef.current > maxCycles - 10) {
          speed += 25;
        } else if (cycleCountRef.current > maxCycles - 5) {
          speed += 50;
        }
        intervalRef.current = setTimeout(cycle, speed);
      } else {
        // We have finished cycling, now select winner(s)
        finalizeWinners(items);
      }
    };

    cycle();
  };

  const finalizeWinners = (allItems: string[]) => {
    // Pick winners randomly
    const pool = [...allItems];
    const selectedWinners: string[] = [];

    for (let i = 0; i < pickCount; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      selectedWinners.push(pool[idx]);
      pool.splice(idx, 1);
    }

    setWinners(selectedWinners);
    setIsPicking(false);
    setCurrentCycleName('');

    // Trigger confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#00A19B', '#ffd700', '#ffffff', '#22c55e']
      });
    } catch (e) {
      console.warn('Confetti fail', e);
    }

    // Update inputText if "remove selected" is checked
    if (removeOnPick) {
      const updatedList = allItems.filter(item => !selectedWinners.includes(item));
      setInputText(updatedList.join('\n'));
    }

    // Add to history (limit to 10)
    const newHistoryItem: PickHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      winners: selectedWinners
    };

    const newHistory = [newHistoryItem, ...history].slice(0, 10);
    saveHistory(newHistory);
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getQuickSample = () => {
    setInputText("Coffee ☕\nTea 🍵\nLemonade 🍋\nSmoothie 🍓\nHot Chocolate 🍫\nMatcha 🍵\nIced Coffee 🧊\nKombucha 🍾");
    setWinners([]);
    setError('');
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '650px', padding: '30px 25px', color: 'var(--text-color)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 161, 155, 0.1)',
          color: 'var(--primary-color)',
          marginBottom: '12px'
        }}>
          <Shuffle size={26} />
        </div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          Random Name Picker
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          An elegant random selection tool for names, decisions, raffles, and lists.
        </p>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Input Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Enter Items / Names (One per line)</label>
            <button 
              onClick={getQuickSample} 
              style={{
                fontSize: '0.8rem',
                color: 'var(--primary-color)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 161, 155, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Load Sample List
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isPicking}
            placeholder="Type your names/items here, one on each line..."
            rows={7}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-color)',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
          />
        </div>

        {/* Options Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          padding: '15px',
          borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--glass-border)'
        }}>
          {/* Pick Count */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Amount to Pick</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min={1}
                value={pickCount}
                onChange={(e) => setPickCount(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isPicking}
                style={{
                  width: '70px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid var(--glass-border)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-color)',
                  fontWeight: 600,
                  outline: 'none',
                  textAlign: 'center'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>item(s)</span>
            </div>
          </div>

          {/* Remove option */}
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isPicking ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              userSelect: 'none',
              fontWeight: 500
            }}>
              <input
                type="checkbox"
                checked={removeOnPick}
                onChange={(e) => setRemoveOnPick(e.target.checked)}
                disabled={isPicking}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--primary-color)',
                  cursor: 'pointer'
                }}
              />
              Remove picked item(s) from list
            </label>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: '#f87171',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handlePick}
          disabled={isPicking || inputText.trim() === ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 24px',
            borderRadius: '30px',
            border: 'none',
            background: 'var(--primary-color)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 161, 155, 0.3)',
            opacity: isPicking || inputText.trim() === '' ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isPicking && inputText.trim() !== '') {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 161, 155, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 161, 155, 0.3)';
          }}
        >
          {isPicking ? (
            <>
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spinPicker 0.6s linear infinite',
              }} />
              <style>{`@keyframes spinPicker { to { transform: rotate(360deg); } }`}</style>
              <span>Shuffling Names...</span>
            </>
          ) : (
            <>
              <Shuffle size={18} />
              <span>Draw Random Winner!</span>
            </>
          )}
        </button>

        {/* Selector Animation Panel */}
        {isPicking && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 15px',
            borderRadius: '16px',
            backgroundColor: 'rgba(0, 161, 155, 0.05)',
            border: '2px dashed var(--primary-color)',
            textAlign: 'center',
            animation: 'pulseBorder 1s infinite alternate'
          }}>
            <style>{`
              @keyframes pulseBorder {
                from { border-color: rgba(0, 161, 155, 0.3); box-shadow: 0 0 10px rgba(0, 161, 155, 0.05); }
                to { border-color: var(--primary-color); box-shadow: 0 0 20px rgba(0, 161, 155, 0.2); }
              }
            `}</style>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary-color)', fontWeight: 700, marginBottom: '8px' }}>
              Selecting...
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-color)',
              textShadow: '0 0 12px rgba(255,255,255,0.3)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '90%',
              animation: 'bounceText 0.1s infinite alternate'
            }}>
              <style>{`
                @keyframes bounceText {
                  from { transform: scale(0.98); }
                  to { transform: scale(1.02); }
                }
              `}</style>
              {currentCycleName}
            </div>
          </div>
        )}

        {/* Winners Results Panel */}
        {!isPicking && winners.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            padding: '25px',
            borderRadius: '16px',
            backgroundColor: 'rgba(0, 161, 155, 0.08)',
            border: '1.5px solid var(--primary-color)',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 161, 155, 0.15)',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <style>{`
              @keyframes scaleUp {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
              <Sparkles size={20} />
              <span style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                {winners.length === 1 ? '🎉 The Winner 🎉' : '🎉 Selected Winners 🎉'}
              </span>
              <Sparkles size={20} />
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '10px 0'
            }}>
              {winners.map((winner, idx) => (
                <div key={idx} style={{
                  fontSize: winners.length === 1 ? '2.2rem' : '1.5rem',
                  fontWeight: 900,
                  color: 'var(--text-color)',
                  padding: '8px 24px',
                  borderRadius: '30px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  width: 'fit-content',
                  maxWidth: '100%',
                  wordBreak: 'break-all'
                }}>
                  {winner}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={() => handleCopyToClipboard(winners.join(', '))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid var(--glass-border)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-color)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              >
                {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Winner(s)'}</span>
              </button>
              
              <button
                onClick={handlePick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: 'var(--primary-color)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <RotateCcw size={14} />
                <span>Draw Again</span>
              </button>
            </div>
          </div>
        )}

        {/* History Panel */}
        <div style={{
          marginTop: '10px',
          borderTop: '1px solid var(--glass-border)',
          paddingTop: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700
            }}>
              <History size={16} />
              Recent Picks
            </h3>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: '#f87171',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <Trash2 size={12} />
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              backgroundColor: 'rgba(255,255,255,0.01)',
              borderRadius: '8px',
              border: '1px dashed var(--glass-border)'
            }}>
              No selection history yet. Pull a name to see it logged here!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--glass-border)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.timestamp}</span>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      color: 'var(--text-color)',
                      fontWeight: 600
                    }}>
                      {item.winners.map((winner, index) => (
                        <span key={index} style={{
                          backgroundColor: 'rgba(0,161,155,0.1)',
                          color: 'var(--primary-color)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem'
                        }}>
                          {winner}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '50%'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
