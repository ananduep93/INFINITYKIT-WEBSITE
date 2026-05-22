/**
 * Lazy-loaded Tools Registry
 * 
 * Each tool component is dynamically imported via next/dynamic, creating a
 * separate JS chunk per tool. This means:
 *  - The homepage / tools listing loads ZERO tool component code
 *  - Only the specific tool visited downloads its chunk (~5-40 KB each)
 *  - Reduces initial bundle by ~60-70% compared to static imports
 * 
 * NOTE: next/dynamic requires options to be an inline object literal (SWC static analysis).
 */
import dynamic from 'next/dynamic';
import React from 'react';

// ─── Shared fallback shown while a tool chunk loads ──────────────────────────
const LoadingSkeleton = () => (
  <div
    style={{
      minHeight: '220px',
      borderRadius: '16px',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid var(--glass-border)',
          borderTopColor: 'var(--primary-color)',
          borderRadius: '50%',
          animation: 'tkSpin 0.75s linear infinite',
          margin: '0 auto 12px',
        }}
      />
      <style>{`@keyframes tkSpin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
        Loading tool...
      </p>
    </div>
  </div>
);

// ─── Lazily-loaded tool components ────────────────────────────────────────────
// Each uses an inlined options object (Next.js SWC requirement)
const TodoList           = dynamic(() => import('./TodoList'),          { ssr: false, loading: LoadingSkeleton });
const QuickNotes         = dynamic(() => import('./QuickNotes'),        { ssr: false, loading: LoadingSkeleton });
const FocusTimer         = dynamic(() => import('./FocusTimer'),        { ssr: false, loading: LoadingSkeleton });
const MedicationReminder = dynamic(() => import('./MedicationReminder'),{ ssr: false, loading: LoadingSkeleton });
const ExpenseTrackerSuite= dynamic(() => import('./ExpenseTrackerSuite'),{ ssr: false, loading: LoadingSkeleton });
const AIChatbot          = dynamic(() => import('./AIChatbot'),         { ssr: false, loading: LoadingSkeleton });
const AITextImprover     = dynamic(() => import('./AITextImprover'),    { ssr: false, loading: LoadingSkeleton });
const AISummarizer       = dynamic(() => import('./AISummarizer'),      { ssr: false, loading: LoadingSkeleton });
const AIImageGenerator   = dynamic(() => import('./AIImageGenerator'),  { ssr: false, loading: LoadingSkeleton });
const QRCodeGenerator    = dynamic(() => import('./QRCodeGenerator'),   { ssr: false, loading: LoadingSkeleton });
const GraphMaker         = dynamic(() => import('./GraphMaker'),        { ssr: false, loading: LoadingSkeleton });
const ESignature         = dynamic(() => import('./ESignature'),        { ssr: false, loading: LoadingSkeleton });
const MetadataStripper   = dynamic(() => import('./MetadataStripper'),  { ssr: false, loading: LoadingSkeleton });
const BulkRenamer        = dynamic(() => import('./BulkRenamer'),       { ssr: false, loading: LoadingSkeleton });
const JSONToTS           = dynamic(() => import('./JSONToTS'),          { ssr: false, loading: LoadingSkeleton });
const EncryptedNote      = dynamic(() => import('./EncryptedNote'),     { ssr: false, loading: LoadingSkeleton });
const LegacyToolBridge   = dynamic(() => import('./LegacyToolBridge'),  { ssr: false, loading: LoadingSkeleton });
const MergePDF           = dynamic(() => import('./MergePDF'),          { ssr: false, loading: LoadingSkeleton });
const SplitPDF           = dynamic(() => import('./SplitPDF'),          { ssr: false, loading: LoadingSkeleton });
const WatermarkPDF       = dynamic(() => import('./WatermarkPDF'),      { ssr: false, loading: LoadingSkeleton });
const ImageCompressor    = dynamic(() => import('./ImageCompressor'),   { ssr: false, loading: LoadingSkeleton });
const ImageResizer       = dynamic(() => import('./ImageResizer'),      { ssr: false, loading: LoadingSkeleton });
const OCRImage           = dynamic(() => import('./OCRImage'),          { ssr: false, loading: LoadingSkeleton });
const ProtectPDF         = dynamic(() => import('./ProtectPDF'),        { ssr: false, loading: LoadingSkeleton });
const UnlockPDF          = dynamic(() => import('./UnlockPDF'),         { ssr: false, loading: LoadingSkeleton });
const AISummarizePDF     = dynamic(() => import('./AISummarizePDF'),    { ssr: false, loading: LoadingSkeleton });
const AIChatPDF          = dynamic(() => import('./AIChatPDF'),         { ssr: false, loading: LoadingSkeleton });
const BackgroundRemover  = dynamic(() => import('./BackgroundRemover'), { ssr: false, loading: LoadingSkeleton });
const BlurBackground     = dynamic(() => import('./BlurBackground'),    { ssr: false, loading: LoadingSkeleton });
const ExtractAudio       = dynamic(() => import('./ExtractAudio'),      { ssr: false, loading: LoadingSkeleton });
const VideoToGIF         = dynamic(() => import('./VideoToGIF'),        { ssr: false, loading: LoadingSkeleton });
const EssayWriter        = dynamic(() => import('./EssayWriter'),       { ssr: false, loading: LoadingSkeleton });
const ArticleWriter      = dynamic(() => import('./ArticleWriter'),     { ssr: false, loading: LoadingSkeleton });
const BlogGenerator      = dynamic(() => import('./BlogGenerator'),     { ssr: false, loading: LoadingSkeleton });
const FAQGenerator       = dynamic(() => import('./FAQGenerator'),      { ssr: false, loading: LoadingSkeleton });
const AIRewriter         = dynamic(() => import('./AIRewriter'),        { ssr: false, loading: LoadingSkeleton });
const AIHumanizer        = dynamic(() => import('./AIHumanizer'),       { ssr: false, loading: LoadingSkeleton });
const GrammarFixer       = dynamic(() => import('./GrammarFixer'),      { ssr: false, loading: LoadingSkeleton });
const SubtitlesGenerator = dynamic(() => import('./SubtitlesGenerator'),{ ssr: false, loading: LoadingSkeleton });
const VideoTranscription = dynamic(() => import('./VideoTranscription'),{ ssr: false, loading: LoadingSkeleton });
const JSONFormatter      = dynamic(() => import('./JSONFormatter'),      { ssr: false, loading: LoadingSkeleton });
const SchemaGenerator    = dynamic(() => import('./SchemaGenerator'),   { ssr: false, loading: LoadingSkeleton });

// ─── Named exports (backwards compatibility) ──────────────────────────────────
export {
  TodoList,
  QuickNotes,
  FocusTimer,
  MedicationReminder,
  ExpenseTrackerSuite,
  AIChatbot,
  AITextImprover,
  AISummarizer,
  AIImageGenerator,
  QRCodeGenerator,
  GraphMaker,
  ESignature,
  MetadataStripper,
  BulkRenamer,
  JSONToTS,
  EncryptedNote,
  LegacyToolBridge,
  MergePDF,
  SplitPDF,
  WatermarkPDF,
  ImageCompressor,
  ImageResizer,
  OCRImage,
  ProtectPDF,
  UnlockPDF,
  AISummarizePDF,
  AIChatPDF,
  BackgroundRemover,
  BlurBackground,
  ExtractAudio,
  VideoToGIF,
  EssayWriter,
  ArticleWriter,
  BlogGenerator,
  FAQGenerator,
  AIRewriter,
  AIHumanizer,
  GrammarFixer,
  SubtitlesGenerator,
  VideoTranscription,
  JSONFormatter,
  SchemaGenerator,
};

// ─── Registry map for dynamic ToolClient lookup ───────────────────────────────
export const toolsRegistry: Record<string, React.ComponentType<any>> = {
  TodoList,
  QuickNotes,
  FocusTimer,
  MedicationReminder,
  ExpenseTrackerSuite,
  AIChatbot,
  AITextImprover,
  AISummarizer,
  AIImageGenerator,
  QRCodeGenerator,
  GraphMaker,
  ESignature,
  MetadataStripper,
  BulkRenamer,
  JSONToTS,
  EncryptedNote,
  LegacyToolBridge,
  MergePDF,
  SplitPDF,
  WatermarkPDF,
  ImageCompressor,
  ImageResizer,
  OCRImage,
  ProtectPDF,
  UnlockPDF,
  AISummarizePDF,
  AIChatPDF,
  BackgroundRemover,
  BlurBackground,
  ExtractAudio,
  VideoToGIF,
  EssayWriter,
  ArticleWriter,
  BlogGenerator,
  FAQGenerator,
  AIRewriter,
  AIHumanizer,
  GrammarFixer,
  SubtitlesGenerator,
  VideoTranscription,
  JSONFormatter,
  SchemaGenerator,
};
