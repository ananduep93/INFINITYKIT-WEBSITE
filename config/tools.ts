export interface ToolField {
  id: string;
  label: string;
  type: 'number' | 'text' | 'textarea' | 'select' | 'range' | 'file';
  placeholder?: string;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  seoTitle?: string;
  seoDescription?: string;
  faq?: { question: string; answer: string }[];
  type: 'simple' | 'custom';
  inputs?: ToolField[];
  calculate?: (inputs: Record<string, any>) => any;
  componentName?: string; // Custom React component
}

export interface CategoryDefinition {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  description: string;
}

export const categories: CategoryDefinition[] = [
  { id: 'pdf-tools', name: 'PDF Tools', icon: '📄', emoji: '📄', description: 'Merge, split, compress, and edit PDF documents client-side.' },
  { id: 'image-tools', name: 'Image Tools', icon: '🖼️', emoji: '🖼️', description: 'Compress, resize, generate, and edit images instantly.' },
  { id: 'video-tools', name: 'Video Tools', icon: '🎥', emoji: '🎥', description: 'Trim, compress, create subtitles, and edit videos.' },
  { id: 'audio-tools', name: 'Audio Tools', icon: '🎵', emoji: '🎵', description: 'Extract audio, translate speech, and manage music tracks.' },
  { id: 'ai-writing-tools', name: 'AI Writing Tools', icon: '✍️', emoji: '✍️', description: 'Essay writers, blog generators, FAQ tools, and humanizers.' },
  { id: 'ocr-tools', name: 'OCR Tools', icon: '🔍', emoji: '🔍', description: 'Extract text from scanned PDFs, images, and documents.' },
  { id: 'file-conversion-tools', name: 'File Conversion Tools', icon: '🔄', emoji: '🔄', description: 'Convert between files, images, PDFs, and document formats.' },
  { id: 'developer-tools', name: 'Developer Tools', icon: '💻', emoji: '💻', description: 'JSON formatters, converters, SVG path optimizers, and codegen.' },
  { id: 'seo-tools', name: 'SEO Tools', icon: '📈', emoji: '📈', description: 'Meta tag auditors, schemas, and SEO content tools.' },
  { id: 'utility-tools', name: 'Utility Tools', icon: '🛠️', emoji: '🛠️', description: 'QR makers, password generators, and calculation utilities.' },
  { id: 'social-media-tools', name: 'Social Media Tools', icon: '📱', emoji: '📱', description: 'Link-in-bio pages, P2P file shares, and platform utilities.' },
  { id: 'automation-tools', name: 'Automation Tools', icon: '⚡', emoji: '⚡', description: 'Bulk file renamers, schedules, and workflow tools.' }
];


export const tools: ToolDefinition[] = [
  // Health Utility Hub
  {
    id: 'bmicalculator',
    name: 'Body Weight & Health Analyzer (BMI)',
    description: 'Calculate your Body Mass Index (BMI) instantly for weight assessments.',
    category: 'utility-tools',
    icon: '🧮',
    type: 'simple',
    inputs: [
      { id: 'height', label: 'Height (cm)', type: 'number', placeholder: 'e.g. 170', defaultValue: 170 },
      { id: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 70', defaultValue: 70 }
    ],
    calculate: (vals) => {
      const h = Number(vals.height) / 100;
      const w = Number(vals.weight);
      if (!h || !w) return null;
      const bmi = (w / (h * h)).toFixed(1);
      let cat = '';
      if (Number(bmi) < 18.5) cat = 'Underweight';
      else if (Number(bmi) < 25) cat = 'Healthy Weight';
      else if (Number(bmi) < 30) cat = 'Overweight';
      else cat = 'Obese';
      return {
        mainValue: `BMI: ${bmi}`,
        subValue: `Category: ${cat}`,
        color: Number(bmi) >= 18.5 && Number(bmi) < 25 ? 'success' : 'warning'
      };
    },
    faq: [
      { question: 'What is BMI?', answer: 'Body Mass Index is a simple screening calculation correlating height and weight to general weight categories.' }
    ]
  },
  {
    id: 'drugdosage',
    name: 'Pediatric & Adult Medicine Dose Calculator',
    description: 'Quickly estimate pediatric or regular dosages based on weight & concentration.',
    category: 'utility-tools',
    icon: '💊',
    type: 'simple',
    inputs: [
      { id: 'weight', label: 'Patient Weight (kg)', type: 'number', placeholder: 'e.g. 20', defaultValue: 20 },
      { id: 'dose', label: 'Prescribed Dose (mg/kg)', type: 'number', placeholder: 'e.g. 15', defaultValue: 15 },
      { id: 'conc', label: 'Available Concentration (mg/ml)', type: 'number', placeholder: 'e.g. 250', defaultValue: 250 }
    ],
    calculate: (vals) => {
      const w = Number(vals.weight);
      const d = Number(vals.dose);
      const c = Number(vals.conc);
      if (!w || !d || !c) return null;
      const mgTotal = w * d;
      const ml = mgTotal / c;
      return {
        mainValue: `Dosage: ${ml.toFixed(2)} ml`,
        subValue: `Total active compound: ${mgTotal.toFixed(1)} mg`,
        color: 'success'
      };
    }
  },
  {
    id: 'ivdripcalc',
    name: 'Saline & IV Fluid Drip Rate Calculator',
    description: 'Calculate drops per minute rates for IV fluid administrations.',
    category: 'utility-tools',
    icon: '💧',
    type: 'simple',
    inputs: [
      { id: 'vol', label: 'Volume (ml)', type: 'number', placeholder: 'e.g. 1000', defaultValue: 1000 },
      { id: 'time', label: 'Time (Hours)', type: 'number', placeholder: 'e.g. 8', defaultValue: 8 },
      { id: 'dropFactor', label: 'Drop Factor (gtt/ml)', type: 'number', placeholder: 'e.g. 20 (Macrodrip)', defaultValue: 20 }
    ],
    calculate: (vals) => {
      const vol = Number(vals.vol);
      const hrs = Number(vals.time);
      const df = Number(vals.dropFactor);
      if (!vol || !hrs || !df) return null;
      const rate = (vol * df) / (hrs * 60);
      return {
        mainValue: `Drip Rate: ${Math.round(rate)} drops/min`,
        subValue: `Flow rate: ${(vol / hrs).toFixed(1)} ml/hr`,
        color: 'success'
      };
    }
  },
  {
    id: 'medicinereminder',
    name: 'Daily Medicine Schedule Alarm & Organizer',
    description: 'Auto-generate intervals and dosing logs over a 24-hour cycle.',
    category: 'utility-tools',
    icon: '📅',
    type: 'custom',
    componentName: 'MedicationReminder'
  },

  // Daily Essentials
  {
    id: 'todolist',
    name: 'Daily Tasks List & Progress Tracker',
    description: 'Interactive checklist synced to Firebase Cloud backup.',
    category: 'utility-tools',
    icon: '📝',
    type: 'custom',
    componentName: 'TodoList'
  },
  {
    id: 'notes',
    name: 'Quick Secure Notebook Vault',
    description: 'Write quick notes. Synced to Firestore automatically.',
    category: 'utility-tools',
    icon: '📓',
    type: 'custom',
    componentName: 'QuickNotes'
  },
  {
    id: 'timer',
    name: 'Pomodoro Study Focus Timer',
    description: 'High-performance Pomodoro and count down watch.',
    category: 'utility-tools',
    icon: '⏱️',
    type: 'custom',
    componentName: 'FocusTimer'
  },

  // Expense Tracker Suite (Custom Component maps)
  {
    id: 'expenseadd',
    name: 'Record Daily Expense',
    description: 'Record new outflow transactions with direct cloud save.',
    category: 'utility-tools',
    icon: '➕',
    type: 'custom',
    componentName: 'ExpenseTrackerSuite'
  },
  {
    id: 'expenselist',
    name: 'View Expense Records History',
    description: 'Sort and filter historical purchases.',
    category: 'utility-tools',
    icon: '📋',
    type: 'custom',
    componentName: 'ExpenseTrackerSuite'
  },
  {
    id: 'budgettracker',
    name: 'Savings & Monthly Budget Planner',
    description: 'Set spending limits by category and track progress bar indicators.',
    category: 'utility-tools',
    icon: '🎯',
    type: 'custom',
    componentName: 'ExpenseTrackerSuite'
  },
  {
    id: 'expenseanalytics',
    name: 'Spending Visual Graphs & Charts',
    description: 'Beautiful interactive spending distribution and trends.',
    category: 'utility-tools',
    icon: '📈',
    type: 'custom',
    componentName: 'ExpenseTrackerSuite'
  },
  {
    id: 'dailymonthlyreport',
    name: 'Printable Expense & Income Statements Builder',
    description: 'Generate a unified report of yesterday, today, and current month outflows.',
    category: 'utility-tools',
    icon: '📅',
    type: 'custom',
    componentName: 'DailyMonthlyReport'
  },
  {
    id: 'searchexpenses',
    name: 'Search & Filter Expenses',
    description: 'Query transactions using custom key tags, dates, and amount thresholds.',
    category: 'utility-tools',
    icon: '🔍',
    type: 'custom',
    componentName: 'SearchExpenses'
  },
  {
    id: 'topspendinginsights',
    name: 'Where Do I Spend Most? (Spending Chart)',
    description: 'Identify high-volume expense categories and evaluate key budget drains.',
    category: 'utility-tools',
    icon: '💡',
    type: 'custom',
    componentName: 'TopSpendingInsights'
  },
  {
    id: 'resetexpenses',
    name: 'Reset & Delete Expense Records',
    description: 'Permanently erase all your logged transaction history and reset spending ledgers.',
    category: 'utility-tools',
    icon: '🗑️',
    type: 'custom',
    componentName: 'ResetExpenses'
  },

  // AI Tools
  {
    id: 'chatbot',
    name: 'Infinity AI Chat & Assistant',
    description: 'Premium chatbot interface powered by advanced Gemini models.',
    category: 'ai-writing-tools',
    icon: '🤖',
    type: 'custom',
    componentName: 'AIChatbot'
  },
  {
    id: 'text-improver',
    name: 'AI Smart Text Improver',
    description: 'Rewrite, fix grammar, and elevate the tone of your documents.',
    category: 'ai-writing-tools',
    icon: '✨',
    type: 'custom',
    componentName: 'AITextImprover'
  },
  {
    id: 'summarizer',
    name: 'AI Smart Text Summarizer',
    description: 'Distill long essays or articles into highly cohesive outlines.',
    category: 'ai-writing-tools',
    icon: '📝',
    type: 'custom',
    componentName: 'AISummarizer'
  },
  {
    id: 'image-generator',
    name: 'AI Canvas Art Generator',
    description: 'Convert descriptive sentences into visual graphics.',
    category: 'ai-writing-tools',
    icon: '🎨',
    type: 'custom',
    componentName: 'AIImageGenerator'
  },
  {
    id: 'essay-writer',
    name: 'AI Essay Writer',
    description: 'Draft well-structured, professional academic essays instantly using advanced AI language models.',
    category: 'ai-writing-tools',
    icon: '✍️',
    type: 'custom',
    componentName: 'EssayWriter'
  },
  {
    id: 'article-writer',
    name: 'AI Article Writer',
    description: 'Draft SEO-optimized articles, news pieces, and journalistic columns instantly with highly engaging headlines.',
    category: 'ai-writing-tools',
    icon: '📰',
    type: 'custom',
    componentName: 'ArticleWriter'
  },
  {
    id: 'blog-generator',
    name: 'AI Blog Post Generator',
    description: 'Draft friendly, shareable, and engaging blog posts tailored to your exact niche and audience.',
    category: 'ai-writing-tools',
    icon: '💬',
    type: 'custom',
    componentName: 'BlogGenerator'
  },
  {
    id: 'faq-generator',
    name: 'AI FAQ Generator',
    description: 'Generate frequently asked questions (FAQs) and answers for your website, landing page, or product docs instantly.',
    category: 'ai-writing-tools',
    icon: '❓',
    type: 'custom',
    componentName: 'FAQGenerator'
  },
  {
    id: 'ai-rewriter',
    name: 'AI Content Rewriter',
    description: 'Rewrite, paraphrase, expand, or simplify any content locally using advanced machine learning models.',
    category: 'ai-writing-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'AIRewriter'
  },
  {
    id: 'ai-humanizer',
    name: 'AI Text Humanizer',
    description: 'Convert robotic or AI-generated copy into highly natural, organic, human-sounding text.',
    category: 'ai-writing-tools',
    icon: '👤',
    type: 'custom',
    componentName: 'AIHumanizer'
  },
  {
    id: 'grammar-fixer',
    name: 'AI Grammar Fixer',
    description: 'Correct all spelling mistakes, grammatical errors, and sentence structure issues instantly.',
    category: 'ai-writing-tools',
    icon: '🛠️',
    type: 'custom',
    componentName: 'GrammarFixer'
  },

  // Utilities
  {
    id: 'passwordgen',
    name: 'Random Strong Password Generator',
    description: 'Build strong cryptographic keys with symbols, casing, and lengths.',
    category: 'utility-tools',
    icon: '🔑',
    type: 'simple',
    inputs: [
      { id: 'length', label: 'Key Length', type: 'range', min: 8, max: 64, defaultValue: 16 },
      { id: 'numbers', label: 'Include Numbers', type: 'select', defaultValue: 'yes', options: [{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}] },
      { id: 'symbols', label: 'Include Symbols', type: 'select', defaultValue: 'yes', options: [{label: 'Yes', value: 'yes'}, {label: 'No', value: 'no'}] }
    ],
    calculate: (vals) => {
      const len = Number(vals.length) || 16;
      const hasNum = vals.numbers === 'yes';
      const hasSym = vals.symbols === 'yes';
      let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (hasNum) chars += '0123456789';
      if (hasSym) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
      
      let pass = '';
      for (let i = 0; i < len; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return {
        mainValue: pass,
        subValue: 'Copy this key safely. 100% Client-Side generation.',
        color: 'success',
        copyable: true
      };
    }
  },
  {
    id: 'qrcode-gen',
    name: 'Scan-to-Open QR Code Generator',
    description: 'Create instantly scannable codes for links, text, or contacts.',
    category: 'utility-tools',
    icon: '📱',
    type: 'custom',
    componentName: 'QRCodeGenerator'
  },
  {
    id: 'unitconverter',
    name: 'All-in-One Measurement Units Converter',
    description: 'Transform values between lengths, weights, areas, and temperatures.',
    category: 'utility-tools',
    icon: '🔄',
    type: 'simple',
    inputs: [
      { id: 'val', label: 'Value to convert', type: 'number', defaultValue: 1 },
      { id: 'type', label: 'Metric Type', type: 'select', defaultValue: 'km-to-miles', options: [
        {label: 'Kilometers to Miles', value: 'km-to-miles'},
        {label: 'Miles to Kilometers', value: 'miles-to-km'},
        {label: 'Celsius to Fahrenheit', value: 'c-to-f'},
        {label: 'Fahrenheit to Celsius', value: 'f-to-c'},
        {label: 'Kilograms to Pounds', value: 'kg-to-lbs'},
        {label: 'Pounds to Kilograms', value: 'lbs-to-kg'}
      ]}
    ],
    calculate: (vals) => {
      const v = Number(vals.val);
      const t = vals.type;
      if (isNaN(v)) return null;
      let res = 0;
      let lbl = '';
      if (t === 'km-to-miles') { res = v * 0.621371; lbl = 'Miles'; }
      else if (t === 'miles-to-km') { res = v / 0.621371; lbl = 'Kilometers'; }
      else if (t === 'c-to-f') { res = (v * 9/5) + 32; lbl = '°F'; }
      else if (t === 'f-to-c') { res = (v - 32) * 5/9; lbl = '°C'; }
      else if (t === 'kg-to-lbs') { res = v * 2.20462; lbl = 'Pounds'; }
      else if (t === 'lbs-to-kg') { res = v / 2.20462; lbl = 'Kilograms'; }
      return {
        mainValue: `${res.toFixed(3)} ${lbl}`,
        subValue: 'Accurate to 3 decimal places.',
        color: 'success'
      };
    }
  },

  // Math Tools
  {
    id: 'discountcalc',
    name: 'Sales Discount & Final Price Calculator',
    description: 'Find original prices, percentage drop savings, and net totals.',
    category: 'utility-tools',
    icon: '🏷️',
    type: 'simple',
    inputs: [
      { id: 'price', label: 'Original Price ($)', type: 'number', defaultValue: 100 },
      { id: 'discount', label: 'Discount Percentage (%)', type: 'number', defaultValue: 20 }
    ],
    calculate: (vals) => {
      const p = Number(vals.price);
      const d = Number(vals.discount);
      if (isNaN(p) || isNaN(d)) return null;
      const savings = p * (d / 100);
      const final = p - savings;
      return {
        mainValue: `Final Cost: $${final.toFixed(2)}`,
        subValue: `You save: $${savings.toFixed(2)} (${d}%)`,
        color: 'success'
      };
    }
  },
  {
    id: 'percentagecalc',
    name: 'Simple Percentage Calculator',
    description: 'Compute values, differences, proportions, and percentage ratios.',
    category: 'utility-tools',
    icon: '🔢',
    type: 'simple',
    inputs: [
      { id: 'valA', label: 'What is (X)%', type: 'number', defaultValue: 20 },
      { id: 'valB', label: 'Of (Y)', type: 'number', defaultValue: 150 }
    ],
    calculate: (vals) => {
      const a = Number(vals.valA);
      const b = Number(vals.valB);
      if (isNaN(a) || isNaN(b) || !b) return null;
      const res = (a / 100) * b;
      return {
        mainValue: `${a}% of ${b} is: ${res.toFixed(2)}`,
        subValue: 'Percentage formulation completed.',
        color: 'success'
      };
    }
  },
  {
    id: 'lcmhcf',
    name: 'LCM & HCF Finder (Lowest & Highest Factors)',
    description: 'Calculate Least Common Multiple and Highest Common Factor for integers.',
    category: 'utility-tools',
    icon: '🔢',
    type: 'simple',
    inputs: [
      { id: 'numA', label: 'First Number', type: 'number', defaultValue: 12 },
      { id: 'numB', label: 'Second Number', type: 'number', defaultValue: 18 }
    ],
    calculate: (vals) => {
      const a = Math.abs(Math.floor(Number(vals.numA)));
      const b = Math.abs(Math.floor(Number(vals.numB)));
      if (!a || !b) return null;
      
      const gcd = (x: number, y: number): number => (!y ? x : gcd(y, x % y));
      const hcf = gcd(a, b);
      const lcm = (a * b) / hcf;
      return {
        mainValue: `LCM: ${lcm} | HCF: ${hcf}`,
        subValue: `Numbers: ${a} and ${b}`,
        color: 'success'
      };
    }
  },

  // Web Tools
  {
    id: 'urlencoder',
    name: 'Web URL Link Safeguard Encoder & Decoder',
    description: 'Convert characters to URL safe equivalents or decode back.',
    category: 'developer-tools',
    icon: '🔗',
    type: 'simple',
    inputs: [
      { id: 'txt', label: 'Text or URL', type: 'textarea', placeholder: 'Enter text here...' },
      { id: 'mode', label: 'Action Mode', type: 'select', defaultValue: 'encode', options: [{label: 'Encode 🔒', value: 'encode'}, {label: 'Decode 🔓', value: 'decode'}] }
    ],
    calculate: (vals) => {
      const t = vals.txt || '';
      const m = vals.mode;
      try {
        const out = m === 'encode' ? encodeURIComponent(t) : decodeURIComponent(t);
        return {
          mainValue: out,
          subValue: `Completed ${m} operation successfully.`,
          color: 'success',
          copyable: true
        };
      } catch (err) {
        return { mainValue: 'Error decoding text. Invalid format.', color: 'error' };
      }
    }
  },

  // Case Converter
  {
    id: 'caseconverter',
    name: 'Convert Text to UPPERCASE, lowercase, or Title Case',
    description: 'Convert text blocks instantly into UPPERCASE, lowercase, Title Case, camelCase, or snake_case.',
    category: 'utility-tools',
    icon: '🔠',
    type: 'simple',
    inputs: [
      { id: 'txt', label: 'Enter Text', type: 'textarea', placeholder: 'Type or paste text here...', defaultValue: 'hello world' },
      { id: 'mode', label: 'Conversion Mode', type: 'select', defaultValue: 'upper', options: [
        { label: 'UPPERCASE', value: 'upper' },
        { label: 'lowercase', value: 'lower' },
        { label: 'Title Case', value: 'title' },
        { label: 'camelCase', value: 'camel' },
        { label: 'snake_case', value: 'snake' },
        { label: 'PascalCase', value: 'pascal' }
      ]}
    ],
    calculate: (vals) => {
      const input = vals.txt || '';
      let out = '';
      const mode = vals.mode;
      if (mode === 'upper') out = input.toUpperCase();
      else if (mode === 'lower') out = input.toLowerCase();
      else if (mode === 'title') {
        out = input.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      }
      else if (mode === 'camel') {
        out = input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m: any, chr: string) => chr.toUpperCase());
      }
      else if (mode === 'snake') {
        const matches = input.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
        out = matches ? matches.map((x: string) => x.toLowerCase()).join('_') : input.toLowerCase().replace(/\s+/g, '_');
      }
      else if (mode === 'pascal') {
        out = input.toLowerCase().replace(/(\w)(\w*)/g, (g0: any, g1: string, g2: string) => g1.toUpperCase() + g2.toLowerCase()).replace(/\s+/g, '');
      }
      return {
        mainValue: out,
        subValue: 'Text case converted successfully.',
        color: 'success',
        copyable: true
      };
    }
  },

  // Word Counter
  {
    id: 'wordcounter',
    name: 'Word, Character, & Paragraph Counter',
    description: 'Analyze text metrics including word counts, reading speeds, characters, and paragraphs.',
    category: 'utility-tools',
    icon: '📝',
    type: 'simple',
    inputs: [
      { id: 'txt', label: 'Enter Text', type: 'textarea', placeholder: 'Enter your article or essay...', defaultValue: 'The quick brown fox jumps over the lazy dog.' }
    ],
    calculate: (vals) => {
      const txt = vals.txt || '';
      const charCount = txt.length;
      const charNoSpaces = txt.replace(/\s+/g, '').length;
      const words = txt.trim().split(/\s+/).filter((w: string) => w.length > 0);
      const wordCount = words.length;
      const paragraphs = txt.split(/\n+/).filter((p: string) => p.trim().length > 0).length;
      const readingTime = Math.ceil(wordCount / 200); // 200 wpm average
      return {
        mainValue: `Words: ${wordCount} | Characters: ${charCount}`,
        subValue: `Without Spaces: ${charNoSpaces} | Paragraphs: ${paragraphs} | Reading Time: ~${readingTime} min`,
        color: 'success'
      };
    }
  },

  // Fibonacci Generator
  {
    id: 'fibonacci',
    name: 'Generate Fibonacci Sequence Range',
    description: 'Generate the mathematical Fibonacci sequence up to 100 terms.',
    category: 'utility-tools',
    icon: '🔢',
    type: 'simple',
    inputs: [
      { id: 'terms', label: 'Number of terms', type: 'number', min: 1, max: 100, defaultValue: 10 }
    ],
    calculate: (vals) => {
      const terms = Math.min(100, Math.max(1, Math.floor(Number(vals.terms))));
      if (isNaN(terms)) return null;
      const seq = [0, 1];
      if (terms === 1) return { mainValue: '0', subValue: 'First term.', color: 'success' };
      for (let i = 2; i < terms; i++) {
        seq.push(seq[i - 1] + seq[i - 2]);
      }
      return {
        mainValue: seq.slice(0, terms).join(', '),
        subValue: `Generated sequence of first ${terms} terms.`,
        color: 'success',
        copyable: true
      };
    }
  },

  // Factorial Calculator
  {
    id: 'factorial',
    name: 'Factorial Calculations Checker (e.g. 5!)',
    description: 'Compute the product of all positive integers less than or equal to a number.',
    category: 'utility-tools',
    icon: '🔢',
    type: 'simple',
    inputs: [
      { id: 'num', label: 'Enter Number (n)', type: 'number', min: 0, max: 170, defaultValue: 5 }
    ],
    calculate: (vals) => {
      const n = Math.min(170, Math.max(0, Math.floor(Number(vals.num))));
      if (isNaN(n)) return null;
      if (n === 0 || n === 1) return { mainValue: '1', subValue: '0! and 1! are equal to 1.', color: 'success' };
      let res = 1;
      for (let i = 2; i <= n; i++) {
        res *= i;
      }
      return {
        mainValue: `${n}! = ${res.toLocaleString()}`,
        subValue: `Calculation complete.`,
        color: 'success',
        copyable: true
      };
    }
  },

  // Prime Checker
  {
    id: 'primenumber',
    name: 'Prime Number Checker',
    description: 'Determine if an integer is a prime number and explore its factors.',
    category: 'utility-tools',
    icon: '🔢',
    type: 'simple',
    inputs: [
      { id: 'num', label: 'Enter Positive Integer', type: 'number', min: 1, defaultValue: 7 }
    ],
    calculate: (vals) => {
      const n = Math.floor(Number(vals.num));
      if (isNaN(n) || n < 1) return { mainValue: 'Invalid Number', color: 'error' };
      if (n === 1) return { mainValue: '1 is neither prime nor composite.', color: 'warning' };
      
      let isPrime = true;
      const limit = Math.sqrt(n);
      for (let i = 2; i <= limit; i++) {
        if (n % i === 0) {
          isPrime = false;
          break;
        }
      }
      
      // Get all factors
      const factors = [];
      for (let i = 1; i <= n; i++) {
        if (n % i === 0) factors.push(i);
      }
      
      return {
        mainValue: isPrime ? `${n} is a PRIME number! 🌟` : `${n} is a COMPOSITE number.`,
        subValue: `Factors of ${n}: ${factors.join(', ')}`,
        color: isPrime ? 'success' : 'warning'
      };
    }
  },

  // Days Between Dates
  {
    id: 'daysbetween',
    name: 'Count Days and Time Between Dates',
    description: 'Calculate the precise number of days, weeks, and years between two dates.',
    category: 'utility-tools',
    icon: '⏰',
    type: 'simple',
    inputs: [
      { id: 'dateStart', label: 'Start Date (YYYY-MM-DD)', type: 'text', placeholder: 'e.g. 2026-01-01', defaultValue: '2026-01-01' },
      { id: 'dateEnd', label: 'End Date (YYYY-MM-DD)', type: 'text', placeholder: 'e.g. 2026-12-31', defaultValue: '2026-12-31' }
    ],
    calculate: (vals) => {
      const d1 = new Date(vals.dateStart);
      const d2 = new Date(vals.dateEnd);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        return { mainValue: 'Invalid Date format. Use YYYY-MM-DD.', color: 'error' };
      }
      const diffMs = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const weeks = (diffDays / 7).toFixed(1);
      const years = (diffDays / 365).toFixed(2);
      return {
        mainValue: `${diffDays} Days`,
        subValue: `Equivalent to approx ${weeks} weeks or ${years} years.`,
        color: 'success'
      };
    }
  },

  // Palindrome Checker
  {
    id: 'palindrome',
    name: 'Check for Words That Read Flipped (Palindromes)',
    description: 'Verify if a phrase, word, or sequence reads the same backwards as forwards.',
    category: 'utility-tools',
    icon: '🔠',
    type: 'simple',
    inputs: [
      { id: 'txt', label: 'Enter Word/Phrase', type: 'text', defaultValue: 'racecar' }
    ],
    calculate: (vals) => {
      const txt = vals.txt || '';
      const clean = txt.toLowerCase().replace(/[^a-z0-9]/g, '');
      const rev = clean.split('').reverse().join('');
      const isPal = clean === rev;
      return {
        mainValue: isPal ? `Yes, "${txt}" is a palindrome! 🔄` : `No, "${txt}" is not a palindrome.`,
        subValue: `Reversed letters: ${rev}`,
        color: isPal ? 'success' : 'warning'
      };
    }
  },

  // Text Reverser
  {
    id: 'textreverse',
    name: 'Flip Text and Letters Backward',
    description: 'Flip character arrangements backwards instantly.',
    category: 'utility-tools',
    icon: '✍️',
    type: 'simple',
    inputs: [
      { id: 'txt', label: 'Enter Text', type: 'textarea', placeholder: 'Enter sentence to reverse...', defaultValue: 'Infinity Kit' }
    ],
    calculate: (vals) => {
      const txt = vals.txt || '';
      const rev = txt.split('').reverse().join('');
      return {
        mainValue: rev,
        subValue: 'Characters reversed completely.',
        color: 'success',
        copyable: true
      };
    }
  },

  // Average Calculator
  {
    id: 'averagecalculator',
    name: 'Calculate Average, Mean, and Median',
    description: 'Determine mathematical averages (mean, median, mode) and bounds for a list of values.',
    category: 'developer-tools',
    icon: '📊',
    type: 'simple',
    inputs: [
      { id: 'list', label: 'Enter Comma Separated Numbers', type: 'textarea', defaultValue: '10, 20, 30, 40, 50' }
    ],
    calculate: (vals) => {
      const listStr = vals.list || '';
      const nums = listStr.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      if (nums.length === 0) return { mainValue: 'Please enter valid numbers.', color: 'error' };
      
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = sum / nums.length;
      
      // Median
      const sorted = [...nums].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      return {
        mainValue: `Mean: ${mean.toFixed(2)} | Median: ${median}`,
        subValue: `Count: ${nums.length} | Range: ${min} to ${max} | Sum: ${sum}`,
        color: 'success'
      };
    }
  },

  // Number Sorter
  {
    id: 'numbersorter',
    name: 'Sort Numbers in Order (Lowest to Highest)',
    description: 'Arrange list values in strict ascending or descending order.',
    category: 'developer-tools',
    icon: '📊',
    type: 'simple',
    inputs: [
      { id: 'list', label: 'Enter Comma Separated Numbers', type: 'textarea', defaultValue: '8, 3, 12, 1, 9, 5' },
      { id: 'order', label: 'Sorting Order', type: 'select', defaultValue: 'asc', options: [
        { label: 'Ascending Low to High', value: 'asc' },
        { label: 'Descending High to Low', value: 'desc' }
      ]}
    ],
    calculate: (vals) => {
      const listStr = vals.list || '';
      const order = vals.order || 'asc';
      const nums = listStr.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      if (nums.length === 0) return { mainValue: 'Please enter valid numbers.', color: 'error' };
      
      const sorted = [...nums].sort((a, b) => order === 'asc' ? a - b : b - a);
      return {
        mainValue: sorted.join(', '),
        subValue: `Successfully sorted ${nums.length} values.`,
        color: 'success',
        copyable: true
      };
    }
  },

  // Yes/No Generator
  {
    id: 'yesnogerator',
    name: 'Instant Yes or No Decision Oracle',
    description: 'Ask any question and let our client-side decision module resolve a random outcome.',
    category: 'utility-tools',
    icon: '🎯',
    type: 'simple',
    inputs: [
      { id: 'question', label: 'Ask a Question', type: 'text', defaultValue: 'Should I code a new tool today?' }
    ],
    calculate: (vals) => {
      const q = vals.question || '';
      if (!q.trim()) return { mainValue: 'Please enter a valid question.', color: 'error' };
      const ans = Math.random() > 0.5 ? 'YES! 👍' : 'NO! 👎';
      const advices = [
        'Trust your gut feeling.',
        'Wait a moment before acting.',
        'Now is the perfect opportunity.',
        'Better avoid it this time.',
        'The signs point to progress.'
      ];
      const adv = advices[Math.floor(Math.random() * advices.length)];
      return {
        mainValue: ans,
        subValue: `Advice: ${adv}`,
        color: 'success'
      };
    }
  },

  // Triangle Checker
  {
    id: 'trianglechecker',
    name: 'Triangle Validity Inspector',
    description: 'Verify if three side bounds can form a geometric triangle and determine its classification.',
    category: 'utility-tools',
    icon: '📊',
    type: 'simple',
    inputs: [
      { id: 'sideA', label: 'Side A length', type: 'number', defaultValue: 3 },
      { id: 'sideB', label: 'Side B length', type: 'number', defaultValue: 4 },
      { id: 'sideC', label: 'Side C length', type: 'number', defaultValue: 5 }
    ],
    calculate: (vals) => {
      const a = Number(vals.sideA);
      const b = Number(vals.sideB);
      const c = Number(vals.sideC);
      if (isNaN(a) || isNaN(b) || isNaN(c) || a <= 0 || b <= 0 || c <= 0) {
        return { mainValue: 'Lengths must be positive non-zero values.', color: 'error' };
      }
      
      const isValid = (a + b > c) && (a + c > b) && (b + c > a);
      if (!isValid) return { mainValue: 'Invalid Triangle! The sum of any two sides must exceed the third.', color: 'warning' };
      
      let type = '';
      if (a === b && b === c) type = 'Equilateral';
      else if (a === b || b === c || a === c) type = 'Isosceles';
      else type = 'Scalene';
      
      return {
        mainValue: `Valid Triangle: ${type} classification! 📐`,
        subValue: `Sides: ${a}, ${b}, ${c} | Perimeter: ${a + b + c}`,
        color: 'success'
      };
    }
  },

  // Data Tools
  {
    id: 'graphmaker',
    name: 'Interactive Graph Maker',
    description: 'Generate beautiful visual charts from comma separated keys.',
    category: 'developer-tools',
    icon: '📊',
    type: 'custom',
    componentName: 'GraphMaker'
  },

  // Remove duplicates
  {
    id: 'removeduplicates',
    name: 'Remove Duplicate Words & Clean Text',
    description: 'Clean your text by identifying and removing duplicate words, leaving you with a clean, unique dataset.',
    category: 'utility-tools',
    icon: '🧹',
    type: 'simple',
    inputs: [
      { id: 'txt', label: 'Enter Text', type: 'textarea', placeholder: 'Enter text with duplicates...', defaultValue: 'the quick brown fox jumps over the lazy dog dog dog' }
    ],
    calculate: (vals) => {
      const input = vals.txt || '';
      const words = input.split(/\s+/).filter((w: string) => w);
      const unique = words.filter((w: string, idx: number) => words.indexOf(w) === idx);
      return {
        mainValue: unique.join(' '),
        subValue: `Removed ${words.length - unique.length} duplicate word(s).`,
        color: 'success',
        copyable: true
      };
    }
  },

  // Username generator
  {
    id: 'usernamegen',
    name: 'Creative Username Generator',
    description: 'Generate creative, randomized, and custom username recommendations based on a keyword.',
    category: 'utility-tools',
    icon: '🔤',
    type: 'simple',
    inputs: [
      { id: 'keyword', label: 'Name / Keyword', type: 'text', placeholder: 'e.g. john', defaultValue: 'john' }
    ],
    calculate: (vals) => {
      const keyword = (vals.keyword || '').trim();
      if (!keyword) return { mainValue: 'Please enter a name or keyword', color: 'error' };
      
      const prefixes = ['the', 'real', 'mr', 'ms', 'dr', 'pro', 'epic', 'itz', 'its', 'iam', 'cool', 'super', 'hyper'];
      const suffixes = ['_x', '007', 'pro', 'dev', '_', '123', 'official', 'gaming', 'vlogs', 'yt', 'hub', 'box', 'live'];
      
      const list: string[] = [];
      list.push(keyword);
      list.push(`${keyword}_${new Date().getFullYear()}`);
      
      // Generate some standard formats
      prefixes.forEach(pref => {
        list.push(`${pref}_${keyword}`);
        list.push(`${pref}${keyword}`);
      });
      suffixes.forEach(suff => {
        list.push(`${keyword}${suff}`);
        list.push(`${keyword}_${suff}`);
      });
      
      // Select 10 diverse recommendations to present
      const uniqueList = list.filter((u: string, idx: number) => u.length > 0 && list.indexOf(u) === idx);
      const shuffled = uniqueList.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 10);
      
      return {
        mainValue: selected.join('\n'),
        subValue: 'Generate secure, professional, and gaming usernames.',
        color: 'success',
        copyable: true
      };
    }
  },
  // e-Signature Studio
  {
    id: 'e-signature',
    name: 'Draw & Save E-Signatures (Online Signature Pad)',
    description: 'Draw custom electronic signatures and download them as high-quality transparent PNGs.',
    category: 'developer-tools',
    icon: '✍️',
    type: 'custom',
    componentName: 'ESignature'
  },
  // EXIF & Metadata Stripper
  {
    id: 'metadata-stripper',
    name: 'Remove Secret Data from Photos (EXIF & Metadata Stripper)',
    description: 'Protect your privacy by scrubbing EXIF, camera info, and GPS coordinates from your photos 100% locally.',
    category: 'image-tools',
    icon: '🕵️‍♂️',
    type: 'custom',
    componentName: 'MetadataStripper'
  },
  // Bulk File Renamer
  {
    id: 'bulk-renamer',
    name: 'Bulk File Batch Renamer',
    description: 'Rename multiple files in batch with custom prefixes, suffixes, and sequential numbering patterns.',
    category: 'automation-tools',
    icon: '📁',
    type: 'custom',
    componentName: 'BulkRenamer'
  },
  // JSON to TypeScript Interface
  {
    id: 'json-to-ts',
    name: 'JSON to TypeScript Code Converter',
    description: 'Convert standard JSON objects instantly into clean, fully-typed TypeScript interfaces.',
    category: 'developer-tools',
    icon: '💻',
    type: 'custom',
    componentName: 'JSONToTS'
  },
  // Dead Drop Encrypted Notes
  {
    id: 'encrypted-note',
    name: 'Password Protected Secured Vault Note',
    description: 'Symmetrically encrypt text notes locally using robust XOR passkeys and Base64 outputs.',
    category: 'developer-tools',
    icon: '🔒',
    type: 'custom',
    componentName: 'EncryptedNote'
  },
  // Dynamic Bridged Legacy Tools
  {
    id: 'dailyplanner',
    name: 'Daily Schedule & Routine Planner',
    description: 'Plan your day with a visual timeline, interactive hourly schedules, and progress tracking.',
    category: 'automation-tools',
    icon: '📅',
    type: 'custom',
    componentName: 'DailyPlanner'
  },
  {
    id: 'calendarviewer',
    name: 'Simple Calendar Event Scheduler',
    description: 'Manage month views, select multiple dates, and log key visual events.',
    category: 'automation-tools',
    icon: '📅',
    type: 'custom',
    componentName: 'InteractiveCalendar'
  },
  {
    id: 'reminderalert',
    name: 'Custom Alarm & Reminder System',
    description: 'Schedule custom local notification alerts and track active intervals.',
    category: 'automation-tools',
    icon: '🔔',
    type: 'custom',
    componentName: 'NotificationScheduler'
  },
  {
    id: 'men-prompts',
    name: 'Persona Prompts (Men)',
    description: 'Targeted persona prompts for creative brainstorming and content generation tailored to male contexts.',
    category: 'ai-writing-tools',
    icon: '✨',
    type: 'custom',
    componentName: 'PersonaPromptsMen'
  },
  {
    id: 'women-prompts',
    name: 'Persona Prompts (Women)',
    description: 'Targeted persona prompts for creative brainstorming and content generation tailored to female contexts.',
    category: 'ai-writing-tools',
    icon: '✨',
    type: 'custom',
    componentName: 'PersonaPromptsWomen'
  },
  {
    id: 'svg-optimizer',
    name: 'SVG Vector Image Compressor',
    description: 'Minify and optimize raw SVG markup to reduce web page load times.',
    category: 'developer-tools',
    icon: '🌐',
    type: 'custom',
    componentName: 'SVGOptimizer'
  },
  {
    id: 'password-leak',
    name: 'Password Data Breach Database Checker',
    description: 'Check if your common passwords have been exposed in known historical data breaches.',
    category: 'utility-tools',
    icon: '🕵️‍♂️',
    type: 'custom',
    componentName: 'PasswordLeakScanner'
  },
  {
    id: 'note-shredder',
    name: 'Self-Destructing Secret Notes',
    description: 'Write high-confidentiality notes that auto-delete completely on close or shredding.',
    category: 'utility-tools',
    icon: '🗑️',
    type: 'custom',
    componentName: 'NoteShredder'
  },
  {
    id: 'csvviewer',
    name: 'CSV Spreadsheet Table Viewer',
    description: 'Load, edit, filter, and export CSV tabular sheets fully inside your local browser.',
    category: 'developer-tools',
    icon: '📊',
    type: 'custom',
    componentName: 'CSVViewer'
  },
  {
    id: 'metatagviewer',
    name: 'Website Search Engine Meta Tag Inspector',
    description: 'Extract and audit HTML SEO meta headers, descriptions, and OpenGraph parameters.',
    category: 'seo-tools',
    icon: '🌐',
    type: 'custom',
    componentName: 'MetaTagViewer'
  },
  {
    id: 'speed-test',
    name: 'Internet Speed Latency Tester',
    description: 'Test your local network download speed, upload latency, and connection quality.',
    category: 'utility-tools',
    icon: '⚡',
    type: 'custom',
    componentName: 'InternetSpeedTest'
  },
  {
    id: 'morse-flash',
    name: 'Morse Code Converter & Flash Signal',
    description: 'Translate alphanumeric text blocks to standard Morse code formats and back.',
    category: 'utility-tools',
    icon: '✍️',
    type: 'custom',
    componentName: 'MorseCodeTranslator'
  },
  {
    id: 'p2p-share',
    name: 'Direct Secure File Transfer (P2P Share)',
    description: 'Direct peer-to-peer browser local file sharing backed by secure WebRTC channels.',
    category: 'social-media-tools',
    icon: '📱',
    type: 'custom',
    componentName: 'P2PFileShare'
  },
  {
    id: 'distancecalc',
    name: 'Calculate Distance Between Coordinates',
    description: 'Find straight-line Euclidean distance between two coordinate sets on a 2D plane.',
    category: 'utility-tools',
    icon: '📏',
    type: 'custom',
    componentName: 'DistanceCalculator'
  },
  {
    id: 'equationsolver',
    name: 'Solve Math Equations (Step-by-Step)',
    description: 'Resolve high-precision quadratic formulas and check factor plots.',
    category: 'utility-tools',
    icon: '📊',
    type: 'custom',
    componentName: 'QuadraticSolver'
  },
  {
    id: 'examcalc',
    name: 'Class Grade Marks & Percentage Estimator',
    description: 'Determine required exam scores to achieve your desired final academic letter grade.',
    category: 'utility-tools',
    icon: '📚',
    type: 'custom',
    componentName: 'ExamGradeCalc'
  },
  {
    id: 'passwordstrength',
    name: 'Password Strength & Hack Time Calculator',
    description: 'Analyze password complexity, entropy bounds, and crack-duration estimations.',
    category: 'utility-tools',
    icon: '🔑',
    type: 'custom',
    componentName: 'PasswordStrength'
  },
  {
    id: 'spinwheel',
    name: 'Decision Maker Spin-the-Wheel Picker',
    description: 'Enter list items and spin the interactive graphic wheel to make unbiased random decisions.',
    category: 'utility-tools',
    icon: '🎯',
    type: 'custom',
    componentName: 'SpinWheel'
  },
  {
    id: 'choicecomparator',
    name: 'Compare Choices Side-by-Side Matrix',
    description: 'Compare different options across customizable scoring matrices to make decisions.',
    category: 'utility-tools',
    icon: '🎯',
    type: 'custom',
    componentName: 'ChoiceComparator'
  },
  {
    id: 'randomnamepicker',
    name: 'Pick Random Winner from Names List',
    description: 'Select a single random name or item from a customizable list instantly.',
    category: 'utility-tools',
    icon: '🎯',
    type: 'custom'
  },
  {
    id: 'compressimage',
    name: 'Reduce Image File Size (Compressor)',
    description: 'Compress and optimize JPEG/PNG image sizes local-first without loss of visual resolution.',
    category: 'image-tools',
    icon: '🖼️',
    type: 'custom',
    componentName: 'ImageCompressor'
  },
  {
    id: 'resizeimage',
    name: 'Resize Image Boundaries (Height & Width)',
    description: 'Adjust image width & height coordinates client-side with aspect ratio locking.',
    category: 'image-tools',
    icon: '🖼️',
    type: 'custom',
    componentName: 'ImageResizer'
  },
  {
    id: 'bg-remover',
    name: 'AI Background Stripper',
    description: 'Strip backgrounds from your images locally and instantly in your browser sandbox.',
    category: 'image-tools',
    icon: '✂️',
    type: 'custom',
    componentName: 'BackgroundRemover'
  },
  {
    id: 'blur-background',
    name: 'DSLR Portrait Background Blur',
    description: 'Create professional DSLR depth-of-field portrait blur focus rings for photos locally.',
    category: 'image-tools',
    icon: '📸',
    type: 'custom',
    componentName: 'BlurBackground'
  },
  {
    id: 'ocrimage',
    name: 'Extract Text from Images (OCR)',
    description: 'Extract typed or handwritten alphanumeric text from any uploaded image completely local-first.',
    category: 'ocr-tools',
    icon: '🔍',
    type: 'custom',
    componentName: 'OCRImage'
  },
  {
    id: 'imageinfo',
    name: 'Image Dimension & Detail Checker',
    description: 'Inspect image sizes, pixel dimensions, aspect ratios, and format attributes.',
    category: 'image-tools',
    icon: '🖼️',
    type: 'custom',
    componentName: 'ImageInfo'
  },
  {
    id: 'imagetopdf',
    name: 'Convert Images & Photos into PDF',
    description: 'Convert JPEG, PNG, and WebP graphics into clean, portable PDF documents.',
    category: 'file-conversion-tools',
    icon: '📁',
    type: 'custom',
    componentName: 'ImageToPDF'
  },
  {
    id: 'pdftoimage',
    name: 'Convert PDF Pages to Images',
    description: 'Render individual PDF document pages as downloadable high-resolution PNG photos.',
    category: 'file-conversion-tools',
    icon: '📁',
    type: 'custom',
    componentName: 'PDFToImage'
  },
  {
    id: 'mergepdf',
    name: 'Combine Multiple PDFs into One',
    description: 'Combine multiple PDF documents together into a single unified file.',
    category: 'pdf-tools',
    icon: '📁',
    type: 'custom',
    componentName: 'MergePDF'
  },
  {
    id: 'splitpdf',
    name: 'Split PDF Pages & Extract Ranges',
    description: 'Extract specific pages or page ranges from a PDF document to form a new document locally.',
    category: 'pdf-tools',
    icon: '📁',
    type: 'custom',
    componentName: 'SplitPDF'
  },
  {
    id: 'watermarkpdf',
    name: 'Add Custom Text Watermarks to PDFs',
    description: 'Protect your documents with a custom text watermark stamped on all pages client-side.',
    category: 'pdf-tools',
    icon: '📁',
    type: 'custom',
    componentName: 'WatermarkPDF'
  },
  {
    id: 'rotatepdf',
    name: 'Spin & Rotate PDF Pages',
    description: 'Rotate individual pages or entire PDF files by custom angle coordinates.',
    category: 'pdf-tools',
    icon: '📁',
    type: 'custom',
    componentName: 'RotatePDF'
  },
  {
    id: 'protect-pdf',
    name: 'Lock PDF Files with Secure Password',
    description: 'Lock your PDF document locally in your browser sandbox using high-performance AES-GCM password encryption.',
    category: 'pdf-tools',
    icon: '🔒',
    type: 'custom',
    componentName: 'ProtectPDF'
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock & Decrypt Protected PDFs',
    description: 'Unlock and decrypt secured PDF document containers locally by entering the correct PBKDF2/AES key password.',
    category: 'pdf-tools',
    icon: '🔓',
    type: 'custom',
    componentName: 'UnlockPDF'
  },
  {
    id: 'ai-summarize-pdf',
    name: 'AI PDF Key Highlights Summarizer',
    description: 'Summarize long PDF documents instantly into outline key topics and bullet summaries locally.',
    category: 'pdf-tools',
    icon: '📝',
    type: 'custom',
    componentName: 'AISummarizePDF'
  },
  {
    id: 'ai-chat-pdf',
    name: 'AI Chat & Discuss with PDF',
    description: 'Chat interactively with your PDF contents locally using Google Gemini AI models.',
    category: 'pdf-tools',
    icon: '💬',
    type: 'custom',
    componentName: 'AIChatPDF'
  },
  {
    id: 'color-palette',
    name: 'Image Color Palette & Code Extractor',
    description: 'Extract the dominant harmonious color palettes and HEX codes from any uploaded photo.',
    category: 'image-tools',
    icon: '🖼️',
    type: 'custom',
    componentName: 'ColorPaletteGenerator'
  },
  {
    id: 'texttospeech',
    name: 'Listen to Text Aloud (Voice Speaker)',
    description: 'Convert text blocks into audible human speech accents using native browser synthesis.',
    category: 'utility-tools',
    icon: '⚡',
    type: 'custom',
    componentName: 'TextToSpeech'
  },
  {
    id: 'focus-soundscape',
    name: 'Focus Ambient Noise Mixer (Rain, Forest)',
    description: 'Play soothing, customizable focus audio soundscapes like rain, white noise, and waves.',
    category: 'utility-tools',
    icon: '⏱️',
    type: 'custom',
    componentName: 'AmbientNoisePlayer'
  },
  {
    id: 'urlextractor',
    name: 'Extract Query Fields from URL Links',
    description: 'Parse query string URL fields and dissect key-value parameters into an organized table.',
    category: 'developer-tools',
    icon: '🔗',
    type: 'custom',
    componentName: 'URLExtractor'
  },
  {
    id: 'glass-gen',
    name: 'Frosty Glass CSS Card Designer',
    description: 'Design custom glassmorphic elements and copy clean CSS backdrop-filter style code.',
    category: 'developer-tools',
    icon: '🎨',
    type: 'custom',
    componentName: 'GlassmorphicGenerator'
  },
  {
    id: 'json-code',
    name: 'JSON Code Formatter & Beautifier',
    description: 'Format, validate, prettify, and parse raw JSON data structures into visual collapsible trees.',
    category: 'developer-tools',
    icon: '📊',
    type: 'custom',
    componentName: 'JSONFormatter'
  },
  {
    id: 'link-bio',
    name: 'Social Media Links Profile Page Builder',
    description: 'Build beautiful personal link dashboards to host all your professional channels in one place.',
    category: 'social-media-tools',
    icon: '📱',
    type: 'custom',
    componentName: 'LinkInBio'
  },
  {
    id: 'passwordsaver',
    name: 'Encrypted Password Keeper (Offline Vault)',
    description: 'Store and manage your log keys locally using secure browser database sandboxes.',
    category: 'utility-tools',
    icon: '🔑',
    type: 'custom',
    componentName: 'PasswordVault'
  },
  {
    id: 'surveybuilder',
    name: 'Custom Interactive Survey Builder',
    description: 'Create fully interactive custom survey questionnaires with multi-field forms.',
    category: 'utility-tools',
    icon: '📈',
    type: 'custom',
    componentName: 'SurveyBuilder'
  },
  {
    id: 'mysurveys',
    name: 'My Surveys & Questionnaires Dashboard',
    description: 'Manage your active questionnaires, edit field titles, and view live response URLs.',
    category: 'utility-tools',
    icon: '📈',
    type: 'custom',
    componentName: 'MySurveys'
  },
  {
    id: 'responseviewer',
    name: 'Survey Results & Submissions Analyst',
    description: 'Track survey submission tallies, check visual stats, and export excel rows.',
    category: 'utility-tools',
    icon: '📈',
    type: 'custom',
    componentName: 'ResponseViewer'
  },
  {
    id: 'smartsuggestions',
    name: 'Refine Prompts for AI Chatbots',
    description: 'Refine prompts using specialized creative guidelines to yield elite AI text results.',
    category: 'ai-writing-tools',
    icon: '✨',
    type: 'custom',
    componentName: 'SmartPromptEditor'
  },
  {
    id: 'publicsurvey',
    name: 'Interactive Survey Submission Form',
    description: 'Interactive responsive questionnaire portal for submitting survey answers.',
    category: 'utility-tools',
    icon: '📈',
    type: 'custom',
    componentName: 'PublicSurvey'
  },
  {
    id: 'categorysummary',
    name: 'Spreadsheet Columns Data Summarizer',
    description: 'Generate visual insights, graphs, and percentage counts from tabular dataset columns.',
    category: 'developer-tools',
    icon: '📊',
    type: 'custom',
    componentName: 'CategorySummary'
  },
  {
    id: 'extract-audio',
    name: 'Extract High-Quality Audio from Video',
    description: 'Extract high-fidelity audio tracks from video files locally using high-performance browser decoding.',
    category: 'audio-tools',
    icon: '🎵',
    type: 'custom',
    componentName: 'ExtractAudio'
  },
  {
    id: 'video-to-gif',
    name: 'Convert Video into Animated GIF',
    description: 'Convert MP4/WebM videos into high-quality animated GIFs locally using parallel worker threads.',
    category: 'video-tools',
    icon: '🎥',
    type: 'custom',
    componentName: 'VideoToGIF'
  },
  {
    id: 'subtitles-generator',
    name: 'Generate & Sync Video Subtitles',
    description: 'Generate, synchronize, and edit dynamic subtitle tracks. Export to SRT or VTT format.',
    category: 'video-tools',
    icon: '📝',
    type: 'custom',
    componentName: 'SubtitlesGenerator'
  },
  {
    id: 'video-transcription',
    name: 'Convert Video & Audio to Text Transcripts',
    description: 'Convert video or audio voice tracks into high-fidelity transcripts locally in your browser.',
    category: 'video-tools',
    icon: '🗣️',
    type: 'custom',
    componentName: 'VideoTranscription'
  },
  {
    id: 'schema-generator',
    name: 'SEO JSON-LD Structured Data Schema Maker',
    description: 'Generate structured microdata schemas to boost your SEO snippet rankings across major search engines.',
    category: 'seo-tools',
    icon: '🗂️',
    type: 'custom',
    componentName: 'SchemaGenerator'
  },
  {
    id: 'random-name-picker',
    name: 'Pick Random Winner from Names List',
    description: 'An elegant random selection tool for names, decisions, raffles, and lists with customizable draw options.',
    category: 'utility-tools',
    icon: '🔀',
    type: 'custom',
    componentName: 'RandomNamePicker'
  },
  {
    id: 'note-shredder',
    name: 'Self-Destructing Secret Notes',
    description: 'Write confidential self-destructing notes with custom shred timers or a read-once burn mechanism.',
    category: 'utility-tools',
    icon: '🔏',
    type: 'custom',
    componentName: 'NoteShredder'
  },
  {
    id: 'ambient-noise-player',
    name: 'Focus Ambient Noise Mixer (Rain, Forest)',
    description: 'Synthesize custom natural white noises and relaxing soundscapes client-side for maximum productivity.',
    category: 'audio-tools',
    icon: '🎧',
    type: 'custom',
    componentName: 'AmbientNoisePlayer'
  }
];

// Fallback search resolver helper
export function getToolById(id: string): ToolDefinition | undefined {
  return tools.find(t => t.id === id);
}

export function getCategoryById(id: string): CategoryDefinition | undefined {
  return categories.find(c => c.id === id);
}

export function getToolsByCategory(catId: string): ToolDefinition[] {
  return tools.filter(t => t.category === catId);
}
