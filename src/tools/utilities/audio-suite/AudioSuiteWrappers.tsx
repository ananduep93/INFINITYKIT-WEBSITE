'use client';

import React from 'react';
import AudioSuite from '../audio-suite/AudioSuite';

export function TrimAudio() {
  return <AudioSuite initialTab="edit" initialSubTab="trim" />;
}

export function MergeAudio() {
  return <AudioSuite initialTab="edit" initialSubTab="merge" />;
}

export function SplitAudio() {
  return <AudioSuite initialTab="edit" initialSubTab="split" />;
}

export function CompressAudio() {
  return <AudioSuite initialTab="edit" initialSubTab="compress" />;
}

export function MP4ToMP3() {
  return <AudioSuite initialTab="convert" initialFormat="mp3" />;
}

export function WAVToMP3() {
  return <AudioSuite initialTab="convert" initialFormat="mp3" />;
}

export function AACToMP3() {
  return <AudioSuite initialTab="convert" initialFormat="mp3" />;
}

export function FLACToMP3() {
  return <AudioSuite initialTab="convert" initialFormat="mp3" />;
}

export function OGGToMP3() {
  return <AudioSuite initialTab="convert" initialFormat="mp3" />;
}

export function VoiceCleaner() {
  return <AudioSuite initialTab="ai" initialSubTab="cleaner" />;
}

export function NoiseRemoval() {
  return <AudioSuite initialTab="ai" initialSubTab="noise" />;
}

export function PodcastSummary() {
  return <AudioSuite initialTab="ai" initialSubTab="summary" />;
}
