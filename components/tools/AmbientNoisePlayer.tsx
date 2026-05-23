'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Clock, CloudRain, Waves, Trees, Radio, Timer, Sparkles } from 'lucide-react';

interface Sound {
  id: 'rain' | 'white' | 'ocean' | 'forest';
  name: string;
  icon: React.ReactNode;
  color: string;
  volume: number; // 0 to 1
  isPlaying: boolean;
}

export default function AmbientNoisePlayer() {
  const [sounds, setSounds] = useState<Sound[]>([
    { id: 'rain', name: 'Cozy Rain', icon: <CloudRain size={20} />, color: '#38bdf8', volume: 0.5, isPlaying: false },
    { id: 'white', name: 'White Noise', icon: <Radio size={20} />, color: '#cbd5e1', volume: 0.3, isPlaying: false },
    { id: 'ocean', name: 'Ocean Waves', icon: <Waves size={20} />, color: '#0ea5e9', volume: 0.5, isPlaying: false },
    { id: 'forest', name: 'Mystic Forest', icon: <Trees size={20} />, color: '#22c55e', volume: 0.4, isPlaying: false },
  ]);

  const [masterVolume, setMasterVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);

  // Web Audio Context & Gain Node Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sound Engine Refs
  const rainSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);

  const whiteSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const whiteGainRef = useRef<GainNode | null>(null);

  const oceanSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const oceanGainRef = useRef<GainNode | null>(null);
  const oceanLfoRef = useRef<OscillatorNode | null>(null);

  const forestRustleSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const forestRustleGainRef = useRef<GainNode | null>(null);
  const forestMainGainRef = useRef<GainNode | null>(null);
  const forestIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Common noise buffer generator
  const createNoiseBuffer = (ctx: AudioContext, type: 'white' | 'brown') => {
    const bufferSize = ctx.sampleRate * 2.0; // 2 seconds loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2.0 - 1.0;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2.0 - 1.0;
        // Integrated white noise = brown noise
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }
    }
    return buffer;
  };

  // Lazy Initialization of Audio Context
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : masterVolume, audioCtxRef.current.currentTime);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Sync Master Volume
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        isMuted ? 0 : masterVolume,
        audioCtxRef.current.currentTime
      );
    }
  }, [masterVolume, isMuted]);

  // Sync Sleep Timer
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (timerMinutes !== null) {
      const secs = timerMinutes * 60;
      setTimerSecondsLeft(secs);

      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            fadeAndStopAll();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimerSecondsLeft(null);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerMinutes]);

  const fadeAndStopAll = () => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    // Smoothly ramp master down to 0 over 3 seconds
    masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
    masterGainRef.current.gain.exponentialRampToValueAtTime(0.001, now + 3);

    setTimeout(() => {
      stopAllSounds();
      // Reset state variables
      setSounds(prev => prev.map(s => ({ ...s, isPlaying: false })));
      setTimerMinutes(null);
      // Restore master volume level in gain node
      if (masterGainRef.current) {
        masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : masterVolume, ctx.currentTime);
      }
    }, 3200);
  };

  const stopAllSounds = () => {
    stopRain();
    stopWhiteNoise();
    stopOcean();
    stopForest();
  };

  // 🌧️ Cozy Rain Engine
  const startRain = (ctx: AudioContext, vol: number) => {
    stopRain();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.connect(masterGainRef.current!);
    rainGainRef.current = gain;

    // Filtered White Noise background
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1000, ctx.currentTime);
    rainFilter.connect(gain);

    const buffer = createNoiseBuffer(ctx, 'white');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(rainFilter);
    source.start(0);
    rainSourceRef.current = source;
  };

  const stopRain = () => {
    if (rainSourceRef.current) {
      try { rainSourceRef.current.stop(); } catch (e) {}
      rainSourceRef.current = null;
    }
    rainGainRef.current = null;
  };

  // 💨 Focus White Noise Engine
  const startWhiteNoise = (ctx: AudioContext, vol: number) => {
    stopWhiteNoise();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.connect(masterGainRef.current!);
    whiteGainRef.current = gain;

    const buffer = createNoiseBuffer(ctx, 'white');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Gentle bandpass filter to make it less abrasive
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1500, ctx.currentTime);

    source.connect(noiseFilter);
    noiseFilter.connect(gain);
    source.start(0);
    whiteSourceRef.current = source;
  };

  const stopWhiteNoise = () => {
    if (whiteSourceRef.current) {
      try { whiteSourceRef.current.stop(); } catch (e) {}
      whiteSourceRef.current = null;
    }
    whiteGainRef.current = null;
  };

  // 🌊 Ocean Waves Engine
  const startOcean = (ctx: AudioContext, vol: number) => {
    stopOcean();

    const oceanGain = ctx.createGain();
    oceanGain.gain.setValueAtTime(vol * 0.5, ctx.currentTime); // Base scale
    oceanGain.connect(masterGainRef.current!);
    oceanGainRef.current = oceanGain;

    // Filter brown noise deeply
    const oceanFilter = ctx.createBiquadFilter();
    oceanFilter.type = 'lowpass';
    oceanFilter.frequency.setValueAtTime(350, ctx.currentTime);
    oceanFilter.connect(oceanGain);

    const buffer = createNoiseBuffer(ctx, 'brown');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(oceanFilter);
    source.start(0);
    oceanSourceRef.current = source;

    // Rhythm: LFO sweeps the volume to simulate wave crashes (12s period)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // 12 seconds per wave swell

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(vol * 0.45, ctx.currentTime); // Volume swing amount

    lfo.connect(lfoGain);
    lfoGain.connect(oceanGain.gain);

    lfo.start(0);
    oceanLfoRef.current = lfo;
  };

  const stopOcean = () => {
    if (oceanSourceRef.current) {
      try { oceanSourceRef.current.stop(); } catch (e) {}
      oceanSourceRef.current = null;
    }
    if (oceanLfoRef.current) {
      try { oceanLfoRef.current.stop(); } catch (e) {}
      oceanLfoRef.current = null;
    }
    oceanGainRef.current = null;
  };

  // 🌲 Mystic Forest Engine
  const startForest = (ctx: AudioContext, vol: number) => {
    stopForest();

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(vol, ctx.currentTime);
    mainGain.connect(masterGainRef.current!);
    forestMainGainRef.current = mainGain;

    // Leaves rustle background (filtered brown noise)
    const rustleGain = ctx.createGain();
    rustleGain.gain.setValueAtTime(0.3, ctx.currentTime); // Soft rustle background
    rustleGain.connect(mainGain);

    const rustleFilter = ctx.createBiquadFilter();
    rustleFilter.type = 'bandpass';
    rustleFilter.frequency.setValueAtTime(500, ctx.currentTime);
    rustleFilter.Q.setValueAtTime(0.8, ctx.currentTime);
    rustleFilter.connect(rustleGain);

    const buffer = createNoiseBuffer(ctx, 'brown');
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(rustleFilter);
    source.start(0);
    forestRustleSourceRef.current = source;
    forestRustleGainRef.current = rustleGain;

    // Bird Chirp Sweeper Interval
    const playChirp = () => {
      if (!audioCtxRef.current || !forestMainGainRef.current) return;
      const cCtx = audioCtxRef.current;
      const cMain = forestMainGainRef.current;
      const now = cCtx.currentTime;
      
      const chirpCount = Math.floor(Math.random() * 2) + 2; // 2 to 3 chirps
      let delay = 0;

      for (let k = 0; k < chirpCount; k++) {
        const time = now + delay;
        const osc = cCtx.createOscillator();
        const chirpGain = cCtx.createGain();

        osc.type = 'sine';
        // Rise sweep (frequency modulation)
        osc.frequency.setValueAtTime(1600 + Math.random() * 300, time);
        osc.frequency.exponentialRampToValueAtTime(3200 + Math.random() * 500, time + 0.12);

        // Amplitude envelope
        chirpGain.gain.setValueAtTime(0.001, time);
        chirpGain.gain.linearRampToValueAtTime(0.06, time + 0.03);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(chirpGain);
        chirpGain.connect(cMain);

        osc.start(time);
        osc.stop(time + 0.13);

        delay += 0.16; // delay between sequence
      }

      // Schedule next chirp sequence randomly in 3 to 7 seconds
      const nextTime = (Math.random() * 4000) + 3000;
      forestIntervalRef.current = setTimeout(playChirp, nextTime);
    };

    // Begin bird interval
    forestIntervalRef.current = setTimeout(playChirp, 2000);
  };

  const stopForest = () => {
    if (forestRustleSourceRef.current) {
      try { forestRustleSourceRef.current.stop(); } catch (e) {}
      forestRustleSourceRef.current = null;
    }
    if (forestIntervalRef.current) {
      clearTimeout(forestIntervalRef.current);
      forestIntervalRef.current = null;
    }
    forestRustleGainRef.current = null;
    forestMainGainRef.current = null;
  };

  // Toggle individual sound
  const handleToggleSound = (id: 'rain' | 'white' | 'ocean' | 'forest') => {
    const updated = sounds.map((s) => {
      if (s.id === id) {
        const nextPlaying = !s.isPlaying;
        try {
          const ctx = getAudioContext();
          if (nextPlaying) {
            if (id === 'rain') startRain(ctx, s.volume);
            else if (id === 'white') startWhiteNoise(ctx, s.volume);
            else if (id === 'ocean') startOcean(ctx, s.volume);
            else if (id === 'forest') startForest(ctx, s.volume);
          } else {
            if (id === 'rain') stopRain();
            else if (id === 'white') stopWhiteNoise();
            else if (id === 'ocean') stopOcean();
            else if (id === 'forest') stopForest();
          }
        } catch (err) {
          console.error(`Error toggling sound: ${id}`, err);
        }
        return { ...s, isPlaying: nextPlaying };
      }
      return s;
    });

    setSounds(updated);
  };

  // Volume slider adjust
  const handleVolumeChange = (id: 'rain' | 'white' | 'ocean' | 'forest', newVolume: number) => {
    const updated = sounds.map((s) => {
      if (s.id === id) {
        if (audioCtxRef.current) {
          const now = audioCtxRef.current.currentTime;
          if (id === 'rain' && rainGainRef.current) {
            rainGainRef.current.gain.setValueAtTime(newVolume, now);
          } else if (id === 'white' && whiteGainRef.current) {
            whiteGainRef.current.gain.setValueAtTime(newVolume, now);
          } else if (id === 'ocean' && oceanGainRef.current) {
            // Readjust base ocean swells
            oceanGainRef.current.gain.setValueAtTime(newVolume * 0.5, now);
          } else if (id === 'forest' && forestMainGainRef.current) {
            forestMainGainRef.current.gain.setValueAtTime(newVolume, now);
          }
        }
        return { ...s, volume: newVolume };
      }
      return s;
    });
    setSounds(updated);
  };

  // Master power toggle
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${mins}:${seconds.toString().padStart(2, '0')}`;
  };

  const isAnyPlaying = sounds.some((s) => s.isPlaying);

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
          <Volume2 size={24} />
        </div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0' }}>
          Ambient Focus Mixer
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Synthesize personalized white noises and natural soundscapes directly in your browser.
        </p>
      </div>

      {/* Dynamic Equalizer Panel */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        height: '60px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        marginBottom: '25px',
        overflow: 'hidden'
      }}>
        {isAnyPlaying ? (
          Array.from({ length: 18 }).map((_, i) => {
            const delay = i * 0.07;
            const duration = 0.5 + Math.random() * 0.7;
            return (
              <div
                key={i}
                style={{
                  width: '6px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--primary-color)',
                  opacity: 0.85,
                  animation: `eqBounce ${duration}s ease-in-out infinite alternate`,
                  animationDelay: `${delay}s`,
                  height: '10%'
                }}
              >
                <style>{`
                  @keyframes eqBounce {
                    0% { height: 10%; }
                    100% { height: 80%; }
                  }
                `}</style>
              </div>
            );
          })
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontWeight: 600
          }}>
            <VolumeX size={14} />
            Mixed Output Inactive
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '25px'
      }}>
        {sounds.map((sound) => {
          return (
            <div
              key={sound.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: sound.isPlaying ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                border: '1.5px solid',
                borderColor: sound.isPlaying ? sound.color : 'var(--glass-border)',
                boxShadow: sound.isPlaying ? `0 4px 15px ${sound.color}15` : 'none',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
            >
              {/* Card top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: sound.isPlaying ? `${sound.color}18` : 'rgba(255, 255, 255, 0.03)',
                    color: sound.isPlaying ? sound.color : 'var(--text-secondary)',
                    transition: 'all 0.3s'
                  }}>
                    {sound.icon}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sound.name}</span>
                </div>

                {/* Toggle switch custom */}
                <button
                  onClick={() => handleToggleSound(sound.id)}
                  style={{
                    position: 'relative',
                    width: '42px',
                    height: '22px',
                    borderRadius: '15px',
                    backgroundColor: sound.isPlaying ? sound.color : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.25s'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: sound.isPlaying ? '22px' : '2px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'left 0.25s'
                  }} />
                </button>
              </div>

              {/* Slider control */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                opacity: sound.isPlaying ? 1 : 0.4,
                pointerEvents: sound.isPlaying ? 'auto' : 'none',
                transition: 'opacity 0.25s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  <span>Volume</span>
                  <span>{Math.round(sound.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sound.volume}
                  onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    height: '4px',
                    borderRadius: '2px',
                    accentColor: sound.color,
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Strip & Sleep Timer */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--glass-border)'
      }}>
        
        {/* Row 1: Master controls */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px'
        }}>
          {/* Mute and volume slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '220px' }}>
            <button
              onClick={handleToggleMute}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid var(--glass-border)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: 'var(--text-color)',
                cursor: 'pointer'
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <span>Master Volume</span>
                <span>{isMuted ? 'Muted' : `${Math.round(masterVolume * 100)}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={masterVolume}
                disabled={isMuted}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '5px',
                  borderRadius: '3px',
                  accentColor: 'var(--primary-color)',
                  cursor: 'pointer',
                  opacity: isMuted ? 0.3 : 1
                }}
              />
            </div>
          </div>
        </div>

        {/* Row 2: Sleep Timer Options */}
        <div style={{
          borderTop: '1px solid var(--glass-border)',
          paddingTop: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
              <Clock size={16} style={{ color: 'var(--primary-color)' }} />
              <span>Sleep Timer</span>
            </div>
            {timerSecondsLeft !== null && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: 'var(--primary-color)',
                backgroundColor: 'rgba(0, 161, 155, 0.08)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontFamily: 'monospace'
              }}>
                <Timer size={12} />
                <span>Auto-Stop In: {formatTimer(timerSecondsLeft)}</span>
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {[
              { label: 'Off', val: null },
              { label: '15 Mins', val: 15 },
              { label: '30 Mins', val: 30 },
              { label: '60 Mins', val: 60 }
            ].map((btn) => {
              const isSel = timerMinutes === btn.val;
              return (
                <button
                  key={btn.label}
                  onClick={() => setTimerMinutes(btn.val)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid var(--glass-border)',
                    backgroundColor: isSel ? 'rgba(0,161,155,0.08)' : 'transparent',
                    borderColor: isSel ? 'var(--primary-color)' : 'var(--glass-border)',
                    color: isSel ? 'var(--primary-color)' : 'var(--text-color)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
