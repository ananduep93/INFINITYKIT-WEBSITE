'use client';

import React from 'react';
import AudioSuite from '../audio-suite/AudioSuite';

export default function TextToSpeech() {
  return <AudioSuite initialTab="ai" initialSubTab="tts" />;
}
