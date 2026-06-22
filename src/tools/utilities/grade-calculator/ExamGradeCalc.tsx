'use client';

import React, { useState } from 'react';
import { GraduationCap, Plus, Trash2, Calculator, BookOpen, TrendingUp } from 'lucide-react';

interface GPASubject {
  id: number;
  name: string;
  grade: number;
  credits: number;
}

const GRADE_SCALES = {
  'standard': { name: 'Standard (A=90+)', A_plus: 100, A: 90, A_minus: 87, B_plus: 83, B: 80, B_minus: 77, C_plus: 73, C: 70, C_minus: 67, D_plus: 63, D: 60 },
  'strict':   { name: 'Strict (A=93+)',   A_plus: 100, A: 93, A_minus: 90, B_plus: 87, B: 83, B_minus: 80, C_plus: 77, C: 73, C_minus: 70, D_plus: 67, D: 63 },
};

function gradeToGPA(grade: number, scale: keyof typeof GRADE_SCALES): number {
  const s = GRADE_SCALES[scale];
  if (grade >= s.A)      return 4.0;
  if (grade >= s.A_minus) return 3.7;
  if (grade >= s.B_plus)  return 3.3;
  if (grade >= s.B)       return 3.0;
  if (grade >= s.B_minus) return 2.7;
  if (grade >= s.C_plus)  return 2.3;
  if (grade >= s.C)       return 2.0;
  if (grade >= s.C_minus) return 1.7;
  if (grade >= s.D_plus)  return 1.3;
  if (grade >= s.D)       return 1.0;
  return 0.0;
}

function getLetterGrade(grade: number, scale: keyof typeof GRADE_SCALES): string {
  const s = GRADE_SCALES[scale];
  if (grade >= s.A)      return 'A';
  if (grade >= s.A_minus) return 'A−';
  if (grade >= s.B_plus)  return 'B+';
  if (grade >= s.B)       return 'B';
  if (grade >= s.B_minus) return 'B−';
  if (grade >= s.C_plus)  return 'C+';
  if (grade >= s.C)       return 'C';
  if (grade >= s.C_minus) return 'C−';
  if (grade >= s.D_plus)  return 'D+';
  if (grade >= s.D)       return 'D';
  return 'F';
}

export default function ExamGradeCalc() {
  const [tab, setTab] = useState<'exam' | 'gpa'>('exam');
  const [currentGrade, setCurrentGrade] = useState<string>('82');
  const [desiredGrade, setDesiredGrade] = useState<string>('85');
  const [examWeight, setExamWeight] = useState<string>('30');
  const [examResult, setExamResult] = useState<{ needed: number; possible: boolean } | null>(null);
  const [scale, setScale] = useState<keyof typeof GRADE_SCALES>('standard');
  const [subjects, setSubjects] = useState<GPASubject[]>([
    { id: 1, name: 'Mathematics', grade: 88, credits: 3 },
    { id: 2, name: 'English', grade: 92, credits: 3 },
    { id: 3, name: 'Science', grade: 76, credits: 4 },
  ]);
  const [gpa, setGpa] = useState<number | null>(null);

  const calcExam = () => {
    const cg = parseFloat(currentGrade);
    const dg = parseFloat(desiredGrade);
    const ew = parseFloat(examWeight) / 100;
    if (isNaN(cg) || isNaN(dg) || isNaN(ew) || ew <= 0 || ew >= 1) return;
    const currentWeight = 1 - ew;
    const needed = (dg - currentWeight * cg) / ew;
    setExamResult({ needed, possible: needed <= 100 });
  };

  const calcGPA = () => {
    const valid = subjects.filter(s => s.name && s.credits > 0);
    if (valid.length === 0) return;
    const totalCredits = valid.reduce((sum, s) => sum + s.credits, 0);
    const weightedSum = valid.reduce((sum, s) => sum + gradeToGPA(s.grade, scale) * s.credits, 0);
    setGpa(weightedSum / totalCredits);
  };

  const addSubject = () => {
    setSubjects(prev => [...prev, { id: Date.now(), name: '', grade: 80, credits: 3 }]);
  };

  const removeSubject = (id: number) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const updateSubject = (id: number, field: keyof GPASubject, value: any) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

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
    gap: '8px',
    transition: 'var(--transition-smooth)',
  };

  return (
    <div style={{ padding: '10px 0' }}>
      <div className="glass-panel">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <GraduationCap size={28} color="var(--primary-color)" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Academic Grade Estimator</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
          Calculate your required exam score or compute your weighted GPA instantly.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--glass-bg)', borderRadius: '12px', padding: '4px', border: '1px solid var(--glass-border)' }}>
          {(['exam', 'gpa'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, background: tab === t ? 'var(--primary-color)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-secondary)',
              border: 'none', borderRadius: '10px', padding: '10px',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {t === 'exam' ? <><Calculator size={16} /> Final Exam Score</> : <><BookOpen size={16} /> GPA Calculator</>}
            </button>
          ))}
        </div>

        {/* Grade Scale */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Grade Scale</label>
          <select value={scale} onChange={e => setScale(e.target.value as keyof typeof GRADE_SCALES)} style={{ ...inputStyle, width: 'auto', paddingRight: '32px' }}>
            {Object.entries(GRADE_SCALES).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </div>

        {tab === 'exam' ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Current Grade (%)</label>
                <input type="number" min={0} max={100} value={currentGrade} onChange={e => setCurrentGrade(e.target.value)} style={inputStyle} placeholder="e.g. 82" />
              </div>
              <div>
                <label style={labelStyle}>Desired Final Grade (%)</label>
                <input type="number" min={0} max={100} value={desiredGrade} onChange={e => setDesiredGrade(e.target.value)} style={inputStyle} placeholder="e.g. 85" />
              </div>
              <div>
                <label style={labelStyle}>Final Exam Weight (%)</label>
                <input type="number" min={1} max={99} value={examWeight} onChange={e => setExamWeight(e.target.value)} style={inputStyle} placeholder="e.g. 30" />
              </div>
            </div>

            <button onClick={calcExam} style={{ ...btnStyle, width: '100%', justifyContent: 'center' }}>
              <Calculator size={18} /> Calculate Required Score
            </button>

            {examResult && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                borderRadius: '14px',
                background: examResult.possible ? 'rgba(40, 167, 69, 0.06)' : 'rgba(220, 53, 69, 0.06)',
                border: `1px solid ${examResult.possible ? 'rgba(40, 167, 69, 0.25)' : 'rgba(220, 53, 69, 0.25)'}`,
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Minimum Score Needed on Final Exam
                </div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: examResult.possible ? 'var(--primary-color)' : '#dc3545', lineHeight: 1 }}>
                  {examResult.needed < 0 ? '0%' : `${examResult.needed.toFixed(1)}%`}
                </div>
                <div style={{ marginTop: '10px', fontWeight: 700, fontSize: '0.95rem', color: examResult.possible ? '#28a745' : '#dc3545' }}>
                  {examResult.possible
                    ? examResult.needed <= 0
                      ? '🎉 You already have your desired grade — even a 0 on the final would work!'
                      : `✅ Achievable! Score ${examResult.needed.toFixed(1)}% or above on the final.`
                    : '❌ Not achievable — even a perfect 100% won\'t reach your desired grade.'}
                </div>
                {examResult.possible && examResult.needed > 0 && (
                  <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Letter Grade Target: <strong>{getLetterGrade(parseFloat(desiredGrade), scale)}</strong>
                    &nbsp;·&nbsp; GPA Points: <strong>{gradeToGPA(parseFloat(desiredGrade), scale).toFixed(1)}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <label style={{ ...labelStyle, margin: 0 }}>Subjects</label>
              <button onClick={addSubject} style={{ ...btnStyle, padding: '8px 16px', fontSize: '0.82rem' }}>
                <Plus size={14} /> Add Subject
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {subjects.map(s => (
                <div key={s.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 80px 40px',
                  gap: '10px', alignItems: 'center',
                  background: 'var(--glass-bg)', borderRadius: '12px',
                  padding: '12px', border: '1px solid var(--glass-border)'
                }}>
                  <input
                    value={s.name}
                    onChange={e => updateSubject(s.id, 'name', e.target.value)}
                    placeholder="Subject name"
                    style={{ ...inputStyle, padding: '8px 12px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>GRADE %</span>
                    <input
                      type="number" min={0} max={100}
                      value={s.grade}
                      onChange={e => updateSubject(s.id, 'grade', parseFloat(e.target.value))}
                      style={{ ...inputStyle, padding: '8px 10px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CREDITS</span>
                    <input
                      type="number" min={1} max={6}
                      value={s.credits}
                      onChange={e => updateSubject(s.id, 'credits', parseFloat(e.target.value))}
                      style={{ ...inputStyle, padding: '8px 10px' }}
                    />
                  </div>
                  <button onClick={() => removeSubject(s.id)} style={{
                    background: 'rgba(220,53,69,0.1)', border: 'none', borderRadius: '8px',
                    color: '#dc3545', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Per-subject mini breakdown */}
            {subjects.length > 0 && (
              <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {subjects.map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '0 4px' }}>
                    <span>{s.name || '(unnamed)'}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-color)' }}>{getLetterGrade(s.grade, scale)} · {gradeToGPA(s.grade, scale).toFixed(1)} pts</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={calcGPA} style={{ ...btnStyle, width: '100%', justifyContent: 'center' }}>
              <TrendingUp size={18} /> Calculate GPA
            </button>

            {gpa !== null && (
              <div style={{
                marginTop: '20px', padding: '20px', borderRadius: '14px',
                background: 'rgba(0,161,155,0.06)', border: '1px solid rgba(0,161,155,0.2)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Weighted GPA</div>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary-color)', lineHeight: 1 }}>{gpa.toFixed(2)}</div>
                <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {gpa >= 3.7 ? '🏆 Excellent standing' : gpa >= 3.0 ? '✅ Good standing' : gpa >= 2.0 ? '⚠️ Satisfactory' : '❌ Below average'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
