'use client';

import React from 'react';
import VideoEditorSuite from './VideoEditorSuite';
import VideoConverterSuite from './VideoConverterSuite';
import VideoAISuite from './VideoAISuite';
import VideoUtilitiesSuite from './VideoUtilitiesSuite';

// Video Editing Wrappers
export function CompressVideo() {
  return <VideoEditorSuite initialTab="compress" />;
}

export function TrimVideo() {
  return <VideoEditorSuite initialTab="trim" />;
}

export function CropVideo() {
  return <VideoEditorSuite initialTab="crop" />;
}

export function ResizeVideo() {
  return <VideoEditorSuite initialTab="resize" />;
}

export function RotateVideo() {
  return <VideoEditorSuite initialTab="rotate" />;
}

export function ReverseVideo() {
  return <VideoEditorSuite initialTab="reverse" />;
}

export function MergeVideo() {
  return <VideoEditorSuite initialTab="merge" />;
}

export function SplitVideo() {
  return <VideoEditorSuite initialTab="split" />;
}

// Video Conversion Wrappers
export function ConvertMp4Mov() {
  return <VideoConverterSuite initialTarget="mov" />;
}

export function ConvertMovMp4() {
  return <VideoConverterSuite initialTarget="mp4" />;
}

export function ConvertMp4Webm() {
  return <VideoConverterSuite initialTarget="webm" />;
}

export function ConvertWebmMp4() {
  return <VideoConverterSuite initialTarget="mp4" />;
}

export function ConvertMkvMp4() {
  return <VideoConverterSuite initialTarget="mp4" />;
}

export function ConvertMp4Mkv() {
  return <VideoConverterSuite initialTarget="mkv" />;
}

export function ConvertAviMp4() {
  return <VideoConverterSuite initialTarget="mp4" />;
}

export function ConvertMp4Avi() {
  return <VideoConverterSuite initialTarget="avi" />;
}

// Video AI Wrappers
export function AISubtitleGen() {
  return <VideoAISuite />;
}

export function AIVideoSummary() {
  return <VideoAISuite />;
}

export function AITranscript() {
  return <VideoAISuite />;
}

// Video Utilities Wrappers
export function ExtractAudioWrapper() {
  return <VideoUtilitiesSuite initialTab="extract-audio" />;
}

export function MuteVideo() {
  return <VideoUtilitiesSuite initialTab="mute" />;
}

export function VideoToGIFWrapper() {
  return <VideoUtilitiesSuite initialTab="video-to-gif" />;
}

export function ThumbnailExtractor() {
  return <VideoUtilitiesSuite initialTab="extract-thumbnail" />;
}
