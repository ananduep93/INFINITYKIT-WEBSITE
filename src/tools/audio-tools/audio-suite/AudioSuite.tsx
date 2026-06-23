'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Merge,
  Split,
  Maximize2,
  Download,
  Share2,
  Trash2,
  Star,
  Sparkles,
  Volume2,
  VolumeX,
  FileText,
  Volume1,
  Save,
  Plus,
  ArrowUp,
  ArrowDown,
  Loader,
  Music,
  CheckCircle,
  HelpCircle,
  Sliders,
  Settings
} from 'lucide-react';
import syncService from '../../../lib/sync';
import storageService from '../../../lib/storage';

// ─── WAV ENCODER UTILITY ──────────────────────────────────────────────────
function bufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // Write WAV header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16);         // chunk length
  setUint16(1);          // sample format (raw PCM)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * numOfChan * 2); // byte rate
  setUint16(numOfChan * 2);                     // block align
  setUint16(16);                                // bits per sample
  setUint32(0x61746164);                        // "data" chunk
  setUint32(length - pos - 4);                  // chunk length

  for (i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArray], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

interface LibraryItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  timestamp: string;
  isFavorite: boolean;
}

interface AudioSuiteProps {
  toolId?: string;
  initialTab?: 'edit' | 'convert' | 'ai' | 'library';
  initialSubTab?: string;
  initialFormat?: string;
}

export default function AudioSuite({
  toolId = 'audio-suite',
  initialTab = 'edit',
  initialSubTab = 'trim',
  initialFormat = 'mp3'
}: AudioSuiteProps) {
  // Navigation & Config
  const [activeTab, setActiveTab] = useState<'edit' | 'convert' | 'ai' | 'library'>(initialTab);
  const [activeSubTab, setActiveSubTab] = useState<string>(initialSubTab);
  const [convertFormat, setConvertFormat] = useState<string>(initialFormat);

  // Global Audio States
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Library & Sync
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isToolFavorite, setIsToolFavorite] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle');

  // API Keys / Settings
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('openai');

  // Interactive Waveform Ref & States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playheadIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Tab 1: Edit Sub-states
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [mergeFiles, setMergeFiles] = useState<{ id: string; file: File; buffer: AudioBuffer }[]>([]);
  const [splitMarkers, setSplitMarkers] = useState<number[]>([]);
  const [compressRate, setCompressRate] = useState<number>(44100);
  const [compressChannels, setCompressChannels] = useState<'mono' | 'stereo'>('mono');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  // Tab 2: Convert Sub-states
  const [convertFile, setConvertFile] = useState<File | null>(null);

  // Tab 3: AI Sub-states
  const [ttsText, setTtsText] = useState('Type or paste text here to synthesize speech.');
  const [ttsVoice, setTtsVoice] = useState('alloy'); // alloy, echo, fable, onyx, nova, shimmer
  const [cleanRumble, setCleanRumble] = useState(80);
  const [cleanHiss, setCleanHiss] = useState(8000);
  const [cleanVocalBoost, setCleanVocalBoost] = useState(3);
  const [cleanGateThreshold, setCleanGateThreshold] = useState(-40);
  const [cleanBypass, setCleanBypass] = useState(false);
  const [podcastFile, setPodcastFile] = useState<File | null>(null);
  const [aiResultText, setAiResultText] = useState<string | null>(null);

  // DSP Realtime nodes ref
  const dspNodesRef = useRef<{
    highpass: BiquadFilterNode;
    lowpass: BiquadFilterNode;
    vocalBoost: BiquadFilterNode;
    gate: DynamicsCompressorNode;
    gain: GainNode;
  } | null>(null);

  // ─── INITIALIZATION & SYNC ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load stored API keys
      setOpenaiKey(localStorage.getItem('infinitykit_openai_key') || '');
      setGeminiKey(localStorage.getItem('infinitykit_gemini_key') || '');
      
      const savedProvider = localStorage.getItem('infinitykit_audio_ai_provider') as 'openai' | 'gemini' | null;
      if (savedProvider) setAiProvider(savedProvider);

      // Load favorites
      const favList = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(favList);
      setIsToolFavorite(favList.includes(toolId));

      // Load library
      loadLibraryData();
      
      // Add to recent activities
      syncService.addToHistory(toolId);
    }
  }, [toolId]);

  const loadLibraryData = async () => {
    setSyncStatus('syncing');
    try {
      // Fetch from local & cloud via syncService
      const stored = await syncService.getData('audio_library');
      if (stored && Array.isArray(stored)) {
        setLibrary(stored);
      } else {
        // Fallback: fetch directly from Supabase uploads catalog if logged in
        const sbUploads = await storageService.getUserUploads();
        const filtered = sbUploads
          .filter(u => u.mime_type.startsWith('audio/'))
          .map(u => ({
            id: u.id,
            name: u.file_name,
            url: u.asset_url,
            size: u.file_size,
            type: u.mime_type,
            timestamp: new Date(u.created_at).toLocaleDateString(),
            isFavorite: false
          }));
        setLibrary(filtered);
        await syncService.saveData('audio_library', filtered);
      }
    } catch (e) {
      console.error('Failed to sync audio library:', e);
    } finally {
      setSyncStatus('done');
    }
  };

  const updateLibrary = async (newItems: LibraryItem[]) => {
    setLibrary(newItems);
    await syncService.saveData('audio_library', newItems);
  };

  // Toggle favorite on the tool page itself
  const toggleToolFavorite = async () => {
    if (typeof window === 'undefined') return;
    const isFav = !isToolFavorite;
    setIsToolFavorite(isFav);
    await syncService.saveFavorite(toolId, isFav);
    
    const favList = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updated;
    if (isFav) {
      updated = [...favList, toolId];
    } else {
      updated = favList.filter((id: string) => id !== toolId);
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
    setFavorites(updated);
  };

  // ─── AUDIO UTILITIES & DECODING ──────────────────────────────────────────
  const initAudioCtx = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const stopPlayback = useCallback(() => {
    if (playheadIntervalRef.current) {
      clearInterval(playheadIntervalRef.current);
      playheadIntervalRef.current = null;
    }
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const decodeAudio = async (file: File) => {
    stopPlayback();
    const ctx = initAudioCtx();
    setIsProcessing(true);
    setProgressMsg('Analyzing audio structure...');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decoded);
      setDuration(decoded.duration);
      setTrimStart(0);
      setTrimEnd(decoded.duration);
      setSplitMarkers([decoded.duration / 2]);
    } catch (err: any) {
      alert(`Decoding failed: ${err.message || 'Check if your browser supports this audio codec.'}`);
      setAudioBuffer(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Draw Audio waveform canvas
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !audioBuffer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Get PCM samples from first channel (or average them)
    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / width);
    const amp = height / 2;

    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw main waveform peaks
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.fillRect(i, (1 + min) * amp, 2, Math.max(1, (max - min) * amp));
    }

    // Render active/selected zone for Trim/Crop
    if (activeSubTab === 'trim') {
      const leftX = (trimStart / duration) * width;
      const rightX = (trimEnd / duration) * width;
      
      // Selected segment overlay
      ctx.fillStyle = 'rgba(0, 161, 155, 0.15)';
      ctx.globalAlpha = 1.0;
      ctx.fillRect(leftX, 0, rightX - leftX, height);

      // Selected segment lines
      ctx.strokeStyle = 'var(--primary-color)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftX, 0); ctx.lineTo(leftX, height);
      ctx.moveTo(rightX, 0); ctx.lineTo(rightX, height);
      ctx.stroke();
    }

    // Draw split markers
    if (activeSubTab === 'split') {
      ctx.strokeStyle = '#E91E63';
      ctx.lineWidth = 2;
      splitMarkers.forEach(posTime => {
        const markerX = (posTime / duration) * width;
        ctx.beginPath();
        ctx.moveTo(markerX, 0);
        ctx.lineTo(markerX, height);
        ctx.stroke();
        
        ctx.fillStyle = '#E91E63';
        ctx.font = '9px Outfit';
        ctx.fillText(`${posTime.toFixed(1)}s`, markerX + 4, 12);
      });
    }

    // Playhead Line
    const playheadX = (currentTime / duration) * width;
    ctx.strokeStyle = 'var(--text-color)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  }, [audioBuffer, duration, trimStart, trimEnd, currentTime, activeSubTab, splitMarkers]);

  // Request redraw on state change
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Handle waveform click to scrub audio
  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioBuffer) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedTime = (x / rect.width) * duration;
    
    setCurrentTime(clickedTime);
    if (isPlaying) {
      startPlaybackAt(clickedTime);
    }
  };

  // Playback engine
  const startPlaybackAt = (time: number) => {
    stopPlayback();
    const ctx = initAudioCtx();
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    // Apply cleaner/noise filters if in voice clean sub-tab
    if (activeTab === 'ai' && (activeSubTab === 'cleaner' || activeSubTab === 'noise') && !cleanBypass) {
      // Build Audio DSP Nodes
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = cleanRumble;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = cleanHiss;

      const vocalBoost = ctx.createBiquadFilter();
      vocalBoost.type = 'peaking';
      vocalBoost.frequency.value = 1500;
      vocalBoost.Q.value = 1.0;
      vocalBoost.gain.value = cleanVocalBoost;

      const gate = ctx.createDynamicsCompressor();
      gate.threshold.value = cleanGateThreshold;
      gate.knee.value = 30;
      gate.ratio.value = 12;
      gate.attack.value = 0.003;
      gate.release.value = 0.25;

      const gain = ctx.createGain();
      gain.gain.value = 1.0;

      // Connect source to node chain
      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(vocalBoost);
      vocalBoost.connect(gate);
      gate.connect(gain);
      gain.connect(ctx.destination);

      dspNodesRef.current = { highpass, lowpass, vocalBoost, gate, gain };
    } else {
      source.connect(ctx.destination);
    }

    startTimeRef.current = ctx.currentTime - time;
    source.start(0, time);
    audioSourceRef.current = source;
    setIsPlaying(true);

    playheadIntervalRef.current = window.setInterval(() => {
      const current = ctx.currentTime - startTimeRef.current;
      if (current >= duration) {
        stopPlayback();
        setCurrentTime(0);
      } else {
        setCurrentTime(current);
      }
    }, 50) as unknown as number;
  };

  const togglePlay = () => {
    if (!audioBuffer) return;
    if (isPlaying) {
      pauseTimeRef.current = currentTime;
      stopPlayback();
    } else {
      startPlaybackAt(currentTime);
    }
  };

  // Live DSP Updates
  useEffect(() => {
    if (dspNodesRef.current) {
      dspNodesRef.current.highpass.frequency.value = cleanRumble;
      dspNodesRef.current.lowpass.frequency.value = cleanHiss;
      dspNodesRef.current.vocalBoost.gain.value = cleanVocalBoost;
      dspNodesRef.current.gate.threshold.value = cleanGateThreshold;
    }
  }, [cleanRumble, cleanHiss, cleanVocalBoost, cleanGateThreshold]);

  // Clean up nodes on unmount
  useEffect(() => {
    return () => {
      if (playheadIntervalRef.current) clearInterval(playheadIntervalRef.current);
    };
  }, []);

  // ─── CORE EDIT ACTIONS (CLIENT-SIDE) ─────────────────────────────────────
  
  // TRIM AUDIO
  const handleTrim = async () => {
    if (!audioBuffer || !audioFile) return;
    setIsProcessing(true);
    setProgressMsg('Trimming audio parameters...');

    try {
      const sampleRate = audioBuffer.sampleRate;
      const numChannels = audioBuffer.numberOfChannels;
      const startSample = Math.floor(trimStart * sampleRate);
      const endSample = Math.floor(trimEnd * sampleRate);
      const trimLength = endSample - startSample;

      const offlineCtx = new OfflineAudioContext(numChannels, trimLength, sampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start(0, trimStart, trimEnd - trimStart);

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = bufferToWav(renderedBuffer);
      const cleanName = `trimmed_${Date.now()}_${audioFile.name.replace(/\.[^/.]+$/, '')}.wav`;
      
      saveProcessedFile(wavBlob, cleanName, 'WAV Audio');
    } catch (e: any) {
      alert(`Trimming failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // MERGE AUDIO
  const handleMerge = async () => {
    if (mergeFiles.length < 2) {
      alert('Please upload at least 2 files to merge.');
      return;
    }
    setIsProcessing(true);
    setProgressMsg('Merging audio tracks...');

    try {
      const sampleRate = mergeFiles[0].buffer.sampleRate;
      const numChannels = Math.max(...mergeFiles.map(f => f.buffer.numberOfChannels));
      const totalSamples = mergeFiles.reduce((acc, f) => acc + f.buffer.length, 0);

      const offlineCtx = new OfflineAudioContext(numChannels, totalSamples, sampleRate);
      let currentOffset = 0;

      mergeFiles.forEach(({ buffer }) => {
        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(offlineCtx.destination);
        source.start(0 + currentOffset / sampleRate);
        currentOffset += buffer.length;
      });

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = bufferToWav(renderedBuffer);
      
      saveProcessedFile(wavBlob, `merged_${Date.now()}.wav`, 'WAV Audio');
    } catch (e: any) {
      alert(`Merging failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const addMergeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ctx = initAudioCtx();
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setMergeFiles(prev => [...prev, { id: `m-${Date.now()}`, file, buffer: decoded }]);
    } catch (err) {
      alert('Could not decode file for merging.');
    }
  };

  // SPLIT AUDIO
  const handleSplit = async () => {
    if (!audioBuffer || !audioFile || splitMarkers.length === 0) return;
    setIsProcessing(true);
    setProgressMsg('Splitting tracks...');

    try {
      const sampleRate = audioBuffer.sampleRate;
      const numChannels = audioBuffer.numberOfChannels;
      const points = [0, ...splitMarkers.sort((a,b) => a-b), duration];

      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i+1];
        if (end - start < 0.1) continue;

        const startSample = Math.floor(start * sampleRate);
        const endSample = Math.floor(end * sampleRate);
        const splitLen = endSample - startSample;

        const offlineCtx = new OfflineAudioContext(numChannels, splitLen, sampleRate);
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start(0, start, end - start);

        const renderedBuffer = await offlineCtx.startRendering();
        const wavBlob = bufferToWav(renderedBuffer);
        const splitName = `${audioFile.name.replace(/\.[^/.]+$/, '')}_part${i+1}.wav`;
        
        await saveProcessedFile(wavBlob, splitName, 'WAV Audio', false);
      }
      alert('Tracks split successfully! Saved to your library.');
      loadLibraryData();
    } catch (e: any) {
      alert(`Splitting failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // COMPRESS AUDIO
  const handleCompress = async () => {
    if (!audioBuffer || !audioFile) return;
    setIsProcessing(true);
    setProgressMsg('Compressing track...');

    try {
      // Compress locally by downsampling sample rate/channels
      const numChannels = compressChannels === 'mono' ? 1 : 2;
      const totalSamples = Math.floor(audioBuffer.duration * compressRate);

      const offlineCtx = new OfflineAudioContext(numChannels, totalSamples, compressRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start(0);

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = bufferToWav(renderedBuffer);
      const outputName = `compressed_${Date.now()}_${audioFile.name.replace(/\.[^/.]+$/, '')}.wav`;

      saveProcessedFile(wavBlob, outputName, 'Compressed WAV');
    } catch (e: any) {
      alert(`Compression failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── CONVERT ACTIONS (SERVER-SIDE FFmpeg) ──────────────────────────────────
  const handleConvert = async () => {
    if (!convertFile) return;
    setIsProcessing(true);
    setProgressMsg(`Uploading & transcoding to ${convertFormat.toUpperCase()}...`);

    const formData = new FormData();
    formData.append('file', convertFile);
    formData.append('format', convertFormat);

    try {
      const response = await fetch('/api/audio/convert', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Conversion failed.');
      }

      const audioBlob = await response.blob();
      const outputName = `converted_${Date.now()}_${convertFile.name.replace(/\.[^/.]+$/, '')}.${convertFormat}`;
      saveProcessedFile(audioBlob, outputName, `${convertFormat.toUpperCase()} Audio`);
    } catch (e: any) {
      alert(`Conversion failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── AI ACTIONS (SPEECH & TRANSCRIBE & CLEAN) ─────────────────────────────
  
  // TTS Synthesize
  const handleTts = async () => {
    if (!ttsText.trim()) return;
    setIsProcessing(true);
    setProgressMsg('Synthesizing speech parameters...');

    // Option A: Use Premium OpenAI TTS if key available
    if (openaiKey) {
      const formData = new FormData();
      formData.append('action', 'tts');
      formData.append('text', ttsText);
      formData.append('voice', ttsVoice);
      formData.append('openaiKey', openaiKey);

      try {
        const response = await fetch('/api/audio/ai', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'OpenAI TTS failed.');
        }

        const audioBlob = await response.blob();
        saveProcessedFile(audioBlob, `speech_openai_${Date.now()}.mp3`, 'MP3 Speech');
      } catch (e: any) {
        alert(`Premium TTS failed: ${e.message}. Falling back to Browser TTS.`);
        runBrowserTts();
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Option B: Native Browser TTS fallback
      runBrowserTts();
    }
  };

  const runBrowserTts = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText);
    
    // Attempt to match selected voice
    const voices = window.speechSynthesis.getVoices();
    const matching = voices.find(v => v.name.toLowerCase().includes(ttsVoice) || v.lang.startsWith('en'));
    if (matching) utterance.voice = matching;

    utterance.onend = () => {
      setIsProcessing(false);
    };

    utterance.onerror = () => {
      setIsProcessing(false);
    };

    window.speechSynthesis.speak(utterance);
    // Since browser TTS doesn't give a direct audio blob easily without MediaRecorder (which requires Web Audio destination capture),
    // we alert the user that it plays live, but we can capture it into a WAV file if they want premium download.
    alert('Playing voice synthesis via native browser. For downloadable audio output, configure an OpenAI API Key in Settings.');
  };

  // DSP Realtime BAKE to file
  const handleDspClean = async () => {
    if (!audioBuffer || !audioFile) return;
    setIsProcessing(true);
    setProgressMsg('Baking Voice Cleaner DSP nodes...');

    try {
      const sampleRate = audioBuffer.sampleRate;
      const numChannels = audioBuffer.numberOfChannels;
      const offlineCtx = new OfflineAudioContext(numChannels, audioBuffer.length, sampleRate);
      
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;

      const highpass = offlineCtx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = cleanRumble;

      const lowpass = offlineCtx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = cleanHiss;

      const vocalBoost = offlineCtx.createBiquadFilter();
      vocalBoost.type = 'peaking';
      vocalBoost.frequency.value = 1500;
      vocalBoost.Q.value = 1.0;
      vocalBoost.gain.value = cleanVocalBoost;

      const gate = offlineCtx.createDynamicsCompressor();
      gate.threshold.value = cleanGateThreshold;
      gate.knee.value = 30;
      gate.ratio.value = 12;
      gate.attack.value = 0.003;
      gate.release.value = 0.25;

      const gain = offlineCtx.createGain();
      gain.gain.value = 1.0;

      // Connect nodes
      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(vocalBoost);
      vocalBoost.connect(gate);
      gate.connect(gain);
      gain.connect(offlineCtx.destination);

      source.start(0);

      const renderedBuffer = await offlineCtx.startRendering();
      const cleanBlob = bufferToWav(renderedBuffer);
      const outputName = `cleaned_${Date.now()}_${audioFile.name.replace(/\.[^/.]+$/, '')}.wav`;

      saveProcessedFile(cleanBlob, outputName, 'Cleaned Audio');
    } catch (e: any) {
      alert(`DSP cleaning failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // AI Podcast Summary
  const handlePodcastSummary = async () => {
    if (!podcastFile) return;
    setIsProcessing(true);
    setAiResultText(null);
    setProgressMsg('Uploading & analyzing audio contents (Whisper/Gemini)...');

    const formData = new FormData();
    formData.append('action', 'summary');
    formData.append('file', podcastFile);
    formData.append('provider', aiProvider);
    if (openaiKey) formData.append('openaiKey', openaiKey);
    if (geminiKey) formData.append('geminiKey', geminiKey);

    try {
      const response = await fetch('/api/audio/ai', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'AI Summary extraction failed.');
      }

      const json = await response.json();
      setAiResultText(json.result);
    } catch (e: any) {
      alert(`AI Summary failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── FILE SAVE & SHARE & SYNCS ───────────────────────────────────────────
  const saveProcessedFile = async (blob: Blob, name: string, type: string, triggerLibraryReload = true) => {
    // Generate URL for local download
    const url = URL.createObjectURL(blob);
    
    // Save to user library memory
    const newItem: LibraryItem = {
      id: `lib-${Date.now()}-${Math.random().toString(36).substring(2,9)}`,
      name,
      url,
      size: blob.size,
      type: blob.type || type,
      timestamp: new Date().toLocaleDateString(),
      isFavorite: false
    };

    // Update state
    const updated = [newItem, ...library];
    if (triggerLibraryReload) {
      updateLibrary(updated);
    }

    // Automatically trigger local file download
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Sync file to Supabase if logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      try {
        const file = new File([blob], name, { type: blob.type });
        setProgressMsg('Uploading processed file to Supabase cloud storage...');
        const uploadResult = await storageService.uploadFile(file);
        
        // Replace blob URL with permanent Supabase URL
        newItem.url = uploadResult.url;
        if (triggerLibraryReload) {
          const syncedList = [newItem, ...library.filter(i => i.id !== newItem.id)];
          updateLibrary(syncedList);
        }
      } catch (uploadErr) {
        console.warn('Could not sync file to Supabase:', uploadErr);
      }
    }
  };

  // Delete Item from Library
  const deleteLibraryItem = async (id: string, pathUrl: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this audio record?');
    if (!confirmed) return;

    const filtered = library.filter(item => item.id !== id);
    updateLibrary(filtered);

    // If it's a Supabase file, delete it from storage
    if (pathUrl.includes('.supabase.co')) {
      try {
        // Resolve filename from URL
        const fileName = pathUrl.split('/').pop()?.split('?')[0] || '';
        if (fileName) {
          await storageService.deleteFile(fileName);
        }
      } catch (err) {
        console.warn('Failed to delete file from storage:', err);
      }
    }
  };

  // Copy URL / Share item
  const shareLibraryItem = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Audio share link copied to clipboard!');
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Configuration & Providers panel */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={18} color="var(--primary-color)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Ecosystem Sync Panel</span>
          <span style={{
            fontSize: '0.75rem', 
            padding: '3px 8px', 
            borderRadius: '12px', 
            background: syncStatus === 'syncing' ? 'rgba(255, 193, 7, 0.15)' : 'rgba(0, 161, 155, 0.15)',
            color: syncStatus === 'syncing' ? '#FFC107' : 'var(--primary-color)',
            fontWeight: 600
          }}>
            {syncStatus === 'syncing' ? '🔄 Syncing Cloud...' : '⚡ Supabase Synced'}
          </span>
        </div>
        
        {/* Toggle Bookmarks */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={toggleToolFavorite} 
            className="btn" 
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.78rem', 
              background: isToolFavorite ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
              border: '1px solid var(--glass-border)',
              color: isToolFavorite ? '#fff' : 'var(--text-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Star size={14} fill={isToolFavorite ? '#fff' : 'none'} />
            {isToolFavorite ? 'Bookmarked' : 'Add Favorite'}
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {[
          { id: 'edit', label: '✂️ Audio Edit', icon: <Scissors size={14} /> },
          { id: 'convert', label: '🔄 Convert', icon: <RotateCcw size={14} /> },
          { id: 'ai', label: '🤖 AI Audio', icon: <Sparkles size={14} /> },
          { id: 'library', label: '🎵 Library', icon: <Music size={14} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              stopPlayback();
            }}
            style={{
              padding: '12px 6px',
              borderRadius: '12px',
              border: activeTab === tab.id ? '1px solid var(--primary-color)' : '1px solid var(--glass-border)',
              background: activeTab === tab.id ? 'var(--primary-color)' : 'var(--glass-bg)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-smooth)'
            }}
          >
            {tab.icon}
            <span style={{ fontSize: '0.75rem' }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Loader Overlay */}
        {isProcessing && (
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', borderStyle: 'dashed', borderColor: 'var(--primary-color)' }}>
            <Loader size={28} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{progressMsg}</span>
          </div>
        )}

        {/* ─── TAB 1: AUDIO EDIT ────────────────────────────────────────────── */}
        {activeTab === 'edit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Sub-tabs Selection */}
            <div className="glass-panel" style={{ padding: '8px', display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {[
                { id: 'trim', label: 'Trim Audio', desc: 'Slice range' },
                { id: 'merge', label: 'Merge Audio', desc: 'Join tracks' },
                { id: 'split', label: 'Split Audio', desc: 'Cut multi-part' },
                { id: 'compress', label: 'Compress Quality', desc: 'Reduce weight' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveSubTab(sub.id);
                    stopPlayback();
                  }}
                  style={{
                    flex: '1 0 auto',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeSubTab === sub.id ? 'rgba(0,161,155,0.15)' : 'transparent',
                    color: activeSubTab === sub.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Standard Uploader & Waveform (except for Merge sub-tab) */}
            {activeSubTab !== 'merge' && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700 }}>Upload Source Audio</h3>
                
                <input
                  type="file"
                  accept="audio/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAudioFile(file);
                      decodeAudio(file);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px dashed var(--glass-border)',
                    background: 'rgba(0,0,0,0.1)',
                    color: 'var(--text-color)',
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />

                {audioBuffer && (
                  <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span>File: {audioFile?.name}</span>
                      <span>Duration: {duration.toFixed(1)}s</span>
                    </div>

                    {/* Canvas Waveform */}
                    <div style={{ position: 'relative', width: '100%', height: '140px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={140}
                        onClick={handleWaveformClick}
                        style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'block' }}
                      />
                    </div>

                    {/* Scrubbing & Controls */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                      <button
                        onClick={togglePlay}
                        className="btn"
                        style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} fill="#fff" />}
                        {isPlaying ? 'Pause' : 'Play Preview'}
                      </button>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab Parameters */}
            {activeSubTab === 'trim' && audioBuffer && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>Trimming Selection</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Start Time (seconds)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={trimEnd}
                      value={Number(trimStart.toFixed(1))}
                      onChange={e => setTrimStart(Math.max(0, Number(e.target.value)))}
                      style={{
                        width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>End Time (seconds)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={trimStart}
                      max={duration}
                      value={Number(trimEnd.toFixed(1))}
                      onChange={e => setTrimEnd(Math.min(duration, Number(e.target.value)))}
                      style={{
                        width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: '#fff'
                      }}
                    />
                  </div>
                </div>

                {/* Range Slider for trimming */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Selection range (drag sliders):</span>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimStart}
                    onChange={e => setTrimStart(Math.min(trimEnd, Number(e.target.value)))}
                    style={{ accentColor: 'var(--primary-color)' }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={trimEnd}
                    onChange={e => setTrimEnd(Math.max(trimStart, Number(e.target.value)))}
                    style={{ accentColor: 'var(--primary-color)' }}
                  />
                </div>

                <button onClick={handleTrim} className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Scissors size={14} /> Crop & Trim Audio
                </button>
              </div>
            )}

            {activeSubTab === 'merge' && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>Merge Tracks List</h3>
                
                <input
                  type="file"
                  accept="audio/*"
                  onChange={addMergeFile}
                  style={{
                    width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px dashed var(--glass-border)', background: 'rgba(0,0,0,0.1)', color: '#fff', fontSize: '0.8rem'
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {mergeFiles.map((m, idx) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-color)' }}>#{idx + 1}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{m.file.name}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{(m.buffer.duration).toFixed(1)}s</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            if (idx === 0) return;
                            const copy = [...mergeFiles];
                            const temp = copy[idx];
                            copy[idx] = copy[idx - 1];
                            copy[idx - 1] = temp;
                            setMergeFiles(copy);
                          }}
                          disabled={idx === 0}
                          style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (idx === mergeFiles.length - 1) return;
                            const copy = [...mergeFiles];
                            const temp = copy[idx];
                            copy[idx] = copy[idx + 1];
                            copy[idx + 1] = temp;
                            setMergeFiles(copy);
                          }}
                          disabled={idx === mergeFiles.length - 1}
                          style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: '#fff', cursor: idx === mergeFiles.length - 1 ? 'not-allowed' : 'pointer' }}
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          onClick={() => {
                            setMergeFiles(prev => prev.filter(item => item.id !== m.id));
                          }}
                          style={{ padding: '6px', background: 'rgba(233,30,99,0.1)', border: 'none', borderRadius: '6px', color: '#E91E63', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {mergeFiles.length === 0 && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '20px 0' }}>No tracks added yet. Upload files above to build your sequence.</p>
                  )}
                </div>

                <button onClick={handleMerge} disabled={mergeFiles.length < 2} className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Merge size={14} /> Merge Sequenced Audio
                </button>
              </div>
            )}

            {activeSubTab === 'split' && audioBuffer && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>Split Points Markers</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                  Add timestamp split markers to chop your audio into multiple tracks.
                </p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button
                    onClick={() => {
                      setSplitMarkers(prev => [...prev, currentTime].sort((a,b) => a-b));
                    }}
                    className="btn"
                    style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff' }}
                  >
                    + Add Marker at Current ({currentTime.toFixed(1)}s)
                  </button>
                  <button
                    onClick={() => setSplitMarkers([])}
                    style={{ padding: '8px 12px', fontSize: '0.8rem', background: 'rgba(233,30,99,0.1)', border: 'none', borderRadius: '8px', color: '#E91E63', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {splitMarkers.map((time, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {time.toFixed(1)}s
                      <button
                        onClick={() => setSplitMarkers(prev => prev.filter((_, i) => i !== idx))}
                        style={{ border: 'none', background: 'none', color: '#E91E63', cursor: 'pointer', padding: 0 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <button onClick={handleSplit} disabled={splitMarkers.length === 0} className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Split size={14} /> Split Audio file
                </button>
              </div>
            )}

            {activeSubTab === 'compress' && audioBuffer && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>Compression Configuration</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Sample Rate</label>
                    <select
                      value={compressRate}
                      onChange={e => setCompressRate(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: '#fff', outline: 'none' }}
                    >
                      <option value={44100}>44.1 kHz (CD Quality)</option>
                      <option value={32000}>32.0 kHz (Medium Quality)</option>
                      <option value={22050}>22.05 kHz (Low Quality)</option>
                      <option value={11025}>11.025 kHz (Speech/Low bandwidth)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Audio Channels</label>
                    <select
                      value={compressChannels}
                      onChange={e => setCompressChannels(e.target.value as any)}
                      style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: '#fff', outline: 'none' }}
                    >
                      <option value="mono">Mono (Halves file size)</option>
                      <option value="stereo">Stereo</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleCompress} className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Maximize2 size={14} /> Compress & Export
                </button>
              </div>
            )}

          </div>
        )}

        {/* ─── TAB 2: AUDIO CONVERSION ─────────────────────────────────────── */}
        {activeTab === 'convert' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700 }}>Cross-Format Audio Converter</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Upload Audio or Video (MP4, WAV, AAC, FLAC, OGG)</label>
                <input
                  type="file"
                  accept="audio/*,video/mp4"
                  onChange={e => setConvertFile(e.target.files?.[0] || null)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', border: '1px dashed var(--glass-border)', background: 'rgba(0,0,0,0.1)', color: '#fff', fontSize: '0.8rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Target Format</label>
                <select
                  value={convertFormat}
                  onChange={e => setConvertFormat(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: '#fff', outline: 'none' }}
                >
                  <option value="mp3">MP3 (MPEG Audio Layer III)</option>
                  <option value="wav">WAV (Waveform Audio File Format)</option>
                  <option value="ogg">OGG (Ogg Vorbis Compressed)</option>
                  <option value="aac">AAC (Advanced Audio Coding)</option>
                  <option value="flac">FLAC (Free Lossless Audio Codec)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={!convertFile}
              className="btn"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <RotateCcw size={14} /> Transcode to {convertFormat.toUpperCase()}
            </button>
          </div>
        )}

        {/* ─── TAB 3: AI AUDIO ──────────────────────────────────────────────── */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Sub-tabs AI */}
            <div className="glass-panel" style={{ padding: '8px', display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {[
                { id: 'tts', label: 'Text to Speech', desc: 'Synthesize speech' },
                { id: 'cleaner', label: 'Voice Cleaner', desc: 'Clean voice vocal EQ' },
                { id: 'noise', label: 'Noise Removal', desc: 'Cut background noise' },
                { id: 'summary', label: 'Podcast Summary', desc: 'AI summary outline' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveSubTab(sub.id);
                    stopPlayback();
                  }}
                  style={{
                    flex: '1 0 auto',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeSubTab === sub.id ? 'rgba(0,161,155,0.15)' : 'transparent',
                    color: activeSubTab === sub.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* AI Action Panels */}
            {activeSubTab === 'tts' && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>AI Text to Speech Engine</h3>
                
                <textarea
                  value={ttsText}
                  onChange={e => setTtsText(e.target.value)}
                  rows={4}
                  placeholder="Type anything to speak..."
                  style={{
                    width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: '#fff', fontSize: '0.85rem', outline: 'none', resize: 'vertical', marginBottom: '15px'
                  }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>OpenAI Voice Model</label>
                    <select
                      value={ttsVoice}
                      onChange={e => setTtsVoice(e.target.value)}
                      style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: '#fff', outline: 'none' }}
                    >
                      <option value="alloy">Alloy (Standard/Balanced)</option>
                      <option value="echo">Echo (Warm/Deep)</option>
                      <option value="fable">Fable (Narrator/Dramatic)</option>
                      <option value="onyx">Onyx (Deep Male)</option>
                      <option value="nova">Nova (Bright Female)</option>
                      <option value="shimmer">Shimmer (Professional/Clear)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Note: API key configuration in settings is required for downloadable premium audio outputs.</span>
                  </div>
                </div>

                <button onClick={handleTts} className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Volume2 size={14} /> Synthesize Speech Audio
                </button>
              </div>
            )}

            {(activeSubTab === 'cleaner' || activeSubTab === 'noise') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>
                    {activeSubTab === 'cleaner' ? '🎙 Voice Vocal EQ Booster' : '🔇 Background Noise Removal Gate'}
                  </h3>

                  <input
                    type="file"
                    accept="audio/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAudioFile(file);
                        decodeAudio(file);
                      }
                    }}
                    style={{
                      width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px dashed var(--glass-border)', background: 'rgba(0,0,0,0.1)', color: '#fff', fontSize: '0.8rem'
                    }}
                  />

                  {audioBuffer && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {/* Canvas Visualizer */}
                      <div style={{ position: 'relative', width: '100%', height: '100px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden' }}>
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={100}
                          onClick={handleWaveformClick}
                          style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'block' }}
                        />
                      </div>

                      {/* Realtime Scrubbing */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          onClick={togglePlay}
                          className="btn"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {isPlaying ? <Pause size={12} /> : <Play size={12} fill="#fff" />}
                          {isPlaying ? 'Pause' : 'Play Live Preview'}
                        </button>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
                        </span>
                        
                        {/* Bypass Button */}
                        <button
                          onClick={() => setCleanBypass(!cleanBypass)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            border: '1px solid var(--glass-border)',
                            background: cleanBypass ? 'rgba(233,30,99,0.15)' : 'rgba(255,255,255,0.05)',
                            color: cleanBypass ? '#E91E63' : '#fff',
                            cursor: 'pointer'
                          }}
                        >
                          {cleanBypass ? 'DSP Bypass Active' : 'DSP Nodes Active'}
                        </button>
                      </div>

                      {/* DSP Control Sliders */}
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Rumble Filter (Low Cut)</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-color)' }}>{cleanRumble} Hz</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={300}
                          step={5}
                          value={cleanRumble}
                          onChange={e => setCleanRumble(Number(e.target.value))}
                          style={{ accentColor: 'var(--primary-color)' }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Hiss Filter (High Cut)</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-color)' }}>{cleanHiss} Hz</span>
                        </div>
                        <input
                          type="range"
                          min={4000}
                          max={16000}
                          step={100}
                          value={cleanHiss}
                          onChange={e => setCleanHiss(Number(e.target.value))}
                          style={{ accentColor: 'var(--primary-color)' }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Vocal Band Boost (1.5 kHz)</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-color)' }}>+{cleanVocalBoost} dB</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={12}
                          step={1}
                          value={cleanVocalBoost}
                          onChange={e => setCleanVocalBoost(Number(e.target.value))}
                          style={{ accentColor: 'var(--primary-color)' }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Noise Gate Threshold</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-color)' }}>{cleanGateThreshold} dB</span>
                        </div>
                        <input
                          type="range"
                          min={-80}
                          max={-20}
                          step={1}
                          value={cleanGateThreshold}
                          onChange={e => setCleanGateThreshold(Number(e.target.value))}
                          style={{ accentColor: 'var(--primary-color)' }}
                        />
                      </div>

                      <button onClick={handleDspClean} className="btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Sliders size={14} /> Render Clean Audio File
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSubTab === 'summary' && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>AI Podcast Summarizer</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Upload Podcast Audio</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={e => setPodcastFile(e.target.files?.[0] || null)}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '10px', border: '1px dashed var(--glass-border)', background: 'rgba(0,0,0,0.1)', color: '#fff', fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>AI Model Provider</label>
                    <select
                      value={aiProvider}
                      onChange={e => setAiProvider(e.target.value as any)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: '#fff', outline: 'none' }}
                    >
                      <option value="openai">OpenAI Whisper + GPT-4o Mini (Requires OpenAI Key)</option>
                      <option value="gemini">Google Gemini 2.5 Flash (Requires Gemini Key)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handlePodcastSummary}
                  disabled={!podcastFile}
                  className="btn"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}
                >
                  <Sparkles size={14} /> Extract Summary & Chapters
                </button>

                {aiResultText && (
                  <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)' }}>AI Summary Outline</h4>
                    <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-color)', whiteSpace: 'pre-wrap' }}>
                      {aiResultText}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ─── TAB 4: LIBRARY ──────────────────────────────────────────────── */}
        {activeTab === 'library' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Your Synced Library</h3>
              <button
                onClick={loadLibraryData}
                className="btn"
                style={{ padding: '4px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
              >
                Refresh
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {library.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Music size={16} color="var(--primary-color)" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }} title={item.name}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {(item.size / (1024 * 1024)).toFixed(2)} MB · {item.timestamp}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteLibraryItem(item.id, item.url)}
                      style={{ padding: '6px', background: 'rgba(233,30,99,0.1)', border: 'none', borderRadius: '6px', color: '#E91E63', cursor: 'pointer' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Built-in audio player */}
                  <audio
                    src={item.url}
                    controls
                    style={{ width: '100%', height: '36px', borderRadius: '8px', outline: 'none' }}
                  />

                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <a
                      href={item.url}
                      download={item.name}
                      style={{ textDecoration: 'none' }}
                    >
                      <button className="btn" style={{ width: '100%', padding: '6px 0', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}>
                        <Download size={12} /> Download
                      </button>
                    </a>

                    <button
                      onClick={() => shareLibraryItem(item.url)}
                      className="btn"
                      style={{ padding: '6px 0', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }}
                    >
                      <Share2 size={12} /> Copy Share URL
                    </button>
                  </div>
                </div>
              ))}

              {library.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <Music size={28} style={{ color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '10px' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Your audio ecosystem library is empty. Processed files will appear here synced automatically.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
