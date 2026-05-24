'use client';

import React, { useState } from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function VideoToGIF() {
  const [gifWidth, setGifWidth] = useState(480);
  const [gifHeight, setGifHeight] = useState(360);
  const [numFrames, setNumFrames] = useState(20);
  const [interval, setIntervalVal] = useState(0.1); // interval in seconds

  const loadGifShot = () => {
    return new Promise<any>((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('Browser environment required.'));
      if ((window as any).gifshot) {
        resolve((window as any).gifshot);
        return;
      }
      const script = document.createElement('script');
      script.src = '/gifshot.min.js';
      script.onload = () => resolve((window as any).gifshot);
      script.onerror = () => reject(new Error('Failed to load gifshot compilation library.'));
      document.head.appendChild(script);
    });
  };

  const handleConvertToGif = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a video file.');
    }

    const file = files[0];
    const videoUrl = URL.createObjectURL(file);

    const gifshotLib = await loadGifShot();

    return new Promise<{ downloadUrl: string; fileName: string; resultData: string }>((resolve, reject) => {
      gifshotLib.createGIF({
        video: [videoUrl],
        gifWidth: gifWidth,
        gifHeight: gifHeight,
        numFrames: numFrames,
        interval: interval,
        sampleInterval: 10,
        numWorkers: 2
      }, (obj: any) => {
        URL.revokeObjectURL(videoUrl);
        if (obj.error) {
          reject(new Error(obj.errorMsg || 'Failed to encode video into GIF format.'));
        } else {
          resolve({
            downloadUrl: obj.image,
            fileName: `${file.name.replace(/\.[^/.]+$/, '')}.gif`,
            resultData: `Successfully compiled video into animated GIF locally!
Dimensions: ${gifWidth}x${gifHeight}px
Frames count: ${numFrames}
Capture interval: ${interval}s`
          });
        }
      });
    });
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Video to Animated GIF
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Convert MP4/WebM videos into high-quality looping animated GIFs locally using parallel worker threads in your browser sandbox.
      </p>

      <ToolWorkspace
        toolId="video-to-gif"
        accept="video/*"
        maxFiles={1}
        onProcess={handleConvertToGif}
        actionButtonText="Convert to GIF"
        instructions={[
          'Upload your video file (MP4, WebM, etc.).',
          'Adjust GIF resolution and captures count using sliders below.',
          'Click the "Convert to GIF" button to start the client-side frames capture and download your animated GIF.'
        ]}
      />

      <div className="glass-panel" style={{ marginTop: '25px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>GIF Output Specifications</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {/* Width */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>GIF Width: {gifWidth}px</label>
            <input
              type="range"
              min="160"
              max="800"
              step="40"
              value={gifWidth}
              onChange={(e) => setGifWidth(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-color)' }}
            />
          </div>

          {/* Height */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>GIF Height: {gifHeight}px</label>
            <input
              type="range"
              min="120"
              max="600"
              step="30"
              value={gifHeight}
              onChange={(e) => setGifHeight(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-color)' }}
            />
          </div>

          {/* Frames */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Captured Frames: {numFrames}</label>
            <input
              type="range"
              min="5"
              max="50"
              value={numFrames}
              onChange={(e) => setNumFrames(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-color)' }}
            />
          </div>

          {/* Frame Interval */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Frame Delay: {interval}s</label>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={interval}
              onChange={(e) => setIntervalVal(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-color)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
