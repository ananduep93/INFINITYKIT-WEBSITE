const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT';

// Folders to move to src/
const sourceFolders = ['app', 'components', 'hooks', 'lib', 'styles', 'config'];
const sourceFiles = ['middleware.ts'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 1. Create src/ directory and move source files/folders
console.log('--- Phase 1: Moving files to src/ ---');
const srcDir = path.join(rootDir, 'src');
ensureDir(srcDir);

sourceFolders.forEach(folder => {
  const oldPath = path.join(rootDir, folder);
  const newPath = path.join(srcDir, folder);
  if (fs.existsSync(oldPath)) {
    console.log(`Moving ${folder} to src/${folder}`);
    fs.renameSync(oldPath, newPath);
  } else {
    console.log(`Folder ${folder} already moved or does not exist at root.`);
  }
});

sourceFiles.forEach(file => {
  const oldPath = path.join(rootDir, file);
  const newPath = path.join(srcDir, file);
  if (fs.existsSync(oldPath)) {
    console.log(`Moving ${file} to src/${file}`);
    fs.renameSync(oldPath, newPath);
  } else {
    console.log(`File ${file} already moved or does not exist at root.`);
  }
});

// 2. Restructure components directory
console.log('\n--- Phase 2: Restructuring components/ ---');
const compDir = path.join(srcDir, 'components');
const commonDir = path.join(compDir, 'common');
const layoutDir = path.join(compDir, 'layout');
const uiDir = path.join(compDir, 'ui');
const toolCardsDir = path.join(compDir, 'tool-cards');

ensureDir(commonDir);
ensureDir(layoutDir);
ensureDir(uiDir);
ensureDir(toolCardsDir);

// Move layouts/common components from components/ui/ or components/
// - ThemeProvider.tsx -> components/layout/ThemeProvider.tsx
const oldTheme = path.join(compDir, 'ThemeProvider.tsx');
const newTheme = path.join(layoutDir, 'ThemeProvider.tsx');
if (fs.existsSync(oldTheme)) {
  console.log('Moving ThemeProvider.tsx to components/layout/');
  fs.renameSync(oldTheme, newTheme);
}

// - ClientLayout.tsx -> components/layout/ClientLayout.tsx
const oldClientLayout = path.join(uiDir, 'ClientLayout.tsx');
const newClientLayout = path.join(layoutDir, 'ClientLayout.tsx');
if (fs.existsSync(oldClientLayout)) {
  console.log('Moving ClientLayout.tsx to components/layout/');
  fs.renameSync(oldClientLayout, newClientLayout);
}

// - PageProgressBar.tsx -> components/layout/PageProgressBar.tsx
const oldProgressBar = path.join(uiDir, 'PageProgressBar.tsx');
const newProgressBar = path.join(layoutDir, 'PageProgressBar.tsx');
if (fs.existsSync(oldProgressBar)) {
  console.log('Moving PageProgressBar.tsx to components/layout/');
  fs.renameSync(oldProgressBar, newProgressBar);
}

// - ThreeBackground.tsx -> components/layout/ThreeBackground.tsx
const oldThreeBg = path.join(uiDir, 'ThreeBackground.tsx');
const newThreeBg = path.join(layoutDir, 'ThreeBackground.tsx');
if (fs.existsSync(oldThreeBg)) {
  console.log('Moving ThreeBackground.tsx to components/layout/');
  fs.renameSync(oldThreeBg, newThreeBg);
}


// 3. Reorganize custom tools into category-based subfolders
console.log('\n--- Phase 3: Reorganizing tools ---');
const oldToolsDir = path.join(compDir, 'tools');
const newToolsDir = path.join(srcDir, 'tools');
ensureDir(newToolsDir);

// Reorganize files into 6 main target folders and subfolders
const toolsReorg = {
  // pdf
  'AddPDFHeaderFooter.tsx': 'pdf/pdf-markup',
  'AddPDFPageNumbers.tsx': 'pdf/pdf-markup',
  'AddPDFText.tsx': 'pdf/pdf-markup',
  'WatermarkPDF.tsx': 'pdf/pdf-markup',
  'PDFMarkupSuite.tsx': 'pdf/pdf-markup',
  
  'CropPDFPages.tsx': 'pdf/pdf-editor',
  'DeletePDFPages.tsx': 'pdf/pdf-editor',
  'DuplicatePDFPages.tsx': 'pdf/pdf-editor',
  'MergePDF.tsx': 'pdf/pdf-editor',
  'RearrangePDF.tsx': 'pdf/pdf-editor',
  'RotatePDF.tsx': 'pdf/pdf-editor',
  'SplitPDF.tsx': 'pdf/pdf-editor',
  'PDFPageEditor.tsx': 'pdf/pdf-editor',
  
  'ProtectPDF.tsx': 'pdf/pdf-security',
  'UnlockPDF.tsx': 'pdf/pdf-security',
  'PDFSecuritySuite.tsx': 'pdf/pdf-security',
  
  'OCRPDF.tsx': 'pdf/pdf-ocr',
  'PDFToWord.tsx': 'pdf/pdf-to-word',
  'WordToPDF.tsx': 'pdf/word-to-pdf',
  'PDFToImage.tsx': 'pdf/pdf-to-image',
  'ImageToPDF.tsx': 'pdf/image-to-pdf',
  'PDFToCSV.tsx': 'pdf/pdf-to-csv',
  'PDFToExcel.tsx': 'pdf/pdf-to-excel',
  'PDFToHTML.tsx': 'pdf/pdf-to-html',
  'PDFToJPG.tsx': 'pdf/pdf-to-jpg',
  'PDFToPNG.tsx': 'pdf/pdf-to-png',
  'PDFToTXT.tsx': 'pdf/pdf-to-txt',
  'TXTToPDF.tsx': 'pdf/txt-to-pdf',
  'PDFToEPUB.tsx': 'pdf/pdf-to-epub',
  'EPUBToPDF.tsx': 'pdf/epub-to-pdf',
  'HTMLToPDF.tsx': 'pdf/html-to-pdf',
  'TranslatePDF.tsx': 'pdf/translate-pdf',
  'AISummarizePDF.tsx': 'pdf/ai-summarize-pdf',
  'AIChatPDF.tsx': 'pdf/ai-chat-pdf',
  'ExtractPDFImages.tsx': 'pdf/extract-pdf-images',

  // image
  'ImageConverterSuite.tsx': 'image/image-converter',
  'AVIFToPNG.tsx': 'image/image-converter',
  'HEICToJPG.tsx': 'image/image-converter',
  'PNGToJPG.tsx': 'image/image-converter',
  'PNGToWEBP.tsx': 'image/image-converter',
  'SVGToPNG.tsx': 'image/image-converter',
  
  'ImageEditorSuite.tsx': 'image/image-editor',
  'ResizeImage.tsx': 'image/image-editor',
  'CompressImage.tsx': 'image/image-editor',
  'CropImage.tsx': 'image/image-editor',
  'RotateImage.tsx': 'image/image-editor',
  'FlipImage.tsx': 'image/image-editor',
  'BlurImage.tsx': 'image/image-editor',
  'SharpenImage.tsx': 'image/image-editor',
  'PixelateImage.tsx': 'image/image-editor',
  
  'ImageAISuite.tsx': 'image/image-ai',
  'RemoveBackground.tsx': 'image/image-ai',
  'RemoveObjects.tsx': 'image/image-ai',
  'RemoveWatermark.tsx': 'image/image-ai',
  'RemoveText.tsx': 'image/image-ai',
  'ColorizeImage.tsx': 'image/image-ai',
  'RestorePhotos.tsx': 'image/image-ai',
  'BackgroundRemover.tsx': 'image/image-ai',
  
  'ImageCompressor.tsx': 'image/image-compressor',
  'ImageResizer.tsx': 'image/image-resizer',
  'OCRImage.tsx': 'image/ocr-image',
  'ImageInfo.tsx': 'image/image-info',
  'ColorPaletteGenerator.tsx': 'image/color-palette',
  'MetadataStripper.tsx': 'image/metadata-stripper',

  // ai
  'AIChatbot.tsx': 'ai/ai-chat',
  'AISummarizer.tsx': 'ai/summarizer',
  'AITextImprover.tsx': 'ai/text-improver',
  'EssayWriter.tsx': 'ai/essay-writer',
  'ArticleWriter.tsx': 'ai/article-writer',
  'BlogGenerator.tsx': 'ai/blog-generator',
  'FAQGenerator.tsx': 'ai/faq-generator',
  'AIRewriter.tsx': 'ai/ai-rewriter',
  'AIHumanizer.tsx': 'ai/ai-humanizer',
  'GrammarFixer.tsx': 'ai/grammar-fixer',
  'PersonaPromptsMen.tsx': 'ai/men-prompts',
  'PersonaPromptsWomen.tsx': 'ai/women-prompts',
  'SmartPromptEditor.tsx': 'ai/smartsuggestions',
  'VideoAISuite.tsx': 'ai/video-ai',
  'VideoSuiteWrappers.tsx': 'ai/video-ai',

  // productivity
  'TodoList.tsx': 'productivity/todo',
  'QuickNotes.tsx': 'productivity/notes',
  'EncryptedNote.tsx': 'productivity/encrypted-note',
  'NoteShredder.tsx': 'productivity/note-shredder',
  'FocusTimer.tsx': 'productivity/timer',
  'NotificationScheduler.tsx': 'productivity/reminderalert',
  'MedicationReminder.tsx': 'productivity/medicinereminder',
  'DailyPlanner.tsx': 'productivity/dailyplanner',
  'InteractiveCalendar.tsx': 'productivity/calendarviewer',
  'ExpenseTrackerSuite.tsx': 'productivity/expense-tracker',
  'ResetExpenses.tsx': 'productivity/expense-tracker',
  'TopSpendingInsights.tsx': 'productivity/expense-tracker',
  'SearchExpenses.tsx': 'productivity/expense-tracker',
  'PasswordVault.tsx': 'productivity/passwordsaver',
  'PasswordStrength.tsx': 'productivity/passwordstrength',
  'PasswordLeakScanner.tsx': 'productivity/password-leak',
  'SurveyBuilder.tsx': 'productivity/survey-builder',
  'MySurveys.tsx': 'productivity/survey-builder',
  'ResponseViewer.tsx': 'productivity/survey-builder',
  'PublicSurvey.tsx': 'productivity/survey-builder',

  // developer
  'JSONFormatter.tsx': 'developer/json-formatter',
  'JSONToTS.tsx': 'developer/json-to-ts',
  'SchemaGenerator.tsx': 'developer/schema-generator',
  'SVGOptimizer.tsx': 'developer/svg-optimizer',
  'GlassmorphicGenerator.tsx': 'developer/glassmorphic-generator',
  'URLExtractor.tsx': 'developer/url-extractor',
  'CSVViewer.tsx': 'developer/csv-viewer',
  'GraphMaker.tsx': 'developer/graph-maker',
  'CategorySummary.tsx': 'developer/category-summary',

  // utilities
  'QRCodeGenerator.tsx': 'utilities/qr-generator',
  'MorseCodeTranslator.tsx': 'utilities/morse-translator',
  'LinkInBio.tsx': 'utilities/link-in-bio',
  'InternetSpeedTest.tsx': 'utilities/speed-test',
  'ExamGradeCalc.tsx': 'utilities/grade-calculator',
  'DistanceCalculator.tsx': 'utilities/distance-calculator',
  'ChoiceComparator.tsx': 'utilities/choice-comparator',
  'RandomNamePicker.tsx': 'utilities/random-picker',
  'AmbientNoisePlayer.tsx': 'utilities/ambient-noise',
  'QuadraticSolver.tsx': 'utilities/quadratic-solver',
  'SpinWheel.tsx': 'utilities/spin-wheel',
  'TextToSpeech.tsx': 'utilities/text-to-speech',
  'AudioSuite.tsx': 'utilities/audio-suite',
  'AudioSuiteWrappers.tsx': 'utilities/audio-suite'
};

const fileNewPaths = {};

// Move tool files to new directory and save their paths
Object.entries(toolsReorg).forEach(([file, destSubdir]) => {
  const oldPath = path.join(oldToolsDir, file);
  if (fs.existsSync(oldPath)) {
    const destDir = path.join(newToolsDir, destSubdir);
    ensureDir(destDir);
    const newPath = path.join(destDir, file);
    fs.renameSync(oldPath, newPath);
    fileNewPaths[file] = path.relative(newToolsDir, newPath).replace(/\\/g, '/');
    console.log(`Moved tool file ${file} to tools/${destSubdir}/${file}`);
  } else {
    // Maybe already moved? Check new path
    const checkPath = path.join(newToolsDir, destSubdir, file);
    if (fs.existsSync(checkPath)) {
      fileNewPaths[file] = path.relative(newToolsDir, checkPath).replace(/\\/g, '/');
    } else {
      console.warn(`Warning: File ${file} not found in ${oldToolsDir}`);
    }
  }
});

// 4. Update imports inside the moved tool files
console.log('\n--- Phase 4: Rewriting imports in tool files ---');
const filesToProcess = [];
function readDirRecursive(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      readDirRecursive(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      filesToProcess.push(fullPath);
    }
  });
}
readDirRecursive(newToolsDir);

filesToProcess.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Let's determine how many folders deep the file is relative to components/
  // The old path was src/components/tools/File.tsx (depth 3 from src/)
  // The new path is src/tools/category/tool-dir/File.tsx (depth 4 from src/)
  // Old component imports:
  // - ../ui/ -> this goes to src/components/ui/
  //   In new path, to get to src/components/ui/ we need: ../../../components/ui/
  content = content.replace(/from\s+['"]\.\.\/ui\/([^'"]+)['"]/g, "from '../../../components/ui/$1'");
  
  // - ../ThemeProvider -> this goes to src/components/layout/ThemeProvider
  content = content.replace(/from\s+['"]\.\.\/ThemeProvider['"]/g, "from '../../../components/layout/ThemeProvider'");

  // - ../../lib/ -> this goes to src/lib/
  //   In new path, to get to src/lib/ we need: ../../../../lib/
  content = content.replace(/from\s+['"]\.\.\/\.\.\/lib\/([^'"]+)['"]/g, "from '../../../../lib/$1'");

  // - ../../hooks/ -> this goes to src/hooks/
  //   In new path, to get to src/hooks/ we need: ../../../../hooks/
  content = content.replace(/from\s+['"]\.\.\/\.\.\/hooks\/([^'"]+)['"]/g, "from '../../../../hooks/$1'");

  // - ../../config/ -> this goes to src/config/
  //   In new path, to get to src/config/ we need: ../../../../config/
  content = content.replace(/from\s+['"]\.\.\/\.\.\/config\/([^'"]+)['"]/g, "from '../../../../config/$1'");

  // - ../../utils/ -> this goes to src/utils/
  content = content.replace(/from\s+['"]\.\.\/\.\.\/utils\/([^'"]+)['"]/g, "from '../../../../utils/$1'");

  // Update specific internal cross-tool imports
  // E.g., HEICToJPG importing ImageConverterSuite:
  // HEICToJPG is in image/image-converter/HEICToJPG.tsx, which imports './ImageConverterSuite'.
  // Since both are in the same folder, './ImageConverterSuite' is still correct!
  // E.g., TextToSpeech.tsx is in utilities/text-to-speech/TextToSpeech.tsx and imports './AudioSuite'.
  // But AudioSuite is in utilities/audio-suite/AudioSuite.tsx.
  // So it needs to import from '../audio-suite/AudioSuite'!
  content = content.replace(/from\s+['"]\.\/AudioSuite['"]/g, "from '../audio-suite/AudioSuite'");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${path.relative(srcDir, filePath)}`);
  }
});


// 5. Update registry index.tsx
console.log('\n--- Phase 5: Rebuilding tools registry index.tsx ---');
const oldRegistryPath = path.join(compDir, 'tools', 'index.tsx');
const newRegistryPath = path.join(compDir, 'tools', 'index.tsx'); // keep it in components/tools/index.tsx or move to components/layout or common?
// Keep it in components/tools/index.tsx to avoid breaking ToolClient.tsx imports!
// Wait! Let's read components/tools/index.tsx if it exists.
let registryContent = '';
if (fs.existsSync(oldRegistryPath)) {
  registryContent = fs.readFileSync(oldRegistryPath, 'utf8');
} else {
  console.error(`Error: Registry file not found at ${oldRegistryPath}`);
  process.exit(1);
}

// Let's rewrite imports of tools in components/tools/index.tsx to point to../../tools/category/tool-dir/component
// In index.tsx:
// const TodoList           = dynamic(() => import('./TodoList'),          { ssr: false, loading: LoadingSkeleton });
// Becomes:
// const TodoList           = dynamic(() => import('../../tools/productivity/todo/TodoList'),          { ssr: false, loading: LoadingSkeleton });
//
// We can use a regex to replace each import('./File') with import('../../tools/relative-path-to-file-without-extension')

// Let's parse all dynamic imports in index.tsx
const importRegex = /(import\(')(\.\/)([^']+)('\))/g;
let updatedRegistryContent = registryContent.replace(importRegex, (match, p1, p2, p3, p4) => {
  const componentName = p3.split('.').shift();
  // Find which file this component matches
  // E.g., TodoList matches TodoList.tsx. What about VideoSuiteWrappers.then(...)?
  // Yes, p3 could be VideoSuiteWrappers
  const fileName = componentName + '.tsx';
  const newRelativePath = fileNewPaths[fileName];
  
  if (newRelativePath) {
    // Remove the extension .tsx for Next.js dynamic import
    const newImportPath = '../../tools/' + newRelativePath.replace(/\.tsx$/, '');
    return `${p1}${newImportPath}${p4}`;
  }
  return match;
});

fs.writeFileSync(newRegistryPath, updatedRegistryContent, 'utf8');
console.log('Rebuilt components/tools/index.tsx dynamic registry successfully!');


// 6. Update ClientLayout.tsx and ToolClient.tsx imports
console.log('\n--- Phase 6: Updating other source file imports ---');
const clientLayoutPath = path.join(layoutDir, 'ClientLayout.tsx');
if (fs.existsSync(clientLayoutPath)) {
  let content = fs.readFileSync(clientLayoutPath, 'utf8');
  // Update imports inside ClientLayout.tsx:
  // - from './PageProgressBar' -> from './PageProgressBar' (both are now in layout/, so this is correct!)
  // - from './ThreeBackground' -> from './ThreeBackground'
  // - from '../tools' -> from '../tools' (ClientLayout was in components/ui, now in components/layout. The relative path to components/tools is still '../tools'!)
  // - from '../../config/tools' -> from '../../config/tools' (ClientLayout was in components/ui, now in components/layout. Depth is still same!)
  // Let's check if there are any broken relative imports in ClientLayout.tsx
  // Since its depth remains 3 (components/layout/ClientLayout.tsx), paths to config (../../config) and tools (../tools) are still identical!
  // Let's check if ThemeProvider was imported:
  // - from '../ThemeProvider' -> since ThemeProvider is now in layout/, it should be from './ThemeProvider'!
  content = content.replace(/from\s+['"]\.\.\/ThemeProvider['"]/g, "from './ThemeProvider'");
  fs.writeFileSync(clientLayoutPath, content, 'utf8');
  console.log('Updated ClientLayout.tsx imports.');
}

const toolClientPath = path.join(srcDir, 'app', '[category]', '[toolId]', 'ToolClient.tsx');
if (fs.existsSync(toolClientPath)) {
  let content = fs.readFileSync(toolClientPath, 'utf8');
  // ToolClient is in app/[category]/[toolId]/ToolClient.tsx (depth 3 under app/ or src/app/)
  // It imports:
  // - from '../../../components/tools'
  // - from '../../../components/ui/ReusableResult'
  // - from '../../../components/ui/ToolSkeleton'
  // Since its depth from src/ is still 3, all these relative imports remain completely unchanged and correct!
  // Let's verify:
  // src/app/[category]/[toolId]/ToolClient.tsx -> src/components/tools/index.tsx is indeed '../../../components/tools'!
  // Yes!
  console.log('ToolClient.tsx imports remain valid (same relative depth).');
}

const rootLayoutPath = path.join(srcDir, 'app', 'layout.tsx');
if (fs.existsSync(rootLayoutPath)) {
  let content = fs.readFileSync(rootLayoutPath, 'utf8');
  // - from '../components/ThemeProvider' -> ThemeProvider is now in components/layout/, so from '../components/layout/ThemeProvider'
  content = content.replace(/from\s+['"]\.\.\/components\/ThemeProvider['"]/g, "from '../components/layout/ThemeProvider'");
  // - from '../components/ui/ClientLayout' -> ClientLayout is now in components/layout/, so from '../components/layout/ClientLayout'
  content = content.replace(/from\s+['"]\.\.\/components\/ui\/ClientLayout['"]/g, "from '../components/layout/ClientLayout'");
  fs.writeFileSync(rootLayoutPath, content, 'utf8');
  console.log('Updated app/layout.tsx imports.');
}

console.log('\n--- Reorganization complete! ---');
