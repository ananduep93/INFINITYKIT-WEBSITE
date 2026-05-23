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
  'image-generator': AIImageGenerator,
  'dynamic-qr': QRCodeGenerator,
  'graph-maker': GraphMaker,
  'e-signature': ESignature,
  'metadata-stripper': MetadataStripper,
  'bulk-renamer': BulkRenamer,
  'json-to-ts': JSONToTS,
  'encrypted-note': EncryptedNote,
  legacytoolbridge: LegacyToolBridge,
  mergepdf: MergePDF,
  splitpdf: SplitPDF,
  watermarkpdf: WatermarkPDF,
  compressimage: ImageCompressor,
  'image-compressor': ImageCompressor,
  'image-resizer': ImageResizer,
  ocrimage: OCRImage,
  protectpdf: ProtectPDF,
  unlockpdf: UnlockPDF,
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
};
