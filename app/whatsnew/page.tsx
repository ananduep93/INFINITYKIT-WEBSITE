'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Sparkles, Calendar, Zap, AlertCircle } from 'lucide-react';
import { ReusableLoading } from '../../components/ui/ReusableLoading';

interface UpdateItem {
  id: string;
  message: string;
  timestamp: Date;
}

export default function WhatsNewPage() {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const q = query(collection(db, 'updates'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);

        const list: UpdateItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Safe date parsing in case Firestore timestamp is missing
          let dateObj = new Date();
          if (data.timestamp instanceof Timestamp) {
            dateObj = data.timestamp.toDate();
          } else if (data.timestamp && typeof data.timestamp.toDate === 'function') {
            dateObj = data.timestamp.toDate();
          } else if (data.timestamp) {
            dateObj = new Date(data.timestamp);
          }

          list.push({
            id: doc.id,
            message: data.message || '',
            timestamp: dateObj
          });
        });

        setUpdates(list);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching updates: ", err);
        setError("Unable to retrieve updates. Please verify your connection and reload.");
      } finally {
        setLoading(false);
      }
    }

    fetchUpdates();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '80px auto 40px', padding: '40px 20px' }}>
      
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 161, 155, 0.08)', color: 'var(--primary-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '15px' }}>
          <Sparkles size={14} /> Product Changelog
        </div>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--text-color) 30%, var(--primary-color) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '15px',
          letterSpacing: '-1px'
        }}>
          What's New? 🚀
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          maxWidth: '550px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Stay up to date with the latest calculators, performance patches, and AI tools added to Infinity Kit.
        </p>
      </header>

      {/* Updates Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
            <ReusableLoading />
            <ReusableLoading />
          </div>
        ) : error ? (
          <div className="glass-panel" style={{
            padding: '30px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--error-color)',
            justifyContent: 'center'
          }}>
            <AlertCircle size={20} />
            <strong style={{ fontSize: '0.95rem' }}>{error}</strong>
          </div>
        ) : updates.length === 0 ? (
          <div className="glass-panel" style={{
            padding: '40px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <Zap size={32} style={{ opacity: 0.5, marginBottom: '15px', color: 'var(--primary-color)' }} />
            <p style={{ fontSize: '1.05rem', margin: 0 }}>No updates logged yet. Check back soon for exciting launches!</p>
          </div>
        ) : (
          updates.map((update) => (
            <div className="glass-panel update-card" key={update.id} style={{
              padding: '30px 35px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--card-radius)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              transition: 'transform 0.25s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                <Calendar size={14} />
                <span>
                  {update.timestamp.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div style={{
                fontSize: '1.1rem',
                lineHeight: '1.7',
                color: 'var(--text-color)',
                opacity: 0.95,
                whiteSpace: 'pre-wrap'
              }}>
                {update.message}
              </div>
            </div>
          ))
        )}

      </div>

      <style jsx>{`
        .update-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0, 161, 155, 0.2) !important;
          box-shadow: 0 10px 25px rgba(0, 161, 155, 0.04) !important;
        }
      `}</style>

    </div>
  );
}
