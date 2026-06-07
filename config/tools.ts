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
  {
    "id": "ai-tools",
    "name": "AI Tools",
    "icon": "🤖",
    "emoji": "🤖",
    "description": "Chatbots, prompt helpers, and AI graphics."
  },
  {
    "id": "image-tools",
    "name": "Image Tools",
    "icon": "🖼️",
    "emoji": "🖼️",
    "description": "Resize, edit, strip metadata, and extract palettes."
  },
  {
    "id": "pdf-tools",
    "name": "PDF Tools",
    "icon": "📄",
    "emoji": "📄",
    "description": "Merge, split, lock, unlock, and sign PDF pages."
  },
  {
    "id": "video-tools",
    "name": "Video Tools",
    "icon": "🎥",
    "emoji": "🎥",
    "description": "Convert videos and generate subtitles."
  },
  {
    "id": "audio-tools",
    "name": "Audio Tools",
    "icon": "🎵",
    "emoji": "🎵",
    "description": "Text to speech and ambient noise mixers."
  },
  {
    "id": "text-tools",
    "name": "Text Tools",
    "icon": "🔤",
    "emoji": "🔤",
    "description": "Counters, case converters, duplicate removers, and OCR."
  },
  {
    "id": "developer-tools",
    "name": "Developer Tools",
    "icon": "💻",
    "emoji": "💻",
    "description": "JSON formatters, compilers, and SVG builders."
  },
  {
    "id": "student-tools",
    "name": "Student Tools",
    "icon": "🎓",
    "emoji": "🎓",
    "description": "Average, formula solvers, and grade calculators."
  },
  {
    "id": "seo-tools",
    "name": "SEO Tools",
    "icon": "📈",
    "emoji": "📈",
    "description": "Website meta tag checkers and schema builders."
  },
  {
    "id": "security-tools",
    "name": "Security Tools",
    "icon": "🛡️",
    "emoji": "🛡️",
    "description": "Password strength checkers and leak scanners."
  },
  {
    "id": "business-tools",
    "name": "Business Tools",
    "icon": "💼",
    "emoji": "💼",
    "description": "E-signatures, expenses, and monthly budget trackers."
  },
  {
    "id": "expense-tracker",
    "name": "Expense Tracker",
    "icon": "💳",
    "emoji": "💳",
    "description": "Log outflows, track limits, and budget your finances."
  },
  {
    "id": "social-tools",
    "name": "Social Tools",
    "icon": "📱",
    "emoji": "📱",
    "description": "Link-in-bio builders and direct file shares."
  },
  {
    "id": "productivity-tools",
    "name": "Productivity Tools",
    "icon": "⏱️",
    "emoji": "⏱️",
    "description": "Timers, schedules, planners, and task lists."
  },
  {
    "id": "utility-tools",
    "name": "Utility Tools",
    "icon": "🛠️",
    "emoji": "🛠️",
    "description": "Decision wheels and custom utility boards."
  },
  {
    "id": "document-tools",
    "name": "Document Tools",
    "icon": "📁",
    "emoji": "📁",
    "description": "Local document editors and converters."
  },
  {
    "id": "generator-tools",
    "name": "Generator Tools",
    "icon": "⚙️",
    "emoji": "⚙️",
    "description": "QR code and strong password generators."
  },
  {
    "id": "calculator-tools",
    "name": "Calculator Tools",
    "icon": "🧮",
    "emoji": "🧮",
    "description": "Dose, drip, discount, BMI, and percentage calculators."
  },
  {
    "id": "converter-tools",
    "name": "Converter Tools",
    "icon": "🔄",
    "emoji": "🔄",
    "description": "URL converters, Morse translators, and units."
  },
  {
    "id": "file-tools",
    "name": "File Tools",
    "icon": "📁",
    "emoji": "📁",
    "description": "Bulk renamers and file utilities."
  },
  {
    "id": "coding-tools",
    "name": "Coding Tools",
    "icon": "💻",
    "emoji": "💻",
    "description": "JSON and code development helpers."
  },
  {
    "id": "cloud-tools",
    "name": "Cloud Tools",
    "icon": "☁️",
    "emoji": "☁️",
    "description": "Direct p2p secured cloud file transfers."
  },
  {
    "id": "automation-tools",
    "name": "Automation Tools",
    "icon": "⚡",
    "emoji": "⚡",
    "description": "Daily routines and notification alerts."
  },
  {
    "id": "creator-tools",
    "name": "Creator Tools",
    "icon": "🎨",
    "emoji": "🎨",
    "description": "Drawing signatures and visual assets."
  },
  {
    "id": "research-tools",
    "name": "Research Tools",
    "icon": "🔍",
    "emoji": "🔍",
    "description": "Graph builders and spreadsheet readers."
  },
  {
    "id": "writing-tools",
    "name": "Writing Tools",
    "icon": "✍️",
    "emoji": "✍️",
    "description": "AI essay, blog, and article writers."
  },
  {
    "id": "marketing-tools",
    "name": "Marketing Tools",
    "icon": "📢",
    "emoji": "📢",
    "description": "SEO landing page checkers."
  },
  {
    "id": "compression-tools",
    "name": "Compression Tools",
    "icon": "🗜️",
    "emoji": "🗜️",
    "description": "Image, vector, and PDF compressors."
  },
  {
    "id": "media-tools",
    "name": "Media Tools",
    "icon": "🎬",
    "emoji": "🎬",
    "description": "Audio extractors and video subtitles generator."
  },
  {
    "id": "survey-tools",
    "name": "Survey Tools",
    "icon": "📊",
    "emoji": "📊",
    "description": "Interactive survey form builders."
  }
];


export const tools: ToolDefinition[] = [
  // Health Utility Hub
  {
    id: 'bmicalculator',
    name: 'Body Weight & Health Analyzer (BMI)',
    description: 'Calculate your Body Mass Index (BMI) instantly for weight assessments.',
    category: 'calculator-tools',
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
    category: 'calculator-tools',
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
    category: 'calculator-tools',
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
    category: 'calculator-tools',
    icon: '📅',
    type: 'custom',
    componentName: 'MedicationReminder'
  },

  // Daily Essentials
  {
    id: 'todolist',
    name: 'Daily Tasks List & Progress Tracker',
    description: 'Interactive checklist synced to Firebase Cloud backup.',
    category: 'productivity-tools',
    icon: '📝',
    type: 'custom',
    componentName: 'TodoList'
  },
  {
    id: 'notes',
    name: 'Quick Secure Notebook Vault',
    description: 'Write quick notes. Synced to Firestore automatically.',
    category: 'productivity-tools',
    icon: '📓',
    type: 'custom',
    componentName: 'QuickNotes'
  },
  {
    id: 'timer',
    name: 'Pomodoro Study Focus Timer',
    description: 'High-performance Pomodoro and count down watch.',
    category: 'productivity-tools',
    icon: '⏱️',
    type: 'custom',
    componentName: 'FocusTimer'
  },

  // Expense Tracker Suite (Custom Component maps)
  {
    id: 'expenseadd',
    name: 'Record Daily Expense',
    description: 'Record new outflow transactions with direct cloud save.',
    category: 'expense-tracker',
    icon: '➕',
    type: 'custom',
    componentName: 'ExpenseTrackerSuite'
  },
  {
    id: 'expenselist',
    name: 'View Expense Records History',
    description: 'Sort and filter historical purchases.',
    category: 'expense-tracker',
    icon: '📋',
    type: 'custom',
    componentName: 'ExpenseTrackerSuite'
  },
  {
    id: 'budgettracker',
    name: 'Savings & Monthly Budget Planner',
    description: 'Set spending limits by category and track progress bar indicators.',
    category: 'expense-tracker',
    icon: '🎯',
    type: 'custom',
    componentName: 'ExpenseTrackerSuite'
  },
  {
    id: 'expenseanalytics',
    name: 'Spending Visual Graphs & Charts',
    description: 'Beautiful interactive spending distribution and trends.',
    category: 'expense-tracker',
    icon: '📈',
    type: 'custom',
    componentName: 'ExpenseTrackerSuite'
  },
  {
    id: 'dailymonthlyreport',
    name: 'Printable Expense & Income Statements Builder',
    description: 'Generate a unified report of yesterday, today, and current month outflows.',
    category: 'expense-tracker',
    icon: '📅',
    type: 'custom',
    componentName: 'DailyMonthlyReport'
  },
  {
    id: 'searchexpenses',
    name: 'Search & Filter Expenses',
    description: 'Query transactions using custom key tags, dates, and amount thresholds.',
    category: 'expense-tracker',
    icon: '🔍',
    type: 'custom',
    componentName: 'SearchExpenses'
  },
  {
    id: 'topspendinginsights',
    name: 'Where Do I Spend Most? (Spending Chart)',
    description: 'Identify high-volume expense categories and evaluate key budget drains.',
    category: 'expense-tracker',
    icon: '💡',
    type: 'custom',
    componentName: 'TopSpendingInsights'
  },
  {
    id: 'resetexpenses',
    name: 'Reset & Delete Expense Records',
    description: 'Permanently erase all your logged transaction history and reset spending ledgers.',
    category: 'expense-tracker',
    icon: '🗑️',
    type: 'custom',
    componentName: 'ResetExpenses'
  },

  // AI Tools
  {
    id: 'chatbot',
    name: 'Infinity AI Chat & Assistant',
    description: 'Premium chatbot interface powered by advanced Gemini models.',
    category: 'ai-tools',
    icon: '🤖',
    type: 'custom',
    componentName: 'AIChatbot'
  },
  {
    id: 'text-improver',
    name: 'AI Smart Text Improver',
    description: 'Rewrite, fix grammar, and elevate the tone of your documents.',
    category: 'ai-tools',
    icon: '✨',
    type: 'custom',
    componentName: 'AITextImprover'
  },
  {
    id: 'summarizer',
    name: 'AI Smart Text Summarizer',
    description: 'Distill long essays or articles into highly cohesive outlines.',
    category: 'ai-tools',
    icon: '📝',
    type: 'custom',
    componentName: 'AISummarizer'
  },
  {
    id: 'image-generator',
    name: 'AI Canvas Art Generator',
    description: 'Convert descriptive sentences into visual graphics.',
    category: 'ai-tools',
    icon: '🎨',
    type: 'custom',
    componentName: 'AIImageGenerator'
  },
  {
    id: 'essay-writer',
    name: 'AI Essay Writer',
    description: 'Draft well-structured, professional academic essays instantly using advanced AI language models.',
    category: 'writing-tools',
    icon: '✍️',
    type: 'custom',
    componentName: 'EssayWriter'
  },
  {
    id: 'article-writer',
    name: 'AI Article Writer',
    description: 'Draft SEO-optimized articles, news pieces, and journalistic columns instantly with highly engaging headlines.',
    category: 'writing-tools',
    icon: '📰',
    type: 'custom',
    componentName: 'ArticleWriter'
  },
  {
    id: 'blog-generator',
    name: 'AI Blog Post Generator',
    description: 'Draft friendly, shareable, and engaging blog posts tailored to your exact niche and audience.',
    category: 'writing-tools',
    icon: '💬',
    type: 'custom',
    componentName: 'BlogGenerator'
  },
  {
    id: 'faq-generator',
    name: 'AI FAQ Generator',
    description: 'Generate frequently asked questions (FAQs) and answers for your website, landing page, or product docs instantly.',
    category: 'writing-tools',
    icon: '❓',
    type: 'custom',
    componentName: 'FAQGenerator'
  },
  {
    id: 'ai-rewriter',
    name: 'AI Content Rewriter',
    description: 'Rewrite, paraphrase, expand, or simplify any content locally using advanced machine learning models.',
    category: 'writing-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'AIRewriter'
  },
  {
    id: 'ai-humanizer',
    name: 'AI Text Humanizer',
    description: 'Convert robotic or AI-generated copy into highly natural, organic, human-sounding text.',
    category: 'writing-tools',
    icon: '👤',
    type: 'custom',
    componentName: 'AIHumanizer'
  },
  {
    id: 'grammar-fixer',
    name: 'AI Grammar Fixer',
    description: 'Correct all spelling mistakes, grammatical errors, and sentence structure issues instantly.',
    category: 'writing-tools',
    icon: '🛠️',
    type: 'custom',
    componentName: 'GrammarFixer'
  },

  // Utilities
  {
    id: 'passwordgen',
    name: 'Random Strong Password Generator',
    description: 'Build strong cryptographic keys with symbols, casing, and lengths.',
    category: 'generator-tools',
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
    category: 'generator-tools',
    icon: '📱',
    type: 'custom',
    componentName: 'QRCodeGenerator'
  },
  {
    id: 'unitconverter',
    name: 'All-in-One Measurement Units Converter',
    description: 'Transform values between lengths, weights, areas, and temperatures.',
    category: 'converter-tools',
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
    category: 'calculator-tools',
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
    category: 'calculator-tools',
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
    category: 'calculator-tools',
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
    category: 'converter-tools',
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
    category: 'text-tools',
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
    category: 'text-tools',
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
    category: 'calculator-tools',
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
    category: 'calculator-tools',
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
    category: 'calculator-tools',
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
    category: 'calculator-tools',
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
    category: 'text-tools',
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
    category: 'text-tools',
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
    category: 'student-tools',
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
    category: 'student-tools',
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
    category: 'coding-tools',
    icon: '📊',
    type: 'custom',
    componentName: 'GraphMaker'
  },

  // Remove duplicates
  {
    id: 'removeduplicates',
    name: 'Remove Duplicate Words & Clean Text',
    description: 'Clean your text by identifying and removing duplicate words, leaving you with a clean, unique dataset.',
    category: 'text-tools',
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
    category: 'generator-tools',
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
    category: 'creator-tools',
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
    category: 'security-tools',
    icon: '🔒',
    type: 'custom',
    componentName: 'EncryptedNote'
  },
  // Dynamic Bridged Legacy Tools
  {
    id: 'dailyplanner',
    name: 'Daily Schedule & Routine Planner',
    description: 'Plan your day with a visual timeline, interactive hourly schedules, and progress tracking.',
    category: 'productivity-tools',
    icon: '📅',
    type: 'custom',
    componentName: 'DailyPlanner'
  },
  {
    id: 'calendarviewer',
    name: 'Simple Calendar Event Scheduler',
    description: 'Manage month views, select multiple dates, and log key visual events.',
    category: 'productivity-tools',
    icon: '📅',
    type: 'custom',
    componentName: 'InteractiveCalendar'
  },
  {
    id: 'reminderalert',
    name: 'Custom Alarm & Reminder System',
    description: 'Schedule custom local notification alerts and track active intervals.',
    category: 'productivity-tools',
    icon: '🔔',
    type: 'custom',
    componentName: 'NotificationScheduler'
  },
  {
    id: 'men-prompts',
    name: 'Persona Prompts (Men)',
    description: 'Targeted persona prompts for creative brainstorming and content generation tailored to male contexts.',
    category: 'ai-tools',
    icon: '✨',
    type: 'custom',
    componentName: 'PersonaPromptsMen'
  },
  {
    id: 'women-prompts',
    name: 'Persona Prompts (Women)',
    description: 'Targeted persona prompts for creative brainstorming and content generation tailored to female contexts.',
    category: 'ai-tools',
    icon: '✨',
    type: 'custom',
    componentName: 'PersonaPromptsWomen'
  },
  {
    id: 'svg-optimizer',
    name: 'SVG Vector Image Compressor',
    description: 'Minify and optimize raw SVG markup to reduce web page load times.',
    category: 'compression-tools',
    icon: '🌐',
    type: 'custom',
    componentName: 'SVGOptimizer'
  },
  {
    id: 'password-leak',
    name: 'Password Data Breach Database Checker',
    description: 'Check if your common passwords have been exposed in known historical data breaches.',
    category: 'security-tools',
    icon: '🕵️‍♂️',
    type: 'custom',
    componentName: 'PasswordLeakScanner'
  },
  {
    id: 'note-shredder',
    name: 'Self-Destructing Secret Notes',
    description: 'Write high-confidentiality notes that auto-delete completely on close or shredding.',
    category: 'security-tools',
    icon: '🗑️',
    type: 'custom',
    componentName: 'NoteShredder'
  },
  {
    id: 'csvviewer',
    name: 'CSV Spreadsheet Table Viewer',
    description: 'Load, edit, filter, and export CSV tabular sheets fully inside your local browser.',
    category: 'document-tools',
    icon: '📊',
    type: 'custom',
    componentName: 'CSVViewer'
  },
  {
    id: 'metatagviewer',
    name: 'Website Search Engine Meta Tag Inspector',
    description: 'Extract and audit HTML SEO meta headers, descriptions, and OpenGraph parameters.',
    category: 'marketing-tools',
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
    category: 'converter-tools',
    icon: '✍️',
    type: 'custom',
    componentName: 'MorseCodeTranslator'
  },
  {
    id: 'p2p-share',
    name: 'Direct Secure File Transfer (P2P Share)',
    description: 'Direct peer-to-peer browser local file sharing backed by secure WebRTC channels.',
    category: 'cloud-tools',
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
    category: 'student-tools',
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
    category: 'security-tools',
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
    category: 'compression-tools',
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
    category: 'text-tools',
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
    category: 'file-tools',
    icon: '📁',
    type: 'custom',
    componentName: 'ImageToPDF'
  },
  {
    id: 'pdftoimage',
    name: 'Convert PDF Pages to Images',
    description: 'Render individual PDF document pages as downloadable high-resolution PNG photos.',
    category: 'file-tools',
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
    id: 'compresspdf',
    name: 'Reduce PDF Document File Size',
    description: 'Optimize and compress PDF document sizes local-first without quality loss.',
    category: 'compression-tools',
    icon: '📉',
    type: 'custom',
    componentName: 'CompressPDF'
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
    id: 'rearrange-pdf',
    name: 'Rearrange PDF Pages',
    description: 'Reorder pages visually in any sequence of your PDF document in-browser.',
    category: 'pdf-tools',
    icon: '🔁',
    type: 'custom',
    componentName: 'RearrangePDF'
  },
  {
    id: 'delete-pdf-pages',
    name: 'Delete Pages from PDF',
    description: 'Delete specific pages visually from your PDF document container locally.',
    category: 'pdf-tools',
    icon: '🗑️',
    type: 'custom',
    componentName: 'DeletePDFPages'
  },
  {
    id: 'duplicate-pdf-pages',
    name: 'Duplicate PDF Pages',
    description: 'Clone and duplicate PDF page layouts visually client-side.',
    category: 'pdf-tools',
    icon: '👥',
    type: 'custom',
    componentName: 'DuplicatePDFPages'
  },
  {
    id: 'crop-pdf',
    name: 'Crop PDF Margins & Bounding Boxes',
    description: 'Crop white margins or customize page boundaries visually in your PDF document.',
    category: 'pdf-tools',
    icon: '✂️',
    type: 'custom',
    componentName: 'CropPDFPages'
  },
  {
    id: 'add-pdf-header-footer',
    name: 'Add Custom PDF Headers & Footers',
    description: 'Format page layouts with standard margin texts, titles, or dates.',
    category: 'pdf-tools',
    icon: '🏷️',
    type: 'custom',
    componentName: 'AddPDFHeaderFooter'
  },
  {
    id: 'add-pdf-page-numbers',
    name: 'Stamp Page Numbers on PDF',
    description: 'Add dynamic pagination stamps (Page X of Y) visually to all document pages.',
    category: 'pdf-tools',
    icon: '#️⃣',
    type: 'custom',
    componentName: 'AddPDFPageNumbers'
  },
  {
    id: 'add-pdf-text',
    name: 'Add Custom Text to PDF',
    description: 'Type and overlay custom text strings anywhere on PDF documents in-browser.',
    category: 'pdf-tools',
    icon: '✍️',
    type: 'custom',
    componentName: 'AddPDFText'
  },
  {
    id: 'remove-pdf-restrictions',
    name: 'Strip PDF Password & Owner Restrictions',
    description: 'Remove copy, paste, modify, and printing restrictions from locked PDFs locally.',
    category: 'pdf-tools',
    icon: '🔓',
    type: 'custom',
    componentName: 'RemovePDFRestrictions'
  },
  {
    id: 'ocr-pdf',
    name: 'OCR Scanned PDF Text Scraper',
    description: 'Scan and extract selectable, searchable text from image-only PDFs locally.',
    category: 'pdf-tools',
    icon: '🔍',
    type: 'custom',
    componentName: 'OCRPDF'
  },
  {
    id: 'extract-pdf-text',
    name: 'Extract Text Layers from PDF',
    description: 'Extract raw text layouts page-by-page from clean PDFs instantly.',
    category: 'pdf-tools',
    icon: '📄',
    type: 'custom',
    componentName: 'ExtractPDFText'
  },
  {
    id: 'extract-pdf-images',
    name: 'Extract Raw Embedded Images from PDF',
    description: 'Scan the operator stream and download all embedded raster image files in a zip.',
    category: 'pdf-tools',
    icon: '🖼️',
    type: 'custom',
    componentName: 'ExtractPDFImages'
  },
  {
    id: 'translate-pdf',
    name: 'Translate PDF Text Content',
    description: 'Translate PDF text blocks page-by-page and recompile to translated PDF.',
    category: 'pdf-tools',
    icon: '🌐',
    type: 'custom',
    componentName: 'TranslatePDF'
  },
  {
    id: 'pdf-to-word',
    name: 'Convert PDF to Editable Word (.docx)',
    description: 'Convert PDF files into fully editable Microsoft Word documents locally.',
    category: 'pdf-tools',
    icon: '📝',
    type: 'custom',
    componentName: 'PDFToWord'
  },
  {
    id: 'word-to-pdf',
    name: 'Convert Word to PDF (.docx)',
    description: 'Convert Word .docx and .doc files to standard PDF documents client-side.',
    category: 'pdf-tools',
    icon: '📕',
    type: 'custom',
    componentName: 'WordToPDF'
  },
  {
    id: 'pdf-to-jpg',
    name: 'Convert PDF to JPEG Images Pack',
    description: 'Extract and render PDF pages into JPEG format zip packs.',
    category: 'pdf-tools',
    icon: '🖼️',
    type: 'custom',
    componentName: 'PDFToJPG'
  },
  {
    id: 'pdf-to-png',
    name: 'Convert PDF to PNG Images Pack',
    description: 'Extract and render PDF pages into transparent PNG format zip packs.',
    category: 'pdf-tools',
    icon: '🎨',
    type: 'custom',
    componentName: 'PDFToPNG'
  },
  {
    id: 'pdf-to-excel',
    name: 'Convert PDF to Excel Spreadsheet (.xls)',
    description: 'Group text grid lines and export PDF tables into Excel sheets.',
    category: 'pdf-tools',
    icon: '📊',
    type: 'custom',
    componentName: 'PDFToExcel'
  },
  {
    id: 'pdf-to-csv',
    name: 'Convert PDF to Comma-Separated Values (.csv)',
    description: 'Extract raw tables and download comma-delimited CSV text files.',
    category: 'pdf-tools',
    icon: '📊',
    type: 'custom',
    componentName: 'PDFToCSV'
  },
  {
    id: 'pdf-to-html',
    name: 'Convert PDF to Webpage HTML Index',
    description: 'Convert PDF page paragraphs to structured, styled HTML templates.',
    category: 'pdf-tools',
    icon: '🌐',
    type: 'custom',
    componentName: 'PDFToHTML'
  },
  {
    id: 'html-to-pdf',
    name: 'Convert HTML Web Files to PDF',
    description: 'Compile webpage files or html markup codes to paginated PDFs.',
    category: 'pdf-tools',
    icon: '📕',
    type: 'custom',
    componentName: 'HTMLToPDF'
  },
  {
    id: 'pdf-to-txt',
    name: 'Convert PDF to Plain Text (.txt)',
    description: 'Extract raw character streams to plain text notepad files.',
    category: 'pdf-tools',
    icon: '📄',
    type: 'custom',
    componentName: 'PDFToTXT'
  },
  {
    id: 'txt-to-pdf',
    name: 'Convert Notepad Text to PDF',
    description: 'Compile plain text documents into paginated, formatted PDFs.',
    category: 'pdf-tools',
    icon: '📕',
    type: 'custom',
    componentName: 'TXTToPDF'
  },
  {
    id: 'pdf-to-epub',
    name: 'Convert PDF to Reflowable EPUB Ebook',
    description: 'Package PDF page layout text to standardized EPUB digital e-reader files.',
    category: 'pdf-tools',
    icon: '📚',
    type: 'custom',
    componentName: 'PDFToEPUB'
  },
  {
    id: 'epub-to-pdf',
    name: 'Convert EPUB Ebook to PDF Document',
    description: 'Unzip EPUB ebook files and compile XHTML spine contents to PDF.',
    category: 'pdf-tools',
    icon: '📕',
    type: 'custom',
    componentName: 'EPUBToPDF'
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
    category: 'audio-tools',
    icon: '⚡',
    type: 'custom',
    componentName: 'TextToSpeech'
  },
  {
    id: 'urlextractor',
    name: 'Extract Query Fields from URL Links',
    description: 'Parse query string URL fields and dissect key-value parameters into an organized table.',
    category: 'converter-tools',
    icon: '🔗',
    type: 'custom',
    componentName: 'URLExtractor'
  },
  {
    id: 'glass-gen',
    name: 'Frosty Glass CSS Card Designer',
    description: 'Design custom glassmorphic elements and copy clean CSS backdrop-filter style code.',
    category: 'coding-tools',
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
    category: 'social-tools',
    icon: '📱',
    type: 'custom',
    componentName: 'LinkInBio'
  },
  {
    id: 'passwordsaver',
    name: 'Encrypted Password Keeper (Offline Vault)',
    description: 'Store and manage your log keys locally using secure browser database sandboxes.',
    category: 'security-tools',
    icon: '🔑',
    type: 'custom',
    componentName: 'PasswordVault'
  },
  {
    id: 'surveybuilder',
    name: 'Custom Interactive Survey Builder',
    description: 'Create fully interactive custom survey questionnaires with multi-field forms.',
    category: 'survey-tools',
    icon: '📈',
    type: 'custom',
    componentName: 'SurveyBuilder'
  },
  {
    id: 'mysurveys',
    name: 'My Surveys & Questionnaires Dashboard',
    description: 'Manage your active questionnaires, edit field titles, and view live response URLs.',
    category: 'survey-tools',
    icon: '📈',
    type: 'custom',
    componentName: 'MySurveys'
  },
  {
    id: 'responseviewer',
    name: 'Survey Results & Submissions Analyst',
    description: 'Track survey submission tallies, check visual stats, and export excel rows.',
    category: 'survey-tools',
    icon: '📈',
    type: 'custom',
    componentName: 'ResponseViewer'
  },
  {
    id: 'smartsuggestions',
    name: 'Refine Prompts for AI Chatbots',
    description: 'Refine prompts using specialized creative guidelines to yield elite AI text results.',
    category: 'ai-tools',
    icon: '✨',
    type: 'custom',
    componentName: 'SmartPromptEditor'
  },
  {
    id: 'publicsurvey',
    name: 'Interactive Survey Submission Form',
    description: 'Interactive responsive questionnaire portal for submitting survey answers.',
    category: 'survey-tools',
    icon: '📈',
    type: 'custom',
    componentName: 'PublicSurvey'
  },
  {
    id: 'categorysummary',
    name: 'Spreadsheet Columns Data Summarizer',
    description: 'Generate visual insights, graphs, and percentage counts from tabular dataset columns.',
    category: 'research-tools',
    icon: '📊',
    type: 'custom',
    componentName: 'CategorySummary'
  },
  // --- Video Editing Ecosystem ---
  {
    id: 'compress-video',
    name: 'Compress Video File',
    description: 'Reduce video file size by adjusting compression level and presets.',
    category: 'video-tools',
    icon: '🗜️',
    type: 'custom',
    componentName: 'CompressVideo'
  },
  {
    id: 'trim-video',
    name: 'Trim Video Clip',
    description: 'Cut out segments from a video clip by specifying start and end times.',
    category: 'video-tools',
    icon: '✂️',
    type: 'custom',
    componentName: 'TrimVideo'
  },
  {
    id: 'crop-video',
    name: 'Crop Video Layout',
    description: 'Crop video dimensions using standard ratios (1:1, 16:9, 9:16) or custom bounds.',
    category: 'video-tools',
    icon: '📐',
    type: 'custom',
    componentName: 'CropVideo'
  },
  {
    id: 'resize-video',
    name: 'Resize Video Pixels',
    description: 'Scale video resolution width and height while maintaining aspect ratios.',
    category: 'video-tools',
    icon: '📐',
    type: 'custom',
    componentName: 'ResizeVideo'
  },
  {
    id: 'rotate-video',
    name: 'Rotate Video Orientation',
    description: 'Rotate video files by 90, 180, or 270 degrees clockwise or counter-clockwise.',
    category: 'video-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'RotateVideo'
  },
  {
    id: 'reverse-video',
    name: 'Reverse Video Playback',
    description: 'Generate backward-playing video and audio tracks.',
    category: 'video-tools',
    icon: '⏪',
    type: 'custom',
    componentName: 'ReverseVideo'
  },
  {
    id: 'merge-video',
    name: 'Merge Multiple Videos',
    description: 'Concatenate multiple video clips together sequentially.',
    category: 'video-tools',
    icon: '🎞️',
    type: 'custom',
    componentName: 'MergeVideo'
  },
  {
    id: 'split-video',
    name: 'Split Video Clip',
    description: 'Cut a video into two separate sequential parts at a specific timestamp.',
    category: 'video-tools',
    icon: '🥞',
    type: 'custom',
    componentName: 'SplitVideo'
  },

  // --- Video Conversion Ecosystem ---
  {
    id: 'convert-mp4-mov',
    name: 'MP4 to MOV Converter',
    description: 'Convert MP4 video files into Apple QuickTime MOV format.',
    category: 'video-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'ConvertMp4Mov'
  },
  {
    id: 'convert-mov-mp4',
    name: 'MOV to MP4 Converter',
    description: 'Convert Apple QuickTime MOV videos into standard MP4 format.',
    category: 'video-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'ConvertMovMp4'
  },
  {
    id: 'convert-mp4-webm',
    name: 'MP4 to WEBM Converter',
    description: 'Convert MP4 videos into open WebM format optimized for web streaming.',
    category: 'video-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'ConvertMp4Webm'
  },
  {
    id: 'convert-webm-mp4',
    name: 'WEBM to MP4 Converter',
    description: 'Convert WebM videos into standard high-compatibility MP4 format.',
    category: 'video-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'ConvertWebmMp4'
  },
  {
    id: 'convert-mkv-mp4',
    name: 'MKV to MP4 Converter',
    description: 'Convert Matroska MKV files into standard H264 MP4 videos.',
    category: 'video-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'ConvertMkvMp4'
  },
  {
    id: 'convert-mp4-mkv',
    name: 'MP4 to MKV Converter',
    description: 'Convert MP4 videos into highly flexible Matroska MKV container format.',
    category: 'video-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'ConvertMp4Mkv'
  },
  {
    id: 'convert-avi-mp4',
    name: 'AVI to MP4 Converter',
    description: 'Convert Microsoft AVI legacy videos into modern high-efficiency MP4 format.',
    category: 'video-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'ConvertAviMp4'
  },
  {
    id: 'convert-mp4-avi',
    name: 'MP4 to AVI Converter',
    description: 'Convert MP4 videos into high-compatibility AVI container format.',
    category: 'video-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'ConvertMp4Avi'
  },

  // --- Video AI Ecosystem ---
  {
    id: 'ai-subtitle-gen',
    name: 'AI Video Subtitle Generator',
    description: 'Transcribe audio tracks using Google Gemini AI and export clean WebVTT subtitle files.',
    category: 'ai-tools',
    icon: '🤖',
    type: 'custom',
    componentName: 'AISubtitleGen'
  },
  {
    id: 'ai-video-summary',
    name: 'AI Video Content Summarizer',
    description: 'Extract audio and generate structural markdown notes of key points and highlights.',
    category: 'ai-tools',
    icon: '🤖',
    type: 'custom',
    componentName: 'AIVideoSummary'
  },
  {
    id: 'ai-transcript',
    name: 'AI Video Audio Transcript',
    description: 'Transcribe video speech to plain text using advanced neural speech recognition.',
    category: 'ai-tools',
    icon: '🤖',
    type: 'custom',
    componentName: 'AITranscript'
  },
  {
    id: 'ai-shorts-gen',
    name: 'AI Shorts Clip Generator',
    description: 'Clip the most engaging 15-45s highlight and crop into vertical 9:16 aspect ratio.',
    category: 'ai-tools',
    icon: '🤖',
    type: 'custom',
    componentName: 'AIShortsGen'
  },
  {
    id: 'ai-reels-gen',
    name: 'AI Reels Clip Generator',
    description: 'Extract high-engagement highlights from video files and crop into vertical 9:16 layout.',
    category: 'ai-tools',
    icon: '🤖',
    type: 'custom',
    componentName: 'AIReelsGen'
  },

  // --- Video Utilities Ecosystem ---
  {
    id: 'extract-audio',
    name: 'Extract Audio Track',
    description: 'Extract MP3 or WAV audio files directly from video containers.',
    category: 'video-tools',
    icon: '🎵',
    type: 'custom',
    componentName: 'ExtractAudio'
  },
  {
    id: 'mute-video',
    name: 'Mute Video (Silent Track)',
    description: 'Generate video files with all audio tracks completely stripped.',
    category: 'video-tools',
    icon: '🔇',
    type: 'custom',
    componentName: 'MuteVideo'
  },
  {
    id: 'video-to-gif',
    name: 'Convert Video to GIF',
    description: 'Convert MP4/WebM videos into high-quality animated GIFs with custom sizes and framerates.',
    category: 'video-tools',
    icon: '🎬',
    type: 'custom',
    componentName: 'VideoToGIF'
  },
  {
    id: 'thumbnail-extractor',
    name: 'Extract Video Thumbnail',
    description: 'Seek to a custom timestamp and capture a high-res PNG frame screenshot.',
    category: 'video-tools',
    icon: '📷',
    type: 'custom',
    componentName: 'ThumbnailExtractor'
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
    id: 'ambient-noise-player',
    name: 'Focus Ambient Noise Mixer (Rain, Forest)',
    description: 'Synthesize custom natural white noises and relaxing soundscapes client-side for maximum productivity.',
    category: 'audio-tools',
    icon: '🎧',
    type: 'custom',
    componentName: 'AmbientNoisePlayer'
  },
  
  // Image Editing
  {
    id: 'resize-image',
    name: 'Resize Image Pixels',
    description: 'Adjust image width and height coordinates client-side with aspect ratio locking.',
    category: 'image-tools',
    icon: '🖼️',
    type: 'custom',
    componentName: 'ResizeImage'
  },
  {
    id: 'compress-image',
    name: 'Compress Image File Size',
    description: 'Compress and optimize JPEG/PNG image sizes local-first without loss of quality.',
    category: 'image-tools',
    icon: '📉',
    type: 'custom',
    componentName: 'CompressImage'
  },
  {
    id: 'crop-image',
    name: 'Crop Image Layout',
    description: 'Crop images using customizable aspect ratio presets and draggable selector grids.',
    category: 'image-tools',
    icon: '✂️',
    type: 'custom',
    componentName: 'CropImage'
  },
  {
    id: 'rotate-image',
    name: 'Rotate Image Angle',
    description: 'Rotate images by 90-degree steps or fine-tune with precision angle sliders.',
    category: 'image-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'RotateImage'
  },
  {
    id: 'flip-image',
    name: 'Flip Image Axis',
    description: 'Flip images horizontally or vertically in real-time client-side.',
    category: 'image-tools',
    icon: '↔️',
    type: 'custom',
    componentName: 'FlipImage'
  },
  {
    id: 'blur-image',
    name: 'Gaussian Image Blur',
    description: 'Apply adjustable Gaussian blur filters to soften details or create background effects.',
    category: 'image-tools',
    icon: '📸',
    type: 'custom',
    componentName: 'BlurImage'
  },
  {
    id: 'sharpen-image',
    name: 'Sharpen Image Details',
    description: 'Enhance image boundaries and clarify fine details using edge convolution kernels.',
    category: 'image-tools',
    icon: '✨',
    type: 'custom',
    componentName: 'SharpenImage'
  },
  {
    id: 'pixelate-image',
    name: 'Retro Pixelate Image',
    description: 'Convert images to retro pixel-art style by adjusting block pixel dimensions.',
    category: 'image-tools',
    icon: '👾',
    type: 'custom',
    componentName: 'PixelateImage'
  },

  // AI Image
  {
    id: 'ai-image-generator',
    name: 'AI Image Generator',
    description: 'Generate stunning graphic assets using advanced prompt synthesis.',
    category: 'ai-tools',
    icon: '🎨',
    type: 'custom',
    componentName: 'AIImageGenerator'
  },
  {
    id: 'ai-art-generator',
    name: 'AI Art Generator',
    description: 'Convert plain text inputs into beautiful art styles like Cyberpunk or Watercolor.',
    category: 'ai-tools',
    icon: '🎭',
    type: 'custom',
    componentName: 'AIArtGenerator'
  },
  {
    id: 'ai-avatar-generator',
    name: 'AI Avatar Generator',
    description: 'Create customized 3D cartoon or digital avatars for profiles.',
    category: 'ai-tools',
    icon: '👤',
    type: 'custom',
    componentName: 'AIAvatarGenerator'
  },
  {
    id: 'ai-headshot-generator',
    name: 'AI Headshot Generator',
    description: 'Synthesize LinkedIn or studio-grade professional profile pictures.',
    category: 'ai-tools',
    icon: '👔',
    type: 'custom',
    componentName: 'AIHeadshotGenerator'
  },
  {
    id: 'ai-logo-generator',
    name: 'AI Logo Generator',
    description: 'Design minimalist flat vector badges and branding icons.',
    category: 'ai-tools',
    icon: '🏷️',
    type: 'custom',
    componentName: 'AILogoGenerator'
  },
  {
    id: 'ai-wallpaper-generator',
    name: 'AI Wallpaper Generator',
    description: 'Generate wide high-resolution desktop or landscape backgrounds.',
    category: 'ai-tools',
    icon: '🖥️',
    type: 'custom',
    componentName: 'AIWallpaperGenerator'
  },
  {
    id: 'ai-poster-generator',
    name: 'AI Poster Generator',
    description: 'Design beautiful, vertical poster layout prints using text prompts.',
    category: 'ai-tools',
    icon: '📜',
    type: 'custom',
    componentName: 'AIPosterGenerator'
  },

  // Image AI Editing
  {
    id: 'remove-background',
    name: 'AI Remove Background',
    description: 'Strip background layers from images automatically using local chroma-keys or APIs.',
    category: 'image-tools',
    icon: '✂️',
    type: 'custom',
    componentName: 'RemoveBackground'
  },
  {
    id: 'remove-objects',
    name: 'AI Remove Objects',
    description: 'Brush and erase unwanted objects from images with client-side texture matching.',
    category: 'image-tools',
    icon: '🧼',
    type: 'custom',
    componentName: 'RemoveObjects'
  },
  {
    id: 'remove-watermark',
    name: 'AI Remove Watermark',
    description: 'Highlight and erase visual watermark overlays from photos instantly.',
    category: 'image-tools',
    icon: '💧',
    type: 'custom',
    componentName: 'RemoveWatermark'
  },
  {
    id: 'remove-text',
    name: 'AI Remove Text',
    description: 'Scrub typed captions or labels from graphics using inpainting diffusions.',
    category: 'image-tools',
    icon: '📝',
    type: 'custom',
    componentName: 'RemoveText'
  },
  {
    id: 'colorize-image',
    name: 'AI Colorize Image',
    description: 'Apply duotone color schemes and warm/cool gradient maps to graphics.',
    category: 'image-tools',
    icon: '🌈',
    type: 'custom',
    componentName: 'ColorizeImage'
  },
  {
    id: 'restore-photos',
    name: 'AI Restore Photos',
    description: 'Restore faded retro photos using contrast-stretching auto-levels and sharpen filters.',
    category: 'image-tools',
    icon: '🎞️',
    type: 'custom',
    componentName: 'RestorePhotos'
  },

  // Converters
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    description: 'Batch convert PNG images to universal JPG format with quality sliders.',
    category: 'image-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'PNGToJPG'
  },
  {
    id: 'png-to-webp',
    name: 'PNG to WEBP Converter',
    description: 'Batch convert PNG graphics into modern high-efficiency WEBP formats.',
    category: 'image-tools',
    icon: '⚡',
    type: 'custom',
    componentName: 'PNGToWEBP'
  },
  {
    id: 'svg-to-png',
    name: 'SVG to PNG Converter',
    description: 'Render vector SVGs to high-resolution downloadable PNG graphics.',
    category: 'image-tools',
    icon: '🖼️',
    type: 'custom',
    componentName: 'SVGToPNG'
  },
  {
    id: 'heic-to-jpg',
    name: 'HEIC to JPG Converter',
    description: 'Decode Apple proprietary HEIC photos to standard JPEG formats client-side.',
    category: 'image-tools',
    icon: '🍏',
    type: 'custom',
    componentName: 'HEICToJPG'
  },
  {
    id: 'avif-to-png',
    name: 'AVIF to PNG Converter',
    description: 'Convert AVIF images into standard PNG files completely locally.',
    category: 'image-tools',
    icon: '📁',
    type: 'custom',
    componentName: 'AVIFToPNG'
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

export function mapCategoryToPath(catId: string): string {
  return catId;
}

export function mapPathToCategory(path: string): string {
  return path;
}
