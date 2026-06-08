'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Cloud, Trash2 } from 'lucide-react';
import { useSync } from '../../hooks/useSync';
import ReusableLoading from '../ui/ReusableLoading';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

export default function AIChatbot() {
  const { data, saveData, loading } = useSync('aichatbot_history');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages: Message[] = React.useMemo(() => {
    return Array.isArray(data) ? data : [
      { sender: 'bot', text: "Hello! I'm Infinity AI. How can I help you today? Ask me any questions, let me solve code, or write essays!", timestamp: Date.now() }
    ];
  }, [data]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      sender: 'user',
      text: input.trim(),
      timestamp: Date.now()
    };

    const nextMessages = [...messages, userMsg];
    setInput('');
    setIsTyping(true);

    try {
      const localOpenaiKey = localStorage.getItem('infinitykit_openai_key') || '';
      const localGeminiKey = localStorage.getItem('infinitykit_gemini_key') || '';

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg.text,
          taskType: 'chat',
          context: JSON.stringify(messages.slice(-5)), // Send last 5 messages for context
          openaiKey: localOpenaiKey,
          geminiKey: localGeminiKey
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Communication failure with AI servers.');
      }

      const botMsg: Message = {
        sender: 'bot',
        text: resData.text,
        timestamp: Date.now()
      };

      await saveData([...nextMessages, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        sender: 'bot',
        text: err.message || 'Failed to communicate with AI server. Check connection.',
        timestamp: Date.now()
      };
      await saveData([...nextMessages, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = async () => {
    if (confirm('Clear chat history?')) {
      await saveData([]);
    }
  };

  if (loading) {
    return <ReusableLoading type="skeleton" count={4} />;
  }

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '800px', display: 'flex', flexDirection: 'column', height: '600px', padding: '25px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(0,161,155,0.1)', color: 'var(--primary-color)', padding: '8px', borderRadius: '10px' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 700 }}>Infinity AI Assistant</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Intelligent conversational chatbot powered by Gemini.</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleClear}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
            title="Clear Chat"
          >
            <Trash2 size={15} /> Clear
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 600 }}>
            <Cloud size={15} /> Cloud Sync
          </span>
        </div>
      </div>

      {/* Messages Box */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
        {messages.map((msg, index) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: isBot ? 'flex-start' : 'flex-end',
                maxWidth: '75%',
                flexDirection: isBot ? 'row' : 'row-reverse'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                background: isBot ? 'rgba(0, 161, 155, 0.1)' : 'rgba(0,0,0,0.06)',
                color: isBot ? 'var(--primary-color)' : 'var(--text-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isBot ? <Bot size={16} /> : <User size={16} />}
              </div>

              {/* Text Bubble */}
              <div style={{
                background: isBot ? 'var(--glass-bg)' : 'var(--primary-gradient)',
                color: isBot ? 'var(--text-color)' : 'white',
                border: isBot ? '1px solid var(--glass-border)' : 'none',
                padding: '12px 18px',
                borderRadius: isBot ? '0px 18px 18px 18px' : '18px 0px 18px 18px',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: 'rgba(0, 161, 155, 0.1)',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={16} />
            </div>
            <div style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              padding: '12px 18px',
              borderRadius: '0px 18px 18px 18px',
              display: 'flex',
              gap: '4px',
              alignItems: 'center'
            }}>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }}></span>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></span>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></span>
            </div>
            <style jsx>{`
              @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1.0); }
              }
            `}</style>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="form-input"
          style={{ flex: 1, borderRadius: '25px', padding: '14px 20px' }}
          disabled={isTyping}
        />
        <button
          type="submit"
          className="btn"
          style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0 }}
          disabled={isTyping}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
