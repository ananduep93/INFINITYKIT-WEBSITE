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
const QRCodeGenerator    = dynamic(() => import('./QRCodeGenerator'),   { ssr: false, loading: LoadingSkeleton });
const GraphMaker         = dynamic(() => import('./GraphMaker'),        { ssr: false, loading: LoadingSkeleton });
const ESignature         = dynamic(() => import('./ESignature'),        { ssr: false, loading: LoadingSkeleton });
const MetadataStripper   = dynamic(() => import('./MetadataStripper'),  { ssr: false, loading: LoadingSkeleton });
const BulkRenamer        = dynamic(() => import('./BulkRenamer'),       { ssr: false, loading: LoadingSkeleton });
const JSONToTS           = dynamic(() => import('./JSONToTS'),          { ssr: false, loading: LoadingSkeleton });
const EncryptedNote      = dynamic(() => import('./EncryptedNote'),     { ssr: false, loading: LoadingSkeleton });
const LegacyToolBridge   = dynamic(() => import('./LegacyToolBridge'),  { ssr: false, loading: LoadingSkeleton });
const MergePDF           = dynamic(() => import('./MergePDF'),          { ssr: false, loading: LoadingSkeleton });
const CompressPDF        = dynamic(() => import('./CompressPDF'),       { ssr: false, loading: LoadingSkeleton });
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
const ExtractAudio       = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ExtractAudioWrapper), { ssr: false, loading: LoadingSkeleton });
const VideoToGIF         = dynamic(() => import('./VideoSuiteWrappers').then(m => m.VideoToGIFWrapper), { ssr: false, loading: LoadingSkeleton });
const EssayWriter        = dynamic(() => import('./EssayWriter'),       { ssr: false, loading: LoadingSkeleton });
const ArticleWriter      = dynamic(() => import('./ArticleWriter'),     { ssr: false, loading: LoadingSkeleton });
const BlogGenerator      = dynamic(() => import('./BlogGenerator'),     { ssr: false, loading: LoadingSkeleton });
const FAQGenerator       = dynamic(() => import('./FAQGenerator'),      { ssr: false, loading: LoadingSkeleton });
const AIRewriter         = dynamic(() => import('./AIRewriter'),        { ssr: false, loading: LoadingSkeleton });
const AIHumanizer        = dynamic(() => import('./AIHumanizer'),       { ssr: false, loading: LoadingSkeleton });
const GrammarFixer       = dynamic(() => import('./GrammarFixer'),      { ssr: false, loading: LoadingSkeleton });
const SubtitlesGenerator = dynamic(() => import('./VideoSuiteWrappers').then(m => m.AISubtitleGen), { ssr: false, loading: LoadingSkeleton });
const VideoTranscription = dynamic(() => import('./VideoSuiteWrappers').then(m => m.AITranscript), { ssr: false, loading: LoadingSkeleton });

// Dynamic imports for the new 21 video ecosystem tools
const CompressVideo      = dynamic(() => import('./VideoSuiteWrappers').then(m => m.CompressVideo), { ssr: false, loading: LoadingSkeleton });
const TrimVideo          = dynamic(() => import('./VideoSuiteWrappers').then(m => m.TrimVideo), { ssr: false, loading: LoadingSkeleton });
const CropVideo          = dynamic(() => import('./VideoSuiteWrappers').then(m => m.CropVideo), { ssr: false, loading: LoadingSkeleton });
const ResizeVideo        = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ResizeVideo), { ssr: false, loading: LoadingSkeleton });
const RotateVideo        = dynamic(() => import('./VideoSuiteWrappers').then(m => m.RotateVideo), { ssr: false, loading: LoadingSkeleton });
const ReverseVideo       = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ReverseVideo), { ssr: false, loading: LoadingSkeleton });
const MergeVideo         = dynamic(() => import('./VideoSuiteWrappers').then(m => m.MergeVideo), { ssr: false, loading: LoadingSkeleton });
const SplitVideo         = dynamic(() => import('./VideoSuiteWrappers').then(m => m.SplitVideo), { ssr: false, loading: LoadingSkeleton });
const ConvertMp4Mov      = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ConvertMp4Mov), { ssr: false, loading: LoadingSkeleton });
const ConvertMovMp4      = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ConvertMovMp4), { ssr: false, loading: LoadingSkeleton });
const ConvertMp4Webm     = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ConvertMp4Webm), { ssr: false, loading: LoadingSkeleton });
const ConvertWebmMp4     = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ConvertWebmMp4), { ssr: false, loading: LoadingSkeleton });
const ConvertMkvMp4      = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ConvertMkvMp4), { ssr: false, loading: LoadingSkeleton });
const ConvertMp4Mkv      = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ConvertMp4Mkv), { ssr: false, loading: LoadingSkeleton });
const ConvertAviMp4      = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ConvertAviMp4), { ssr: false, loading: LoadingSkeleton });
const ConvertMp4Avi      = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ConvertMp4Avi), { ssr: false, loading: LoadingSkeleton });
const AISubtitleGen      = dynamic(() => import('./VideoSuiteWrappers').then(m => m.AISubtitleGen), { ssr: false, loading: LoadingSkeleton });
const AIVideoSummary     = dynamic(() => import('./VideoSuiteWrappers').then(m => m.AIVideoSummary), { ssr: false, loading: LoadingSkeleton });
const AITranscript       = dynamic(() => import('./VideoSuiteWrappers').then(m => m.AITranscript), { ssr: false, loading: LoadingSkeleton });
const MuteVideo          = dynamic(() => import('./VideoSuiteWrappers').then(m => m.MuteVideo), { ssr: false, loading: LoadingSkeleton });
const ThumbnailExtractor = dynamic(() => import('./VideoSuiteWrappers').then(m => m.ThumbnailExtractor), { ssr: false, loading: LoadingSkeleton });
const VideoEditorSuite   = dynamic(() => import('./VideoEditorSuite'),   { ssr: false, loading: LoadingSkeleton });
const VideoConverterSuite= dynamic(() => import('./VideoConverterSuite'),{ ssr: false, loading: LoadingSkeleton });
const VideoAISuite       = dynamic(() => import('./VideoAISuite'),       { ssr: false, loading: LoadingSkeleton });
const VideoUtilitiesSuite= dynamic(() => import('./VideoUtilitiesSuite'),{ ssr: false, loading: LoadingSkeleton });
const JSONFormatter      = dynamic(() => import('./JSONFormatter'),      { ssr: false, loading: LoadingSkeleton });
const SchemaGenerator    = dynamic(() => import('./SchemaGenerator'),   { ssr: false, loading: LoadingSkeleton });
const PublicSurvey       = dynamic(() => import('./PublicSurvey'),      { ssr: false, loading: LoadingSkeleton });
const PasswordLeakScanner  = dynamic(() => import('./PasswordLeakScanner'), { ssr: false, loading: LoadingSkeleton });

const ResetExpenses        = dynamic(() => import('./ResetExpenses'), { ssr: false, loading: LoadingSkeleton });

const TopSpendingInsights  = dynamic(() => import('./TopSpendingInsights'), { ssr: false, loading: LoadingSkeleton });

const ResponseViewer       = dynamic(() => import('./ResponseViewer'), { ssr: false, loading: LoadingSkeleton });

const MySurveys            = dynamic(() => import('./MySurveys'), { ssr: false, loading: LoadingSkeleton });

const SurveyBuilder        = dynamic(() => import('./SurveyBuilder'), { ssr: false, loading: LoadingSkeleton });

const ColorPaletteGenerator = dynamic(() => import('./ColorPaletteGenerator'), { ssr: false, loading: LoadingSkeleton });

const PDFToImage           = dynamic(() => import('./PDFToImage'), { ssr: false, loading: LoadingSkeleton });

const URLExtractor         = dynamic(() => import('./URLExtractor'), { ssr: false, loading: LoadingSkeleton });

const PersonaPromptsMen    = dynamic(() => import('./PersonaPromptsMen'),   { ssr: false, loading: LoadingSkeleton });
const PersonaPromptsWomen  = dynamic(() => import('./PersonaPromptsWomen'), { ssr: false, loading: LoadingSkeleton });
const SmartPromptEditor    = dynamic(() => import('./SmartPromptEditor'),   { ssr: false, loading: LoadingSkeleton });

const RearrangePDF          = dynamic(() => import('./RearrangePDF'),          { ssr: false, loading: LoadingSkeleton });
const DeletePDFPages        = dynamic(() => import('./DeletePDFPages'),        { ssr: false, loading: LoadingSkeleton });
const DuplicatePDFPages     = dynamic(() => import('./DuplicatePDFPages'),     { ssr: false, loading: LoadingSkeleton });
const CropPDFPages          = dynamic(() => import('./CropPDFPages'),          { ssr: false, loading: LoadingSkeleton });
const AddPDFHeaderFooter    = dynamic(() => import('./AddPDFHeaderFooter'),    { ssr: false, loading: LoadingSkeleton });
const AddPDFPageNumbers     = dynamic(() => import('./AddPDFPageNumbers'),     { ssr: false, loading: LoadingSkeleton });
const AddPDFText            = dynamic(() => import('./AddPDFText'),            { ssr: false, loading: LoadingSkeleton });
const RemovePDFRestrictions = dynamic(() => import('./RemovePDFRestrictions'), { ssr: false, loading: LoadingSkeleton });
const OCRPDF                = dynamic(() => import('./OCRPDF'),                { ssr: false, loading: LoadingSkeleton });
const ExtractPDFText        = dynamic(() => import('./ExtractPDFText'),        { ssr: false, loading: LoadingSkeleton });
const ExtractPDFImages      = dynamic(() => import('./ExtractPDFImages'),      { ssr: false, loading: LoadingSkeleton });
const TranslatePDF          = dynamic(() => import('./TranslatePDF'),          { ssr: false, loading: LoadingSkeleton });
const PDFToWord             = dynamic(() => import('./PDFToWord'),             { ssr: false, loading: LoadingSkeleton });
const WordToPDF             = dynamic(() => import('./WordToPDF'),             { ssr: false, loading: LoadingSkeleton });
const PDFToJPG              = dynamic(() => import('./PDFToJPG'),              { ssr: false, loading: LoadingSkeleton });
const PDFToPNG              = dynamic(() => import('./PDFToPNG'),              { ssr: false, loading: LoadingSkeleton });
const PDFToExcel            = dynamic(() => import('./PDFToExcel'),            { ssr: false, loading: LoadingSkeleton });
const PDFToCSV              = dynamic(() => import('./PDFToCSV'),              { ssr: false, loading: LoadingSkeleton });
const PDFToHTML             = dynamic(() => import('./PDFToHTML'),             { ssr: false, loading: LoadingSkeleton });
const HTMLToPDF             = dynamic(() => import('./HTMLToPDF'),             { ssr: false, loading: LoadingSkeleton });
const PDFToTXT              = dynamic(() => import('./PDFToTXT'),              { ssr: false, loading: LoadingSkeleton });
const TXTToPDF              = dynamic(() => import('./TXTToPDF'),              { ssr: false, loading: LoadingSkeleton });
const PDFToEPUB             = dynamic(() => import('./PDFToEPUB'),             { ssr: false, loading: LoadingSkeleton });
const EPUBToPDF             = dynamic(() => import('./EPUBToPDF'),             { ssr: false, loading: LoadingSkeleton });

// Image Editing Wrappers
const ResizeImage           = dynamic(() => import('./ResizeImage'),           { ssr: false, loading: LoadingSkeleton });
const CompressImage         = dynamic(() => import('./CompressImage'),         { ssr: false, loading: LoadingSkeleton });
const CropImage             = dynamic(() => import('./CropImage'),             { ssr: false, loading: LoadingSkeleton });
const RotateImage           = dynamic(() => import('./RotateImage'),           { ssr: false, loading: LoadingSkeleton });
const FlipImage             = dynamic(() => import('./FlipImage'),             { ssr: false, loading: LoadingSkeleton });
const BlurImage             = dynamic(() => import('./BlurImage'),             { ssr: false, loading: LoadingSkeleton });
const SharpenImage          = dynamic(() => import('./SharpenImage'),          { ssr: false, loading: LoadingSkeleton });
const PixelateImage         = dynamic(() => import('./PixelateImage'),         { ssr: false, loading: LoadingSkeleton });


// Image AI Editing Wrappers
const RemoveBackground      = dynamic(() => import('./RemoveBackground'),      { ssr: false, loading: LoadingSkeleton });
const RemoveObjects         = dynamic(() => import('./RemoveObjects'),         { ssr: false, loading: LoadingSkeleton });
const RemoveWatermark       = dynamic(() => import('./RemoveWatermark'),       { ssr: false, loading: LoadingSkeleton });
const RemoveText            = dynamic(() => import('./RemoveText'),            { ssr: false, loading: LoadingSkeleton });
const ColorizeImage         = dynamic(() => import('./ColorizeImage'),         { ssr: false, loading: LoadingSkeleton });
const RestorePhotos         = dynamic(() => import('./RestorePhotos'),         { ssr: false, loading: LoadingSkeleton });

// Converter Wrappers
const PNGToJPG              = dynamic(() => import('./PNGToJPG'),              { ssr: false, loading: LoadingSkeleton });
const PNGToWEBP             = dynamic(() => import('./PNGToWEBP'),             { ssr: false, loading: LoadingSkeleton });
const SVGToPNG              = dynamic(() => import('./SVGToPNG'),              { ssr: false, loading: LoadingSkeleton });
const HEICToJPG             = dynamic(() => import('./HEICToJPG'),             { ssr: false, loading: LoadingSkeleton });
const AVIFToPNG             = dynamic(() => import('./AVIFToPNG'),             { ssr: false, loading: LoadingSkeleton });



const TextToSpeech         = dynamic(() => import('./TextToSpeech'), { ssr: false, loading: LoadingSkeleton });

const SVGOptimizer         = dynamic(() => import('./SVGOptimizer'), { ssr: false, loading: LoadingSkeleton });

const SpinWheel            = dynamic(() => import('./SpinWheel'), { ssr: false, loading: LoadingSkeleton });

const SearchExpenses       = dynamic(() => import('./SearchExpenses'), { ssr: false, loading: LoadingSkeleton });

const RotatePDF            = dynamic(() => import('./RotatePDF'), { ssr: false, loading: LoadingSkeleton });

const PasswordVault        = dynamic(() => import('./PasswordVault'), { ssr: false, loading: LoadingSkeleton });

const P2PFileShare         = dynamic(() => import('./P2PFileShare'), { ssr: false, loading: LoadingSkeleton });

const NotificationScheduler = dynamic(() => import('./NotificationScheduler'), { ssr: false, loading: LoadingSkeleton });

const MorseCodeTranslator  = dynamic(() => import('./MorseCodeTranslator'), { ssr: false, loading: LoadingSkeleton });

const MetaTagViewer        = dynamic(() => import('./MetaTagViewer'), { ssr: false, loading: LoadingSkeleton });

const LinkInBio            = dynamic(() => import('./LinkInBio'), { ssr: false, loading: LoadingSkeleton });

const InternetSpeedTest    = dynamic(() => import('./InternetSpeedTest'), { ssr: false, loading: LoadingSkeleton });

const InteractiveCalendar  = dynamic(() => import('./InteractiveCalendar'), { ssr: false, loading: LoadingSkeleton });

const ImageToPDF           = dynamic(() => import('./ImageToPDF'), { ssr: false, loading: LoadingSkeleton });

const ImageInfo            = dynamic(() => import('./ImageInfo'), { ssr: false, loading: LoadingSkeleton });

const GlassmorphicGenerator = dynamic(() => import('./GlassmorphicGenerator'), { ssr: false, loading: LoadingSkeleton });

const ExamGradeCalc        = dynamic(() => import('./ExamGradeCalc'), { ssr: false, loading: LoadingSkeleton });

const DistanceCalculator   = dynamic(() => import('./DistanceCalculator'), { ssr: false, loading: LoadingSkeleton });

const DailyPlanner         = dynamic(() => import('./DailyPlanner'), { ssr: false, loading: LoadingSkeleton });

const DailyMonthlyReport   = dynamic(() => import('./DailyMonthlyReport'), { ssr: false, loading: LoadingSkeleton });

const CSVViewer            = dynamic(() => import('./CSVViewer'), { ssr: false, loading: LoadingSkeleton });

const ChoiceComparator     = dynamic(() => import('./ChoiceComparator'), { ssr: false, loading: LoadingSkeleton });
const RandomNamePicker     = dynamic(() => import('./RandomNamePicker'),     { ssr: false, loading: LoadingSkeleton });
const NoteShredder         = dynamic(() => import('./NoteShredder'),         { ssr: false, loading: LoadingSkeleton });
const AmbientNoisePlayer   = dynamic(() => import('./AmbientNoisePlayer'),   { ssr: false, loading: LoadingSkeleton });
const CategorySummary      = dynamic(() => import('./CategorySummary'),      { ssr: false, loading: LoadingSkeleton });
const QuadraticSolver      = dynamic(() => import('./QuadraticSolver'),      { ssr: false, loading: LoadingSkeleton });
const PasswordStrength     = dynamic(() => import('./PasswordStrength'),     { ssr: false, loading: LoadingSkeleton });



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
  CompressVideo,
  TrimVideo,
  CropVideo,
  ResizeVideo,
  RotateVideo,
  ReverseVideo,
  MergeVideo,
  SplitVideo,
  ConvertMp4Mov,
  ConvertMovMp4,
  ConvertMp4Webm,
  ConvertWebmMp4,
  ConvertMkvMp4,
  ConvertMp4Mkv,
  ConvertAviMp4,
  ConvertMp4Avi,
  AISubtitleGen,
  AIVideoSummary,
  AITranscript,
  MuteVideo,
  ThumbnailExtractor,
  VideoEditorSuite,
  VideoConverterSuite,
  VideoAISuite,
  VideoUtilitiesSuite,
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
  RemovePDFRestrictions,
  OCRPDF,
  ExtractPDFText,
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
  CompressVideo,
  TrimVideo,
  CropVideo,
  ResizeVideo,
  RotateVideo,
  ReverseVideo,
  MergeVideo,
  SplitVideo,
  ConvertMp4Mov,
  ConvertMovMp4,
  ConvertMp4Webm,
  ConvertWebmMp4,
  ConvertMkvMp4,
  ConvertMp4Mkv,
  ConvertAviMp4,
  ConvertMp4Avi,
  AISubtitleGen,
  AIVideoSummary,
  AITranscript,
  MuteVideo,
  ThumbnailExtractor,
  VideoEditorSuite,
  VideoConverterSuite,
  VideoAISuite,
  VideoUtilitiesSuite,
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
  RemovePDFRestrictions,
  OCRPDF,
  ExtractPDFText,
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
  'blur-background': BlurBackground,
  'extract-audio': ExtractAudio,
  'video-to-gif': VideoToGIF,
  'essay-writer': EssayWriter,
  'article-writer': ArticleWriter,
  'blog-generator': BlogGenerator,
  'faq-generator': FAQGenerator,
  'ai-rewriter': AIRewriter,
  'ai-humanizer': AIHumanizer,
  'grammar-fixer': GrammarFixer,
  'subtitles-generator': SubtitlesGenerator,
  'video-transcription': VideoTranscription,
  'compress-video': CompressVideo,
  'trim-video': TrimVideo,
  'crop-video': CropVideo,
  'resize-video': ResizeVideo,
  'rotate-video': RotateVideo,
  'reverse-video': ReverseVideo,
  'merge-video': MergeVideo,
  'split-video': SplitVideo,
  'convert-mp4-mov': ConvertMp4Mov,
  'convert-mov-mp4': ConvertMovMp4,
  'convert-mp4-webm': ConvertMp4Webm,
  'convert-webm-mp4': ConvertWebmMp4,
  'convert-mkv-mp4': ConvertMkvMp4,
  'convert-mp4-mkv': ConvertMp4Mkv,
  'convert-avi-mp4': ConvertAviMp4,
  'convert-mp4-avi': ConvertMp4Avi,
  'ai-subtitle-gen': AISubtitleGen,
  'ai-video-summary': AIVideoSummary,
  'ai-transcript': AITranscript,
  'mute-video': MuteVideo,
  'thumbnail-extractor': ThumbnailExtractor,
  'video-editor-suite': VideoEditorSuite,
  'video-converter-suite': VideoConverterSuite,
  'video-ai-suite': VideoAISuite,
  'video-utilities-suite': VideoUtilitiesSuite,
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
  'remove-pdf-restrictions': RemovePDFRestrictions,
  'ocr-pdf': OCRPDF,
  'extract-pdf-text': ExtractPDFText,
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
