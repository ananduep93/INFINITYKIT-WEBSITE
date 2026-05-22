'use client';

import React from 'react';
import ToolWorkspace from '../ui/ToolWorkspace';

export default function ExtractAudio() {
  const handleExtract = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please upload a video or audio file.');
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();

    // 1. Initialize AudioContext (supporting all legacy browser prefixes)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('Web Audio API is not supported in this browser.');
    }

    const audioCtx = new AudioContextClass();
    let decodedBuffer: AudioBuffer;

    try {
      decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (err) {
      throw new Error('Failed to decode the media file audio stream. Make sure it is a valid video/audio format.');
    } finally {
      await audioCtx.close();
    }

    // 2. Encode to high-quality local WAV file using structural byte buffers
    const wavBlob = bufferToWav(decodedBuffer);
    const downloadUrl = URL.createObjectURL(wavBlob);

    return {
      downloadUrl,
      fileName: `${file.name.replace(/\.[^/.]+$/, '')}_extracted.wav`,
      resultData: `Successfully extracted audio track from "${file.name}".
Format: High-Definition PCM WAV
Sample Rate: ${decodedBuffer.sampleRate} Hz
Channels: ${decodedBuffer.numberOfChannels}
Duration: ${decodedBuffer.duration.toFixed(1)} seconds`
    };
  };

  // State-of-the-art WAV structural header byte writer
  const bufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM Raw
    const bitDepth = 16;
    
    let result;
    if (numOfChan === 2) {
      result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
      result = buffer.getChannelData(0);
    }
    
    const bufferLength = result.length * 2;
    const arrayBuffer = new ArrayBuffer(44 + bufferLength);
    const view = new DataView(arrayBuffer);
    
    // Write RIFF Identifier
    writeString(view, 0, 'RIFF');
    // Write file length
    view.setUint32(4, 36 + bufferLength, true);
    // Write WAVE Identifier
    writeString(view, 8, 'WAVE');
    // Write Format Chunk Identifier
    writeString(view, 12, 'fmt ');
    // Write Chunk Length
    view.setUint32(16, 16, true);
    // Write Sample Format (PCM)
    view.setUint16(20, format, true);
    // Write Channel Count
    view.setUint16(22, numOfChan, true);
    // Write Sample Rate
    view.setUint32(24, sampleRate, true);
    // Write Byte Rate
    view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
    // Write Block Align
    view.setUint16(32, numOfChan * (bitDepth / 8), true);
    // Write Bits per Sample
    view.setUint16(34, bitDepth, true);
    // Write Data Chunk Identifier
    writeString(view, 36, 'data');
    // Write Data Chunk Length
    view.setUint32(40, bufferLength, true);
    
    // Write Float Channel Data scaled down to Int16 PCM samples
    floatTo16BitPCM(view, 44, result);
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const interleave = (inputL: Float32Array, inputR: Float32Array): Float32Array => {
    const length = inputL.length + inputR.length;
    const result = new Float32Array(length);
    let index = 0;
    let inputIndex = 0;
    
    while (index < length) {
      result[index++] = inputL[inputIndex];
      result[index++] = inputR[inputIndex];
      inputIndex++;
    }
    return result;
  };

  const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  return (
    <div className="glass-panel" style={{ margin: '0 auto', maxWidth: '850px' }}>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        Extract Audio Track
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
        Extract high-fidelity audio tracks from video files locally. Supports MP4, WebM, AVI, and other standard video formats.
      </p>

      <ToolWorkspace
        toolId="extract-audio"
        accept="video/*,audio/*"
        maxFiles={1}
        onProcess={handleExtract}
        actionButtonText="Extract Audio"
        instructions={[
          'Upload the video or audio file from which you wish to strip the audio.',
          'Wait for the file to load and decode the raw audio channel.',
          'Click the "Extract Audio" button to run the local PCM structure builder and export a clean .wav file.'
        ]}
      />
    </div>
  );
}
