'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Upload, RefreshCw } from 'lucide-react';
import ReusableLoading from '../ui/ReusableLoading';
import { getPdfJs, getTextItems, groupItemsIntoLines, linesToPlainText } from '../../lib/pdfjs';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
}

export default function AIChatPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Please upload a PDF file to begin our chat. Once parsed, you can ask me to summarize it, find specific details, or answer questions based on its content!', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setLoading(true);
    setFile(uploaded);

    try {
      const pdfjsLib = await getPdfJs();
      const arrayBuffer = await uploaded.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let text = '';

      for (let i = 1; i <= Math.min(numPages, 30); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Use shared helpers for clean extraction
        const items = getTextItems(textContent);
        const lines = groupItemsIntoLines(items);
        const pageText = linesToPlainText(lines);

        text += `[Page ${i}]\n${pageText}\n\n`;
      }

      if (!text.trim()) {
        throw new Error('No readable text found in PDF.');
      }

      setPdfText(text);
      setMessages([
        { sender: 'bot', text: `Successfully parsed "${uploaded.name}" (${numPages} pages)! Ask me anything about this document.`, timestamp: Date.now() }
      ]);
    } catch (err: any) {
      alert(err.message || 'Failed to parse text from the uploaded PDF document. Make sure it is not corrupted or scanned.');
      resetChat();
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !pdfText) return;

    const userMsg: Message = {
      sender: 'user',
      text: input.trim(),
      timestamp: Date.now()
    };

    const nextMessages = [...messages, userMsg];
    setInput('');
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      const conversationHistory = messages.slice(-6).map(m =>
        `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`
      ).join('\n');

      const localOpenaiKey = localStorage.getItem('infinitykit_openai_key') || '';
      const localGeminiKey = localStorage.getItem('infinitykit_gemini_key') || '';

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${userMsg.text}\n\nPrevious conversation:\n${conversationHistory}`,
          taskType: 'chat',
          context: `You are answering questions about this uploaded PDF document. Respond accurately based ONLY on this text:\n\n${pdfText}`,
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

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        sender: 'bot',
        text: err.message || 'Failed to communicate with AI server. Check connection.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setFile(null);
    setPdfText('');
    setMessages([
      { sender: 'bot', text: 'Please upload a PDF file to begin our chat. Once parsed, you can ask me to summarize it, find specific details, or answer questions based on its content!', timestamp: Date.now() }
    ]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px', display: 'flex', flexDirection: 'column', height: '620px', padding: '25px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(0,161,155,0.1)', color: 'var(--primary-color)', padding: '8px', borderRadius: '10px' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 700 }}>AI Chat with PDF</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Ask questions and chat interactively with your PDF contents.</p>
          </div>
        </div>

        {file && (
          <button
            onClick={resetChat}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-color)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} /> Clear / Upload New
          </button>
        )}
      </div>

      {/* Upload Zone */}
      {!file && !loading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--glass-border)',
              borderRadius: '16px',
              padding: '50px 30px',
              textAlign: 'center',
              width: '100%',
              maxWidth: '500px',
              background: 'rgba(255,255,255,0.01)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(0,161,155,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary-color)'
              }}>
                <Upload size={26} />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-color)' }}>
                  Click to browse or upload your PDF
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                  Text parsing is performed 100% locally in your browser sandbox.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <ReusableLoading type="spinner" />
          <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-color)' }}>Extracting PDF text structures locally...</p>
        </div>
      )}

      {/* Chat session interface */}
      {file && !loading && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
                  <div style={{
                    width: '35px', height: '35px', borderRadius: '50%',
                    background: isBot ? 'rgba(0, 161, 155, 0.1)' : 'rgba(0,0,0,0.06)',
                    color: isBot ? 'var(--primary-color)' : 'var(--text-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {isBot ? <Bot size={16} /> : <User size={16} />}
                  </div>

                  <div style={{
                    background: isBot ? 'var(--glass-bg)' : 'var(--primary-gradient)',
                    color: isBot ? 'var(--text-color)' : 'white',
                    border: isBot ? '1px solid var(--glass-border)' : 'none',
                    padding: '12px 18px',
                    borderRadius: isBot ? '0px 18px 18px 18px' : '18px 0px 18px 18px',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    boxShadow: 'var(--glass-shadow)',
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
                  width: '35px', height: '35px', borderRadius: '50%',
                  background: 'rgba(0, 161, 155, 0.1)', color: 'var(--primary-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bot size={16} />
                </div>
                <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '15px 20px', borderRadius: '0px 18px 18px 18px' }}>
                  <ReusableLoading type="spinner" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask a question about "${file.name}"...`}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '12px 20px',
                color: 'var(--text-color)',
                outline: 'none',
                fontSize: '0.95rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{
                background: 'var(--primary-gradient)',
                border: 'none',
                borderRadius: '12px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                opacity: !input.trim() || isTyping ? 0.6 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
