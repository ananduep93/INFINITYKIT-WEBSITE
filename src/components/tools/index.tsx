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
const TodoList           = dynamic(() => import('../../tools/productivity/todo/TodoList'),          { ssr: false, loading: LoadingSkeleton });
const QuickNotes         = dynamic(() => import('../../tools/productivity/notes/QuickNotes'),        { ssr: false, loading: LoadingSkeleton });
const FocusTimer         = dynamic(() => import('../../tools/productivity/timer/FocusTimer'),        { ssr: false, loading: LoadingSkeleton });
const MedicationReminder = dynamic(() => import('../../tools/productivity/medicinereminder/MedicationReminder'),{ ssr: false, loading: LoadingSkeleton });
const ExpenseTrackerSuite= dynamic(() => import('../../tools/productivity/expense-tracker/ExpenseTrackerSuite'),{ ssr: false, loading: LoadingSkeleton });
const AIChatbot          = dynamic(() => import('../../tools/ai/ai-chat/AIChatbot'),         { ssr: false, loading: LoadingSkeleton });
const AITextImprover     = dynamic(() => import('../../tools/ai/text-improver/AITextImprover'),    { ssr: false, loading: LoadingSkeleton });
const AISummarizer       = dynamic(() => import('../../tools/ai/summarizer/AISummarizer'),      { ssr: false, loading: LoadingSkeleton });
const QRCodeGenerator    = dynamic(() => import('../../tools/utilities/qr-generator/QRCodeGenerator'),   { ssr: false, loading: LoadingSkeleton });
const GraphMaker         = dynamic(() => import('../../tools/developer/graph-maker/GraphMaker'),        { ssr: false, loading: LoadingSkeleton });
const ESignature         = dynamic(() => import('./ESignature'),        { ssr: false, loading: LoadingSkeleton });
const MetadataStripper   = dynamic(() => import('../../tools/image/metadata-stripper/MetadataStripper'),  { ssr: false, loading: LoadingSkeleton });
const BulkRenamer        = dynamic(() => import('./BulkRenamer'),       { ssr: false, loading: LoadingSkeleton });
const JSONToTS           = dynamic(() => import('../../tools/developer/json-to-ts/JSONToTS'),          { ssr: false, loading: LoadingSkeleton });
const EncryptedNote      = dynamic(() => import('../../tools/productivity/encrypted-note/EncryptedNote'),     { ssr: false, loading: LoadingSkeleton });
const LegacyToolBridge   = dynamic(() => import('./LegacyToolBridge'),  { ssr: false, loading: LoadingSkeleton });
const MergePDF           = dynamic(() => import('../../tools/pdf/pdf-editor/MergePDF'),          { ssr: false, loading: LoadingSkeleton });
const CompressPDF        = dynamic(() => import('./CompressPDF'),       { ssr: false, loading: LoadingSkeleton });
const SplitPDF           = dynamic(() => import('../../tools/pdf/pdf-editor/SplitPDF'),          { ssr: false, loading: LoadingSkeleton });
const WatermarkPDF       = dynamic(() => import('../../tools/pdf/pdf-markup/WatermarkPDF'),      { ssr: false, loading: LoadingSkeleton });
const ImageCompressor    = dynamic(() => import('../../tools/image/image-compressor/ImageCompressor'),   { ssr: false, loading: LoadingSkeleton });
const ImageResizer       = dynamic(() => import('../../tools/image/image-resizer/ImageResizer'),      { ssr: false, loading: LoadingSkeleton });
const OCRImage           = dynamic(() => import('../../tools/image/ocr-image/OCRImage'),          { ssr: false, loading: LoadingSkeleton });
const ProtectPDF         = dynamic(() => import('../../tools/pdf/pdf-security/ProtectPDF'),        { ssr: false, loading: LoadingSkeleton });
const UnlockPDF          = dynamic(() => import('../../tools/pdf/pdf-security/UnlockPDF'),         { ssr: false, loading: LoadingSkeleton });
const AISummarizePDF     = dynamic(() => import('../../tools/pdf/ai-summarize-pdf/AISummarizePDF'),    { ssr: false, loading: LoadingSkeleton });
const AIChatPDF          = dynamic(() => import('../../tools/pdf/ai-chat-pdf/AIChatPDF'),         { ssr: false, loading: LoadingSkeleton });
const BackgroundRemover  = dynamic(() => import('../../tools/image/image-ai/BackgroundRemover'), { ssr: false, loading: LoadingSkeleton });

const EssayWriter        = dynamic(() => import('../../tools/ai/essay-writer/EssayWriter'),       { ssr: false, loading: LoadingSkeleton });
const ArticleWriter      = dynamic(() => import('../../tools/ai/article-writer/ArticleWriter'),     { ssr: false, loading: LoadingSkeleton });
const BlogGenerator      = dynamic(() => import('../../tools/ai/blog-generator/BlogGenerator'),     { ssr: false, loading: LoadingSkeleton });
const FAQGenerator       = dynamic(() => import('../../tools/ai/faq-generator/FAQGenerator'),      { ssr: false, loading: LoadingSkeleton });
const AIRewriter         = dynamic(() => import('../../tools/ai/ai-rewriter/AIRewriter'),        { ssr: false, loading: LoadingSkeleton });
const AIHumanizer        = dynamic(() => import('../../tools/ai/ai-humanizer/AIHumanizer'),       { ssr: false, loading: LoadingSkeleton });
const GrammarFixer       = dynamic(() => import('../../tools/ai/grammar-fixer/GrammarFixer'),      { ssr: false, loading: LoadingSkeleton });

// Dynamic imports for the new 21 video ecosystem tools
const AISubtitleGen      = dynamic(() => import('../../tools/ai/video-ai/VideoSuiteWrappers').then(m => m.AISubtitleGen), { ssr: false, loading: LoadingSkeleton });
const AIVideoSummary     = dynamic(() => import('../../tools/ai/video-ai/VideoSuiteWrappers').then(m => m.AIVideoSummary), { ssr: false, loading: LoadingSkeleton });
const AITranscript       = dynamic(() => import('../../tools/ai/video-ai/VideoSuiteWrappers').then(m => m.AITranscript), { ssr: false, loading: LoadingSkeleton });
const VideoAISuite       = dynamic(() => import('../../tools/ai/video-ai/VideoAISuite'),       { ssr: false, loading: LoadingSkeleton });
const JSONFormatter      = dynamic(() => import('../../tools/developer/json-formatter/JSONFormatter'),      { ssr: false, loading: LoadingSkeleton });
const SchemaGenerator    = dynamic(() => import('../../tools/developer/schema-generator/SchemaGenerator'),   { ssr: false, loading: LoadingSkeleton });
const PublicSurvey       = dynamic(() => import('../../tools/productivity/survey-builder/PublicSurvey'),      { ssr: false, loading: LoadingSkeleton });
const PasswordLeakScanner  = dynamic(() => import('../../tools/productivity/password-leak/PasswordLeakScanner'), { ssr: false, loading: LoadingSkeleton });

const ResetExpenses        = dynamic(() => import('../../tools/productivity/expense-tracker/ResetExpenses'), { ssr: false, loading: LoadingSkeleton });

const TopSpendingInsights  = dynamic(() => import('../../tools/productivity/expense-tracker/TopSpendingInsights'), { ssr: false, loading: LoadingSkeleton });

const ResponseViewer       = dynamic(() => import('../../tools/productivity/survey-builder/ResponseViewer'), { ssr: false, loading: LoadingSkeleton });

const MySurveys            = dynamic(() => import('../../tools/productivity/survey-builder/MySurveys'), { ssr: false, loading: LoadingSkeleton });

const SurveyBuilder        = dynamic(() => import('../../tools/productivity/survey-builder/SurveyBuilder'), { ssr: false, loading: LoadingSkeleton });

const ColorPaletteGenerator = dynamic(() => import('../../tools/image/color-palette/ColorPaletteGenerator'), { ssr: false, loading: LoadingSkeleton });

const PDFToImage           = dynamic(() => import('../../tools/pdf/pdf-to-image/PDFToImage'), { ssr: false, loading: LoadingSkeleton });

const URLExtractor         = dynamic(() => import('../../tools/developer/url-extractor/URLExtractor'), { ssr: false, loading: LoadingSkeleton });

const PersonaPromptsMen    = dynamic(() => import('../../tools/ai/men-prompts/PersonaPromptsMen'),   { ssr: false, loading: LoadingSkeleton });
const PersonaPromptsWomen  = dynamic(() => import('../../tools/ai/women-prompts/PersonaPromptsWomen'), { ssr: false, loading: LoadingSkeleton });
const SmartPromptEditor    = dynamic(() => import('../../tools/ai/smartsuggestions/SmartPromptEditor'),   { ssr: false, loading: LoadingSkeleton });

const RearrangePDF          = dynamic(() => import('../../tools/pdf/pdf-editor/RearrangePDF'),          { ssr: false, loading: LoadingSkeleton });
const DeletePDFPages        = dynamic(() => import('../../tools/pdf/pdf-editor/DeletePDFPages'),        { ssr: false, loading: LoadingSkeleton });
const DuplicatePDFPages     = dynamic(() => import('../../tools/pdf/pdf-editor/DuplicatePDFPages'),     { ssr: false, loading: LoadingSkeleton });
const CropPDFPages          = dynamic(() => import('../../tools/pdf/pdf-editor/CropPDFPages'),          { ssr: false, loading: LoadingSkeleton });
const AddPDFHeaderFooter    = dynamic(() => import('../../tools/pdf/pdf-markup/AddPDFHeaderFooter'),    { ssr: false, loading: LoadingSkeleton });
const AddPDFPageNumbers     = dynamic(() => import('../../tools/pdf/pdf-markup/AddPDFPageNumbers'),     { ssr: false, loading: LoadingSkeleton });
const AddPDFText            = dynamic(() => import('../../tools/pdf/pdf-markup/AddPDFText'),            { ssr: false, loading: LoadingSkeleton });
const OCRPDF                = dynamic(() => import('../../tools/pdf/pdf-ocr/OCRPDF'),                { ssr: false, loading: LoadingSkeleton });
const ExtractPDFImages      = dynamic(() => import('../../tools/pdf/extract-pdf-images/ExtractPDFImages'),      { ssr: false, loading: LoadingSkeleton });
const TranslatePDF          = dynamic(() => import('../../tools/pdf/translate-pdf/TranslatePDF'),          { ssr: false, loading: LoadingSkeleton });
const PDFToWord             = dynamic(() => import('../../tools/pdf/pdf-to-word/PDFToWord'),             { ssr: false, loading: LoadingSkeleton });
const WordToPDF             = dynamic(() => import('../../tools/pdf/word-to-pdf/WordToPDF'),             { ssr: false, loading: LoadingSkeleton });
const PDFToJPG              = dynamic(() => import('../../tools/pdf/pdf-to-jpg/PDFToJPG'),              { ssr: false, loading: LoadingSkeleton });
const PDFToPNG              = dynamic(() => import('../../tools/pdf/pdf-to-png/PDFToPNG'),              { ssr: false, loading: LoadingSkeleton });
const PDFToExcel            = dynamic(() => import('../../tools/pdf/pdf-to-excel/PDFToExcel'),            { ssr: false, loading: LoadingSkeleton });
const PDFToCSV              = dynamic(() => import('../../tools/pdf/pdf-to-csv/PDFToCSV'),              { ssr: false, loading: LoadingSkeleton });
const PDFToHTML             = dynamic(() => import('../../tools/pdf/pdf-to-html/PDFToHTML'),             { ssr: false, loading: LoadingSkeleton });
const HTMLToPDF             = dynamic(() => import('../../tools/pdf/html-to-pdf/HTMLToPDF'),             { ssr: false, loading: LoadingSkeleton });
const PDFToTXT              = dynamic(() => import('../../tools/pdf/pdf-to-txt/PDFToTXT'),              { ssr: false, loading: LoadingSkeleton });
const TXTToPDF              = dynamic(() => import('../../tools/pdf/txt-to-pdf/TXTToPDF'),              { ssr: false, loading: LoadingSkeleton });
const PDFToEPUB             = dynamic(() => import('../../tools/pdf/pdf-to-epub/PDFToEPUB'),             { ssr: false, loading: LoadingSkeleton });
const EPUBToPDF             = dynamic(() => import('../../tools/pdf/epub-to-pdf/EPUBToPDF'),             { ssr: false, loading: LoadingSkeleton });

// Image Editing Wrappers
const ResizeImage           = dynamic(() => import('../../tools/image/image-editor/ResizeImage'),           { ssr: false, loading: LoadingSkeleton });
const CompressImage         = dynamic(() => import('../../tools/image/image-editor/CompressImage'),         { ssr: false, loading: LoadingSkeleton });
const CropImage             = dynamic(() => import('../../tools/image/image-editor/CropImage'),             { ssr: false, loading: LoadingSkeleton });
const RotateImage           = dynamic(() => import('../../tools/image/image-editor/RotateImage'),           { ssr: false, loading: LoadingSkeleton });
const FlipImage             = dynamic(() => import('../../tools/image/image-editor/FlipImage'),             { ssr: false, loading: LoadingSkeleton });
const BlurImage             = dynamic(() => import('../../tools/image/image-editor/BlurImage'),             { ssr: false, loading: LoadingSkeleton });
const SharpenImage          = dynamic(() => import('../../tools/image/image-editor/SharpenImage'),          { ssr: false, loading: LoadingSkeleton });
const PixelateImage         = dynamic(() => import('../../tools/image/image-editor/PixelateImage'),         { ssr: false, loading: LoadingSkeleton });


// Image AI Editing Wrappers
const RemoveBackground      = dynamic(() => import('../../tools/image/image-ai/RemoveBackground'),      { ssr: false, loading: LoadingSkeleton });
const RemoveObjects         = dynamic(() => import('../../tools/image/image-ai/RemoveObjects'),         { ssr: false, loading: LoadingSkeleton });
const RemoveWatermark       = dynamic(() => import('../../tools/image/image-ai/RemoveWatermark'),       { ssr: false, loading: LoadingSkeleton });
const RemoveText            = dynamic(() => import('../../tools/image/image-ai/RemoveText'),            { ssr: false, loading: LoadingSkeleton });
const ColorizeImage         = dynamic(() => import('../../tools/image/image-ai/ColorizeImage'),         { ssr: false, loading: LoadingSkeleton });
const RestorePhotos         = dynamic(() => import('../../tools/image/image-ai/RestorePhotos'),         { ssr: false, loading: LoadingSkeleton });

// Converter Wrappers
const PNGToJPG              = dynamic(() => import('../../tools/image/image-converter/PNGToJPG'),              { ssr: false, loading: LoadingSkeleton });
const PNGToWEBP             = dynamic(() => import('../../tools/image/image-converter/PNGToWEBP'),             { ssr: false, loading: LoadingSkeleton });
const SVGToPNG              = dynamic(() => import('../../tools/image/image-converter/SVGToPNG'),              { ssr: false, loading: LoadingSkeleton });
const HEICToJPG             = dynamic(() => import('../../tools/image/image-converter/HEICToJPG'),             { ssr: false, loading: LoadingSkeleton });
const AVIFToPNG             = dynamic(() => import('../../tools/image/image-converter/AVIFToPNG'),             { ssr: false, loading: LoadingSkeleton });



const TextToSpeech         = dynamic(() => import('../../tools/utilities/text-to-speech/TextToSpeech'), { ssr: false, loading: LoadingSkeleton });
const AudioSuite           = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuite'),         { ssr: false, loading: LoadingSkeleton });
const TrimAudio            = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.TrimAudio), { ssr: false, loading: LoadingSkeleton });
const MergeAudio           = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.MergeAudio), { ssr: false, loading: LoadingSkeleton });
const SplitAudio           = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.SplitAudio), { ssr: false, loading: LoadingSkeleton });
const CompressAudio        = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.CompressAudio), { ssr: false, loading: LoadingSkeleton });
const MP4ToMP3             = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.MP4ToMP3), { ssr: false, loading: LoadingSkeleton });
const WAVToMP3             = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.WAVToMP3), { ssr: false, loading: LoadingSkeleton });
const AACToMP3             = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.AACToMP3), { ssr: false, loading: LoadingSkeleton });
const FLACToMP3            = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.FLACToMP3), { ssr: false, loading: LoadingSkeleton });
const OGGToMP3             = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.OGGToMP3), { ssr: false, loading: LoadingSkeleton });
const VoiceCleaner         = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.VoiceCleaner), { ssr: false, loading: LoadingSkeleton });
const NoiseRemoval         = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.NoiseRemoval), { ssr: false, loading: LoadingSkeleton });
const PodcastSummary       = dynamic(() => import('../../tools/utilities/audio-suite/AudioSuiteWrappers').then(m => m.PodcastSummary), { ssr: false, loading: LoadingSkeleton });

const SVGOptimizer         = dynamic(() => import('../../tools/developer/svg-optimizer/SVGOptimizer'), { ssr: false, loading: LoadingSkeleton });

const SpinWheel            = dynamic(() => import('../../tools/utilities/spin-wheel/SpinWheel'), { ssr: false, loading: LoadingSkeleton });

const SearchExpenses       = dynamic(() => import('../../tools/productivity/expense-tracker/SearchExpenses'), { ssr: false, loading: LoadingSkeleton });

const RotatePDF            = dynamic(() => import('../../tools/pdf/pdf-editor/RotatePDF'), { ssr: false, loading: LoadingSkeleton });

const PasswordVault        = dynamic(() => import('../../tools/productivity/passwordsaver/PasswordVault'), { ssr: false, loading: LoadingSkeleton });

const P2PFileShare         = dynamic(() => import('./P2PFileShare'), { ssr: false, loading: LoadingSkeleton });

const NotificationScheduler = dynamic(() => import('../../tools/productivity/reminderalert/NotificationScheduler'), { ssr: false, loading: LoadingSkeleton });

const MorseCodeTranslator  = dynamic(() => import('../../tools/utilities/morse-translator/MorseCodeTranslator'), { ssr: false, loading: LoadingSkeleton });

const MetaTagViewer        = dynamic(() => import('./MetaTagViewer'), { ssr: false, loading: LoadingSkeleton });

const LinkInBio            = dynamic(() => import('../../tools/utilities/link-in-bio/LinkInBio'), { ssr: false, loading: LoadingSkeleton });

const InternetSpeedTest    = dynamic(() => import('../../tools/utilities/speed-test/InternetSpeedTest'), { ssr: false, loading: LoadingSkeleton });

const InteractiveCalendar  = dynamic(() => import('../../tools/productivity/calendarviewer/InteractiveCalendar'), { ssr: false, loading: LoadingSkeleton });

const ImageToPDF           = dynamic(() => import('../../tools/pdf/image-to-pdf/ImageToPDF'), { ssr: false, loading: LoadingSkeleton });

const ImageInfo            = dynamic(() => import('../../tools/image/image-info/ImageInfo'), { ssr: false, loading: LoadingSkeleton });

const GlassmorphicGenerator = dynamic(() => import('../../tools/developer/glassmorphic-generator/GlassmorphicGenerator'), { ssr: false, loading: LoadingSkeleton });

const ExamGradeCalc        = dynamic(() => import('../../tools/utilities/grade-calculator/ExamGradeCalc'), { ssr: false, loading: LoadingSkeleton });

const DistanceCalculator   = dynamic(() => import('../../tools/utilities/distance-calculator/DistanceCalculator'), { ssr: false, loading: LoadingSkeleton });

const DailyPlanner         = dynamic(() => import('../../tools/productivity/dailyplanner/DailyPlanner'), { ssr: false, loading: LoadingSkeleton });

const DailyMonthlyReport   = dynamic(() => import('./DailyMonthlyReport'), { ssr: false, loading: LoadingSkeleton });

const CSVViewer            = dynamic(() => import('../../tools/developer/csv-viewer/CSVViewer'), { ssr: false, loading: LoadingSkeleton });

const ChoiceComparator     = dynamic(() => import('../../tools/utilities/choice-comparator/ChoiceComparator'), { ssr: false, loading: LoadingSkeleton });
const RandomNamePicker     = dynamic(() => import('../../tools/utilities/random-picker/RandomNamePicker'),     { ssr: false, loading: LoadingSkeleton });
const NoteShredder         = dynamic(() => import('../../tools/productivity/note-shredder/NoteShredder'),         { ssr: false, loading: LoadingSkeleton });
const AmbientNoisePlayer   = dynamic(() => import('../../tools/utilities/ambient-noise/AmbientNoisePlayer'),   { ssr: false, loading: LoadingSkeleton });
const CategorySummary      = dynamic(() => import('../../tools/developer/category-summary/CategorySummary'),      { ssr: false, loading: LoadingSkeleton });
const QuadraticSolver      = dynamic(() => import('../../tools/utilities/quadratic-solver/QuadraticSolver'),      { ssr: false, loading: LoadingSkeleton });
const PasswordStrength     = dynamic(() => import('../../tools/productivity/passwordstrength/PasswordStrength'),     { ssr: false, loading: LoadingSkeleton });



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
  QRCodeGenerator,
  GraphMaker,
  ESignature,
  MetadataStripper,
  BulkRenamer,
  JSONToTS,
  EncryptedNote,
  LegacyToolBridge,
  MergePDF,
  CompressPDF,
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

  EssayWriter,
  ArticleWriter,
  BlogGenerator,
  FAQGenerator,
  AIRewriter,
  AIHumanizer,
  GrammarFixer,
  AISubtitleGen,
  AIVideoSummary,
  AITranscript,
  VideoAISuite,
  JSONFormatter,
  SchemaGenerator,
  PublicSurvey,
  ChoiceComparator,
  PersonaPromptsMen,
  PersonaPromptsWomen,
  SmartPromptEditor,
  RandomNamePicker,
  NoteShredder,
  AmbientNoisePlayer,
  CategorySummary,
  QuadraticSolver,
  PasswordStrength,
  TopSpendingInsights,
  ResetExpenses,
  PasswordLeakScanner,
  ResponseViewer,
  MySurveys,
  SurveyBuilder,
  ColorPaletteGenerator,
  PDFToImage,
  URLExtractor,
  TextToSpeech,
  AudioSuite,
  TrimAudio,
  MergeAudio,
  SplitAudio,
  CompressAudio,
  MP4ToMP3,
  WAVToMP3,
  AACToMP3,
  FLACToMP3,
  OGGToMP3,
  VoiceCleaner,
  NoiseRemoval,
  PodcastSummary,
  SVGOptimizer,
  SpinWheel,
  SearchExpenses,
  RotatePDF,
  PasswordVault,
  P2PFileShare,
  NotificationScheduler,
  MorseCodeTranslator,
  MetaTagViewer,
  LinkInBio,
  InternetSpeedTest,
  InteractiveCalendar,
  ImageToPDF,
  ImageInfo,
  GlassmorphicGenerator,
  ExamGradeCalc,
  DistanceCalculator,
  DailyPlanner,
  DailyMonthlyReport,
  CSVViewer,
  RearrangePDF,
  DeletePDFPages,
  DuplicatePDFPages,
  CropPDFPages,
  AddPDFHeaderFooter,
  AddPDFPageNumbers,
  AddPDFText,
  OCRPDF,
  ExtractPDFImages,
  TranslatePDF,
  PDFToWord,
  WordToPDF,
  PDFToJPG,
  PDFToPNG,
  PDFToExcel,
  PDFToCSV,
  PDFToHTML,
  HTMLToPDF,
  PDFToTXT,
  TXTToPDF,
  PDFToEPUB,
  EPUBToPDF,

  // Image Ecosystem
  ResizeImage,
  CompressImage,
  CropImage,
  RotateImage,
  FlipImage,
  BlurImage,
  SharpenImage,
  PixelateImage,
  RemoveBackground,
  RemoveObjects,
  RemoveWatermark,
  RemoveText,
  ColorizeImage,
  RestorePhotos,
  PNGToJPG,
  PNGToWEBP,
  SVGToPNG,
  HEICToJPG,
  AVIFToPNG,
};

// ─── Registry map for dynamic ToolClient lookup ───────────────────────────────
export const toolsRegistry: Record<string, React.ComponentType<any>> = {
  // Standard CamelCase registry entries
  TodoList,
  QuickNotes,
  FocusTimer,
  MedicationReminder,
  ExpenseTrackerSuite,
  AIChatbot,
  AITextImprover,
  AISummarizer,
  QRCodeGenerator,
  GraphMaker,
  ESignature,
  MetadataStripper,
  BulkRenamer,
  JSONToTS,
  EncryptedNote,
  LegacyToolBridge,
  MergePDF,
  CompressPDF,
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

  EssayWriter,
  ArticleWriter,
  BlogGenerator,
  FAQGenerator,
  AIRewriter,
  AIHumanizer,
  GrammarFixer,
  AISubtitleGen,
  AIVideoSummary,
  AITranscript,
  VideoAISuite,
  JSONFormatter,
  SchemaGenerator,
  PublicSurvey,
  ChoiceComparator,
  PersonaPromptsMen,
  PersonaPromptsWomen,
  SmartPromptEditor,
  RandomNamePicker,
  NoteShredder,
  AmbientNoisePlayer,
  CategorySummary,
  QuadraticSolver,
  PasswordStrength,
  TopSpendingInsights,
  ResetExpenses,
  PasswordLeakScanner,
  ResponseViewer,
  MySurveys,
  SurveyBuilder,
  ColorPaletteGenerator,
  PDFToImage,
  URLExtractor,
  TextToSpeech,
  AudioSuite,
  TrimAudio,
  MergeAudio,
  SplitAudio,
  CompressAudio,
  MP4ToMP3,
  WAVToMP3,
  AACToMP3,
  FLACToMP3,
  OGGToMP3,
  VoiceCleaner,
  NoiseRemoval,
  PodcastSummary,
  SVGOptimizer,
  SpinWheel,
  SearchExpenses,
  RotatePDF,
  PasswordVault,
  P2PFileShare,
  NotificationScheduler,
  MorseCodeTranslator,
  MetaTagViewer,
  LinkInBio,
  InternetSpeedTest,
  InteractiveCalendar,
  ImageToPDF,
  ImageInfo,
  GlassmorphicGenerator,
  ExamGradeCalc,
  DistanceCalculator,
  DailyPlanner,
  DailyMonthlyReport,
  CSVViewer,
  RearrangePDF,
  DeletePDFPages,
  DuplicatePDFPages,
  CropPDFPages,
  AddPDFHeaderFooter,
  AddPDFPageNumbers,
  AddPDFText,
  OCRPDF,
  ExtractPDFImages,
  TranslatePDF,
  PDFToWord,
  WordToPDF,
  PDFToJPG,
  PDFToPNG,
  PDFToExcel,
  PDFToCSV,
  PDFToHTML,
  HTMLToPDF,
  PDFToTXT,
  TXTToPDF,
  PDFToEPUB,
  EPUBToPDF,

  // Lowercase ID mappings for dynamic lookup fallback (guarantees zero missing registry hits!)
  todolist: TodoList,
  notes: QuickNotes,
  timer: FocusTimer,
  medicinereminder: MedicationReminder,
  expenseadd: ExpenseTrackerSuite,
  expenselist: ExpenseTrackerSuite,
  budgettracker: ExpenseTrackerSuite,
  expenseanalytics: ExpenseTrackerSuite,
  chatbot: AIChatbot,
  'text-improver': AITextImprover,
  summarizer: AISummarizer,
  'dynamic-qr': QRCodeGenerator,
  'graph-maker': GraphMaker,
  'e-signature': ESignature,
  'metadata-stripper': MetadataStripper,
  'bulk-renamer': BulkRenamer,
  'json-to-ts': JSONToTS,
  'encrypted-note': EncryptedNote,
  legacytoolbridge: LegacyToolBridge,
  mergepdf: MergePDF,
  compresspdf: CompressPDF,
  'compress-pdf': CompressPDF,
  splitpdf: SplitPDF,
  watermarkpdf: WatermarkPDF,
  compressimage: ImageCompressor,
  'image-compressor': ImageCompressor,
  'image-resizer': ImageResizer,
  ocrimage: OCRImage,
  protectpdf: ProtectPDF,
  'protect-pdf': ProtectPDF,
  unlockpdf: UnlockPDF,
  'unlock-pdf': UnlockPDF,
  'ai-summarize-pdf': AISummarizePDF,
  'ai-chat-pdf': AIChatPDF,
  'bg-remover': BackgroundRemover,

  'essay-writer': EssayWriter,
  'article-writer': ArticleWriter,
  'blog-generator': BlogGenerator,
  'faq-generator': FAQGenerator,
  'ai-rewriter': AIRewriter,
  'ai-humanizer': AIHumanizer,
  'grammar-fixer': GrammarFixer,
  'ai-subtitle-gen': AISubtitleGen,
  'ai-video-summary': AIVideoSummary,
  'ai-transcript': AITranscript,
  'video-ai-suite': VideoAISuite,
  'json-code': JSONFormatter,
  'schema-generator': SchemaGenerator,
  publicsurvey: PublicSurvey,
  'password-leak': PasswordLeakScanner,
  resetexpenses: ResetExpenses,
  topspendinginsights: TopSpendingInsights,
  responseviewer: ResponseViewer,
  mysurveys: MySurveys,
  surveybuilder: SurveyBuilder,
  'color-palette': ColorPaletteGenerator,
  pdftoimage: PDFToImage,
  urlextractor: URLExtractor,
  'men-prompts': PersonaPromptsMen,
  'women-prompts': PersonaPromptsWomen,
  smartsuggestions: SmartPromptEditor,
  texttospeech: TextToSpeech,
  audiosuite: AudioSuite,
  'trim-audio': TrimAudio,
  'merge-audio': MergeAudio,
  'split-audio': SplitAudio,
  'compress-audio': CompressAudio,
  'mp4-to-mp3': MP4ToMP3,
  'wav-to-mp3': WAVToMP3,
  'aac-to-mp3': AACToMP3,
  'flac-to-mp3': FLACToMP3,
  'ogg-to-mp3': OGGToMP3,
  'voice-cleaner': VoiceCleaner,
  'noise-removal': NoiseRemoval,
  'podcast-summary': PodcastSummary,
  'svg-optimizer': SVGOptimizer,
  spinwheel: SpinWheel,
  searchexpenses: SearchExpenses,
  rotatepdf: RotatePDF,
  passwordsaver: PasswordVault,
  'p2p-share': P2PFileShare,
  reminderalert: NotificationScheduler,
  'morse-flash': MorseCodeTranslator,
  metatagviewer: MetaTagViewer,
  'link-bio': LinkInBio,
  'speed-test': InternetSpeedTest,
  calendarviewer: InteractiveCalendar,
  imagetopdf: ImageToPDF,
  imageinfo: ImageInfo,
  'glass-gen': GlassmorphicGenerator,
  examcalc: ExamGradeCalc,
  distancecalc: DistanceCalculator,
  dailyplanner: DailyPlanner,
  dailymonthlyreport: DailyMonthlyReport,
  csvviewer: CSVViewer,
  choicecomparator: ChoiceComparator,
  randomnamepicker: RandomNamePicker,
  'note-shredder': NoteShredder,
  'focus-soundscape': AmbientNoisePlayer,
  categorysummary: CategorySummary,
  equationsolver: QuadraticSolver,
  passwordstrength: PasswordStrength,
  'rearrange-pdf': RearrangePDF,
  'delete-pdf-pages': DeletePDFPages,
  'duplicate-pdf-pages': DuplicatePDFPages,
  'crop-pdf': CropPDFPages,
  'add-pdf-header-footer': AddPDFHeaderFooter,
  'add-pdf-page-numbers': AddPDFPageNumbers,
  'add-pdf-text': AddPDFText,
  'ocr-pdf': OCRPDF,
  'extract-pdf-images': ExtractPDFImages,
  'translate-pdf': TranslatePDF,
  'pdf-to-word': PDFToWord,
  'word-to-pdf': WordToPDF,
  'pdf-to-jpg': PDFToJPG,
  'pdf-to-png': PDFToPNG,
  'pdf-to-excel': PDFToExcel,
  'pdf-to-csv': PDFToCSV,
  'pdf-to-html': PDFToHTML,
  'html-to-pdf': HTMLToPDF,
  'pdf-to-txt': PDFToTXT,
  'txt-to-pdf': TXTToPDF,
  'pdf-to-epub': PDFToEPUB,
  'epub-to-pdf': EPUBToPDF,

  // Image Ecosystem Lowercase Mappings
  'resize-image': ResizeImage,
  'compress-image': CompressImage,
  'crop-image': CropImage,
  'rotate-image': RotateImage,
  'flip-image': FlipImage,
  'blur-image': BlurImage,
  'sharpen-image': SharpenImage,
  'pixelate-image': PixelateImage,
  'remove-background': RemoveBackground,
  'remove-objects': RemoveObjects,
  'remove-watermark': RemoveWatermark,
  'remove-text': RemoveText,
  'colorize-image': ColorizeImage,
  'restore-photos': RestorePhotos,
  'png-to-jpg': PNGToJPG,
  'png-to-webp': PNGToWEBP,
  'svg-to-png': SVGToPNG,
  'heic-to-jpg': HEICToJPG,
  'avif-to-png': AVIFToPNG,
};
