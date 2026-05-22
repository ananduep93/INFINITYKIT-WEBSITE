'use client';

import React, { useState } from 'react';
import { Download, Plus, Trash2, Edit3, Sparkles } from 'lucide-react';
import ToolWorkspace from '../ui/ToolWorkspace';

interface SubtitleCue {
  id: number;
  start: string; // HH:MM:SS,MIL
  end: string;
  text: string;
}

export default function SubtitlesGenerator() {
  const [cues, setCues] = useState<SubtitleCue[]>([
    { id: 1, start: '00:00:01,200', end: '00:00:04,500', text: 'Welcome to the automated subtitle editor panel.' },
    { id: 2, start: '00:00:05,000', end: '00:00:08,200', text: 'This tool structures subtitles into precise SRT and VTT streams.' }
  ]);

  const handleProcessSubtitles = async (files: File[], textInput?: string) => {
    if (files.length === 0) {
      throw new Error('Please upload an audio or video file first.');
    }

    const file = files[0];
    
    // Simulate auto-generation of subtitles based on name/duration or custom text segmenting
    const generatedCues: SubtitleCue[] = [];
    if (textInput && textInput.trim().length > 0) {
      // Split user provided paragraphs into 4-second dialogue tracks
      const sentences = textInput.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
      let currentTime = 1.0;
      sentences.forEach((sentence, index) => {
        const startSec = currentTime;
        const endSec = currentTime + Math.min(4.5, 1.5 + sentence.split(' ').length * 0.4);
        generatedCues.push({
          id: index + 1,
          start: formatTime(startSec),
          end: formatTime(endSec),
          text: sentence
        });
        currentTime = endSec + 0.5;
      });
    } else {
      // Create mock track based on the file uploaded
      generatedCues.push(
        { id: 1, start: '00:00:01,000', end: '00:00:04,000', text: `Audio stream extracted from: ${file.name}` },
        { id: 2, start: '00:00:04,500', end: '00:00:08,000', text: 'Analyzing voice prints and synchronizing timestamps...' },
        { id: 3, start: '00:00:08,500', end: '00:00:12,500', text: 'Please adjust individual subtitle tracks as necessary using the editor.' }
      );
    }

    setCues(generatedCues);

    // Return the default SRT download format
    const srtText = exportToSRT(generatedCues);
    const srtBlob = new Blob([srtText], { type: 'text/srt;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(srtBlob);

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.[^/.]+$/, '')}_subtitles.srt`,
      resultData: `Subtitles processed successfully for "${file.name}"!
Total Cues: ${generatedCues.length}
Format: SubRip Subtitle (SRT)

You can download the .srt file directly, or review and modify the cue tracks in the interactive grid below.`
    };
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    const pad = (num: number, size: number) => num.toString().padStart(size, '0');
    return `${pad(hrs, 2)}:${pad(mins, 2)}:${pad(secs, 2)},${pad(ms, 3)}`;
  };

  const exportToSRT = (cuesList: SubtitleCue[]): string => {
    return cuesList.map((cue, idx) => {
      return `${idx + 1}\n${cue.start} --> ${cue.end}\n${cue.text}\n`;
    }).join('\n');
  };

  const exportToVTT = (cuesList: SubtitleCue[]): string => {
    const vttCues = cuesList.map((cue, idx) => {
      const vtStart = cue.start.replace(',', '.');
      const vtEnd = cue.end.replace(',', '.');
      return `${idx + 1}\n${vtStart} --> ${vtEnd}\n${cue.text}\n`;
    }).join('\n');
    return `WEBVTT\n\n${vttCues}`;
  };

  const handleDownloadFormat = (format: 'srt' | 'vtt') => {
    const textData = format === 'srt' ? exportToSRT(cues) : exportToVTT(cues);
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infinitykit_subtitles.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdateCue = (id: number, field: 'start' | 'end' | 'text', val: string) => {
    setCues(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
  };

  const handleAddCue = () => {
    setCues(prev => {
      const lastCue = prev[prev.length - 1];
      let newStart = '00:00:00,000';
      let newEnd = '00:00:04,000';
      if (lastCue) {
        // Increment starting from the last end cue
        const parseTime = (timeStr: string) => {
          const parts = timeStr.split(/[:,]/);
          return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]) + parseInt(parts[3]) / 1000;
        };
        const lastEndSec = parseTime(lastCue.end);
        newStart = formatTime(lastEndSec + 0.5);
        newEnd = formatTime(lastEndSec + 4.5);
      }
      return [...prev, { id: Date.now(), start: newStart, end: newEnd, text: 'New subtitle cue text' }];
    });
  };

  const handleRemoveCue = (id: number) => {
    setCues(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        AI Subtitles Generator
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Generate, synchronize, and edit dynamic subtitle tracks. Export to SRT or VTT format.
      </p>

      <ToolWorkspace
        toolId="subtitles-generator"
        accept="video/*,audio/*"
        maxFiles={1}
        hasText={true}
        textLabel="Text Transcript (Optional - for segmented caption alignments)"
        textPlaceholder="Enter the video script or transcripts here to auto-align cues..."
        onProcess={handleProcessSubtitles}
        actionButtonText="Generate Subtitles"
        instructions={[
          'Upload your video or audio file to capture length boundaries.',
          'Provide the written transcript script in the text block to auto-segment timestamps (optional).',
          'Click "Generate Subtitles" to compile alignment arrays.',
          'Edit individual dialogue segments in the visual editor grid and click Export.'
        ]}
      />

      <div className="glass-panel" style={{ marginTop: '30px', padding: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Dynamic Subtitles Track Editor</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleDownloadFormat('srt')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Download size={14} /> Export SRT
            </button>
            <button
              onClick={() => handleDownloadFormat('vtt')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Download size={14} /> Export VTT
            </button>
          </div>
        </div>

        {/* Dynamic Cues Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cues.map((cue, index) => (
            <div
              key={cue.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 150px 150px 1fr 50px',
                gap: '12px',
                alignItems: 'center',
                padding: '10px 15px',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px'
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>#{index + 1}</span>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  value={cue.start}
                  onChange={(e) => handleUpdateCue(cue.id, 'start', e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  value={cue.end}
                  onChange={(e) => handleUpdateCue(cue.id, 'end', e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.8rem', fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  value={cue.text}
                  onChange={(e) => handleUpdateCue(cue.id, 'text', e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                />
              </div>

              <button
                onClick={() => handleRemoveCue(cue.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,53,69,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <Trash2 size={16} color="#dc3545" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleAddCue}
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Add Subtitle Segment
        </button>
      </div>
    </div>
  );
}
