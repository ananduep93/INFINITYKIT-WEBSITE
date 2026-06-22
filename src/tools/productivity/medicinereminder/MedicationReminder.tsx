'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Clock, Calendar, Check, Cloud } from 'lucide-react';
import { useSync } from '../../../hooks/useSync';
import ReusableLoading from '../../../components/ui/ReusableLoading';

interface MedReminder {
  id: string;
  name: string;
  dosage: string;
  frequency: number; // in hours
  startTime: string; // "HH:MM"
  schedules: { time: string; taken: boolean }[];
}

export default function MedicationReminder() {
  const { data, saveData, loading } = useSync('medreminders');
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState(8);
  const [startTime, setStartTime] = useState('08:00');

  const reminders: MedReminder[] = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const generateSchedules = (start: string, freq: number) => {
    const list: { time: string; taken: boolean }[] = [];
    const [h, m] = start.split(':').map(Number);
    
    // Generate doses in a 24h cycle
    let currentHour = h;
    const occurrences = Math.floor(24 / freq);
    
    for (let i = 0; i < occurrences; i++) {
      const timeStr = `${currentHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      list.push({ time: timeStr, taken: false });
      currentHour = (currentHour + freq) % 24;
    }
    
    // Sort times
    return list.sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !dosage.trim()) return;

    const schedules = generateSchedules(startTime, Number(frequency));
    const newMed: MedReminder = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: medName.trim(),
      dosage: dosage.trim(),
      frequency: Number(frequency),
      startTime,
      schedules
    };

    const updated = [newMed, ...reminders];
    await saveData(updated);
    
    setMedName('');
    setDosage('');
  };

  const handleToggleSchedule = async (medId: string, time: string) => {
    const updated = reminders.map(r => {
      if (r.id === medId) {
        const nextScheds = r.schedules.map(s => 
          s.time === time ? { ...s, taken: !s.taken } : s
        );
        return { ...r, schedules: nextScheds };
      }
      return r;
    });
    await saveData(updated);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this medication schedule?')) {
      const updated = reminders.filter(r => r.id !== id);
      await saveData(updated);
    }
  };

  if (loading) {
    return <ReusableLoading type="skeleton" count={3} />;
  }

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '750px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800 }}>Medication Scheduler</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Generate daily intervals and tick off logs.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 600 }}>
          <Cloud size={16} /> Cloud Synced
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
        
        {/* Form to add medicine */}
        <form onSubmit={handleAdd} className="glass-panel" style={{ margin: 0, padding: '20px', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} color="var(--primary-color)" /> Add Schedule
          </h3>

          <div className="form-group">
            <label>Medication Name</label>
            <input
              type="text"
              placeholder="e.g. Paracetamol"
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Dosage</label>
            <input
              type="text"
              placeholder="e.g. 500mg (1 Tablet)"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Frequency (Every X Hours)</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="form-select"
            >
              <option value={4}>Every 4 Hours (6 times daily)</option>
              <option value={6}>Every 6 Hours (4 times daily)</option>
              <option value={8}>Every 8 Hours (3 times daily)</option>
              <option value={12}>Every 12 Hours (2 times daily)</option>
              <option value={24}>Every 24 Hours (Once daily)</option>
            </select>
          </div>

          <div className="form-group">
            <label>First Dose Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>
            Generate Logs
          </button>
        </form>

        {/* List of generated reminders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <Clock size={16} color="var(--primary-color)" /> Today's Dosing Logs
          </h3>

          {reminders.length > 0 ? (
            reminders.map((med) => (
              <div
                key={med.id}
                style={{
                  padding: '16px',
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '15px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-color)' }}>{med.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {med.dosage} • Every {med.frequency}h
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(med.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--error-color)',
                      opacity: 0.6
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Checklist times */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {med.schedules.map((s) => (
                    <button
                      key={s.time}
                      onClick={() => handleToggleSchedule(med.id, s.time)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--glass-border)',
                        background: s.taken ? 'rgba(40, 167, 69, 0.1)' : 'var(--glass-bg)',
                        borderColor: s.taken ? 'var(--success-color)' : 'var(--glass-border)',
                        color: s.taken ? 'var(--success-color)' : 'var(--text-color)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {s.taken ? <Check size={12} /> : <Clock size={12} />}
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: '0.9rem', background: 'rgba(0,0,0,0.01)', border: '1px dashed var(--glass-border)', borderRadius: '15px' }}>
              No medications scheduled. Set your doses to generate checklists.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
