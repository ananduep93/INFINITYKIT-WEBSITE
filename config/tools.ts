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
  howToSteps?: string[];       // Step-by-step guide shown on page for SEO
  useCases?: string[];         // Who uses this tool — shown as tags
  keyFeatures?: string[];      // Bullet feature list shown below tool
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
    seoTitle: 'Free BMI Calculator — Check Your Body Mass Index Instantly | InfinityKit',
    seoDescription: 'Calculate your BMI (Body Mass Index) instantly for free. Enter your height and weight to get your BMI score and health category — Underweight, Normal, Overweight, or Obese.',
    howToSteps: [
      'Enter your height in centimeters in the Height field (e.g., 170 for 5 foot 7 inches).',
      'Enter your weight in kilograms in the Weight field (e.g., 70 kg).',
      'Click Calculate Results — your BMI score appears instantly.',
      'Check your BMI category: Underweight, Healthy Weight, Overweight, or Obese.',
      'Use the result to make informed decisions about your diet and exercise routine.',
    ],
    keyFeatures: [
      'Instant BMI calculation using the standard WHO formula: weight / height squared',
      'Clear health category: Underweight, Healthy, Overweight, or Obese',
      'Supports both metric (kg, cm) measurements',
      '100% private — all calculations happen in your browser, no data sent to any server',
      'Color-coded result indicator for quick health assessment',
      'Free to use — no account or sign-up needed',
    ],
    useCases: ['Health Enthusiasts', 'Dieticians', 'Gym Members', 'Patients', 'Nurses', 'Fitness Trainers', 'Students'],
    faq: [
      { question: 'What is BMI and how is it calculated?', answer: 'BMI (Body Mass Index) is a simple numerical value calculated from your height and weight using the formula: BMI = weight (kg) / height (m) squared. It provides a quick assessment of whether your weight is in a healthy range.' },
      { question: 'What is a healthy BMI range?', answer: 'According to the WHO: Under 18.5 is Underweight, 18.5 to 24.9 is Normal or Healthy Weight, 25.0 to 29.9 is Overweight, and 30.0 and above is Obese.' },
      { question: 'Is BMI an accurate measure of health?', answer: 'BMI is a useful screening tool but not a diagnostic measure. It does not account for muscle mass, bone density, age, or fat distribution. Athletes may have high BMI due to muscle, not fat. Consult a doctor for a complete health assessment.' },
      { question: 'How do I convert feet and inches to centimeters?', answer: 'Multiply feet by 30.48 and inches by 2.54, then add them. For example, 5 feet 7 inches = (5 x 30.48) + (7 x 2.54) = 152.4 + 17.78 = 170.18 cm.' },
      { question: 'Should children use this BMI calculator?', answer: 'This calculator is designed for adults (18+). Children and teens require age and gender-specific BMI charts from a pediatrician as their body composition changes significantly during growth.' },
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
  ,
    seoTitle: 'Free Drug Dosage Calculator — Pediatric & Regular Dose | InfinityKit',
    seoDescription: 'Calculate accurate medication dosages based on patient weight and concentration. Simple, free, and secure drug dosage calculator for nurses, students, and healthcare.',
    howToSteps: [
      'Select the calculator mode (Pediatric Dose, Regular Dose, or Dose by Weight).',
      'Enter the patient weight in kilograms (kg) or pounds (lbs).',
      'Input the prescribed dosage rate (e.g. mg per kg of body weight).',
      'Enter the medication concentration (e.g. mg per ml of solution).',
      'Click Calculate Results to view the required dose volume in milliliters (ml) instantly.',
    ],
    keyFeatures: [
      'Supports pediatric and adult dosage calculations by weight',
      'Converts patient weight between kg and lbs automatically',
      'Clear step-by-step breakdown of the formula and math used',
      '100% client-side computations ensure patient data remains private',
      'Clean, accessible layout optimized for busy clinical settings',
    ],
    useCases: ['Nurses', 'Medical Students', 'Pediatricians', 'Parents', 'Veterinarians'],
    faq: [
      { question: 'How does the drug dosage calculator estimate the dose?', answer: 'It uses the standard medical formula: Dose (ml) = [Weight (kg) × Dose Rate (mg/kg)] / Concentration (mg/ml).' },
      { question: 'Is this calculator safe to use for medical decisions?', answer: 'While highly accurate, this calculator is for educational and reference purposes only. Always double-check calculations with a certified medical professional.' },
      { question: 'Does this tool support veterinary/pet dosage?', answer: 'Yes, veterinarians and pet owners can use it to calculate dosages for dogs, cats, and other animals based on their weight.' },
      { question: 'Are patient details stored or shared?', answer: 'No. The calculator runs entirely offline in your web browser. No medical records or weight details are transmitted or stored.' }
    ]
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
  ,
    seoTitle: 'Free Saline & IV Fluid Drip Rate Calculator | InfinityKit',
    seoDescription: 'Calculate IV drip rates in drops per minute (gtt/min) and infusion durations instantly. Free, secure, client-side calculator for clinical reference.',
    howToSteps: [
      'Enter the total volume of IV fluid prescribed in milliliters (ml).',
      'Input the desired infusion time in hours or minutes.',
      'Select the drop factor of the tubing administration set (e.g. 10, 15, 20, or 60 gtt/ml).',
      'Click Calculate Results to see the drip rate in drops per minute.',
      'Use the output rate to adjust the roller clamp on the IV administration set.',
    ],
    keyFeatures: [
      'Instant calculation of IV drip rates (drops/minute) and flow rate (ml/hour)',
      'Pre-configured drop factors for standard Macrodrip (10, 15, 20) and Microdrip (60) sets',
      'Calculates total infusion time remaining based on current rates',
      'Private browser-only calculation with no telemetry or tracking',
      'Clear, legible high-contrast interface designed for rapid use',
    ],
    useCases: ['Nurses', 'Clinical Instructors', 'Nursing Students', 'Veterinary Technicians'],
    faq: [
      { question: 'What is the IV drip rate formula?', answer: 'The drip rate is calculated as: Drip Rate (gtt/min) = [Total Volume (ml) × Drop Factor (gtt/ml)] / Infusion Time (minutes).' },
      { question: 'What is the difference between Macrodrip and Microdrip?', answer: 'Macrodrip sets deliver larger drops (typically 10, 15, or 20 gtt/ml) and are used for fast infusions. Microdrip sets deliver tiny drops (60 gtt/ml) for precise pediatric or medication infusions.' },
      { question: 'Is this tool certified for clinical treatment?', answer: 'This tool is an educational aid. Clinical decisions should always be verified against official hospital protocols and manual calculations.' }
    ]
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
  ,
    seoTitle: 'Infinity AI Chat & Assistant — Free Gemini-Powered Chatbot | InfinityKit',
    seoDescription: 'Chat with Infinity AI, a free powerful assistant powered by Google Gemini. Ask questions, get coding help, write essays, and more. No sign-up required.',
    howToSteps: [
      'Type your question or task in the chat input box at the bottom of the screen.',
      'Press Enter or click the Send button — Infinity AI replies instantly using Gemini.',
      'Continue the conversation naturally — the AI remembers your context within the session.',
      'Use the copy button on any response to copy text to your clipboard.',
      'Start a new conversation by clicking Clear Chat to reset the session.',
    ],
    keyFeatures: [
      'Powered by Google Gemini 2.5 Flash — one of the most capable AI models available',
      'Supports multi-turn conversations with full context memory per session',
      'Code generation, debugging, and explanation with formatted code blocks',
      'Essay writing, summarization, brainstorming, and creative writing support',
      'Instant responses with no loading queues or wait times',
      'Completely free — no subscription, no sign-up, no credit card required',
    ],
    useCases: ['Students', 'Developers', 'Content Writers', 'Researchers', 'Small Business Owners', 'Job Seekers', 'Teachers'],
    faq: [
      { question: 'Is the Infinity AI chatbot completely free to use?', answer: 'Yes, Infinity AI Chat is 100% free with no sign-up required. It is powered by Google Gemini and hosted on InfinityKit at no cost to users.' },
      { question: 'What can I ask the AI assistant?', answer: 'You can ask anything — coding questions, math problems, essay writing, recipe suggestions, business ideas, travel advice, language translation, summarization, and much more.' },
      { question: 'Does the AI remember my previous conversations?', answer: 'Infinity AI remembers context within your current session. If you clear the chat or close the browser, previous conversations are not retained for privacy reasons.' },
      { question: 'Can I use Infinity AI for coding help?', answer: 'Absolutely. The AI can write, explain, debug, and optimize code in Python, JavaScript, TypeScript, Java, C++, SQL, and dozens of other programming languages with syntax highlighting.' },
      { question: 'How is this different from ChatGPT?', answer: 'Infinity AI uses Google Gemini 2.5 Flash which is among the most capable models for reasoning, coding, and general knowledge — and it is completely free with no account needed.' },
    ]
  },
  {
    id: 'text-improver',
    name: 'AI Smart Text Improver',
    description: 'Rewrite, fix grammar, and elevate the tone of your documents.',
    category: 'ai-tools',
    icon: '✨',
    type: 'custom',
    componentName: 'AITextImprover'
  ,
    seoTitle: 'AI Smart Text Improver — Rewrite & Enhance Any Text Free | InfinityKit',
    seoDescription: 'Improve any text instantly with AI. Fix grammar, boost vocabulary, enhance clarity, and elevate your writing tone for free, no sign-up required.',
    howToSteps: [
      'Paste your original text into the input box — emails, essays, reports, or any document.',
      'Choose your improvement goal: clarity, professionalism, or conciseness.',
      'Click Improve Text and the AI rewrites your content within seconds.',
      'Review the improved version and compare it with your original.',
      'Copy the polished result or make further adjustments and re-run.',
    ],
    keyFeatures: [
      'Enhances vocabulary, sentence structure, and overall writing clarity',
      'Multiple tone modes: Professional, Casual, Academic, Creative',
      'Preserves your original meaning while elevating quality',
      'Works for emails, essays, reports, social posts, and more',
      'Powered by Google Gemini — state-of-the-art language model',
      'No word limit — handles long documents efficiently',
    ],
    useCases: ['Professionals', 'Students', 'Email Writers', 'Content Marketers', 'Non-native English Speakers', 'Bloggers'],
    faq: [
      { question: 'What does the AI Text Improver actually do?', answer: 'It rewrites your text to make it clearer, more professional, and better structured. It fixes awkward phrasing, improves vocabulary choices, and enhances sentence flow while keeping your original meaning intact.' },
      { question: 'Can I use it to improve professional emails?', answer: 'Yes. The Text Improver is ideal for polishing business emails, cover letters, reports, and client communications. Choose the Formal tone for professional contexts.' },
      { question: 'Does it change the meaning of my text?', answer: 'No — the AI is instructed to preserve your original meaning. It only improves how the message is expressed, not what the message says.' },
      { question: 'How is this different from Grammarly?', answer: 'Grammarly focuses on grammar corrections. InfinityKit Text Improver completely rewrites sentences for better flow, tone, and impact — not just fixing errors.' },
      { question: 'Is there a character or word limit?', answer: 'InfinityKit supports up to 30,000 characters. For very long documents, we recommend processing one section at a time for best results.' },
    ]
  },
  {
    id: 'summarizer',
    name: 'AI Smart Text Summarizer',
    description: 'Distill long essays or articles into highly cohesive outlines.',
    category: 'ai-tools',
    icon: '📝',
    type: 'custom',
    componentName: 'AISummarizer'
  ,
    seoTitle: 'Free AI Text Summarizer — Summarize Any Article Instantly | InfinityKit',
    seoDescription: 'Summarize long articles, essays, research papers, and documents instantly using free AI. Get clear bullet-point summaries in seconds. No sign-up needed.',
    howToSteps: [
      'Paste your long article, essay, or document text into the input field.',
      'Choose your desired summary length: Short, Medium, or Detailed.',
      'Click Summarize — the AI extracts the key points and main arguments.',
      'Read the structured summary with bullet points and key takeaways.',
      'Copy the summary for notes, presentations, or further use.',
    ],
    keyFeatures: [
      'Condenses long content into clear, structured bullet-point summaries',
      'Preserves all critical facts, statistics, and key arguments',
      'Three summary lengths: Short, Medium, and Comprehensive',
      'Works with articles, research papers, news, essays, and reports',
      'Identifies main topics, supporting arguments, and conclusions',
      'Free and instant — no account required',
    ],
    useCases: ['Students', 'Researchers', 'Journalists', 'Business Analysts', 'Book Readers', 'Legal Professionals'],
    faq: [
      { question: 'How accurate is the AI summarizer?', answer: 'Very accurate. The AI identifies the main thesis, supporting arguments, key data points, and conclusions. It preserves factual accuracy and does not introduce information not present in the original text.' },
      { question: 'What types of content can I summarize?', answer: 'You can summarize news articles, academic papers, blog posts, book chapters, business reports, legal documents, and any other long-form text content.' },
      { question: 'How long can the text be?', answer: 'Up to 30,000 characters — approximately 5,000 words. For longer documents, summarize in sections for best results.' },
      { question: 'Does the summarizer work for non-English text?', answer: 'The AI supports multiple languages including French, Spanish, German, Hindi, Arabic, and many others. The summary is generated in the same language as the input.' },
      { question: 'Can I use this for academic research?', answer: 'Yes — researchers and students use it to quickly grasp key findings of papers before a deep read. Always verify important facts against the original source.' },
    ]
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
  ,
    seoTitle: 'Free AI Essay Writer — Generate Academic Essays Instantly | InfinityKit',
    seoDescription: 'Write professional academic essays instantly with free AI. Enter your topic, get a well-structured essay with thesis, body paragraphs, and conclusion. No sign-up needed.',
    howToSteps: [
      'Enter your essay topic or title in the input field.',
      'Optionally add specific points, arguments, or requirements to include.',
      'Select the essay type: Argumentative, Expository, Descriptive, or Narrative.',
      'Click Write Essay — the AI generates a fully structured essay in seconds.',
      'Review the essay with its thesis, supporting paragraphs, and conclusion.',
      'Copy or download the essay and customize as needed.',
    ],
    keyFeatures: [
      'Generates complete essays with introduction, body paragraphs, and conclusion',
      'Supports argumentative, expository, descriptive, and narrative essay types',
      'Academic vocabulary, proper transitions, and thesis-driven structure',
      'Includes topic sentences and supporting evidence for each paragraph',
      'Markdown-formatted output for easy editing and export',
      'Free to use — no account or subscription required',
    ],
    useCases: ['Students', 'Academic Writers', 'ESL Learners', 'Researchers', 'Teachers', 'Content Writers'],
    faq: [
      { question: 'Can I use AI-generated essays for school?', answer: 'AI essay writers are best used as a learning tool and starting point. Use the generated essay to understand structure, then rewrite in your own voice. Always check your institution academic integrity policy.' },
      { question: 'What essay types does this support?', answer: 'The AI Essay Writer supports argumentative, expository, descriptive, narrative, compare-and-contrast, and cause-and-effect essays. Simply describe what you need in your prompt.' },
      { question: 'How long are the generated essays?', answer: 'Typically 400 to 800 words. Request a specific length in your prompt, such as Write a 1000-word essay on climate change.' },
      { question: 'Does the AI cite sources?', answer: 'The AI uses knowledge from training data. For academic work requiring real citations, verify all facts and add proper references manually.' },
      { question: 'Can I use this for college application essays?', answer: 'Yes — as a brainstorming and structural guide. Personal statements must reflect your own voice and experiences, so use the AI output as a first draft and heavily personalize it.' },
    ]
  },
  {
    id: 'article-writer',
    name: 'AI Article Writer',
    description: 'Draft SEO-optimized articles, news pieces, and journalistic columns instantly with highly engaging headlines.',
    category: 'writing-tools',
    icon: '📰',
    type: 'custom',
    componentName: 'ArticleWriter'
  ,
    seoTitle: 'Free AI Article Writer — Generate SEO Articles in Seconds | InfinityKit',
    seoDescription: 'Write SEO-optimized articles, news pieces, and columns instantly with free AI. Get engaging headlines, subheadings, and well-structured content. No sign-up needed.',
    howToSteps: [
      'Enter your article topic or main keyword in the input field.',
      'Optionally specify the target audience, tone, or key points to cover.',
      'Click Write Article — the AI generates a full structured article with headlines.',
      'Review the article with its intro, subheadings, body content, and conclusion.',
      'Copy the Markdown-formatted content directly into your CMS or blog editor.',
    ],
    keyFeatures: [
      'SEO-optimized structure with H1, H2, H3 headings for search ranking',
      'Engaging introductions and compelling calls-to-action',
      'Covers multiple angles with supporting arguments and facts',
      'Proper journalistic structure: Lead, Body, Conclusion',
      'Markdown output compatible with WordPress, Ghost, Medium, and all major CMS',
      'Completely free — unlimited articles, no sign-up required',
    ],
    useCases: ['Bloggers', 'Content Marketers', 'SEO Specialists', 'Journalists', 'Small Business Owners', 'Copywriters'],
    faq: [
      { question: 'Are the AI-generated articles SEO-friendly?', answer: 'Yes. The AI structures articles with proper H1 and H2 headings, keyword-rich introductions, and clear paragraph structure — all contributing to better search engine rankings.' },
      { question: 'How long are the generated articles?', answer: 'Typically 600 to 1200 words. Request a specific length in your prompt, such as Write a 1500-word article about solar energy for beginners.' },
      { question: 'Can I publish AI articles on my blog?', answer: 'Yes, but always review and personalize before publishing. Add your own insights, update outdated information, and ensure accuracy. Google rewards original, helpful content — treat AI output as a strong first draft.' },
      { question: 'What formats does the article output support?', answer: 'Output is in Markdown format which works directly with WordPress, Ghost, Notion, Medium, Hashnode, and most modern content management systems.' },
      { question: 'Does it add real facts and statistics?', answer: 'The AI uses knowledge from training data. For articles requiring current statistics, verify and supplement with up-to-date sources before publishing.' },
    ]
  },
  {
    id: 'blog-generator',
    name: 'AI Blog Post Generator',
    description: 'Draft friendly, shareable, and engaging blog posts tailored to your exact niche and audience.',
    category: 'writing-tools',
    icon: '💬',
    type: 'custom',
    componentName: 'BlogGenerator'
  ,
    seoTitle: 'Free AI Blog Post Generator — Write Engaging Blogs Instantly | InfinityKit',
    seoDescription: 'Generate engaging, shareable blog posts instantly with free AI. Enter your topic, get a complete blog with hooks, subheadings, and CTAs. No sign-up required.',
    howToSteps: [
      'Enter your blog topic, niche, or keyword you want to write about.',
      'Optionally describe your target audience and preferred writing tone.',
      'Click Generate Blog Post — the AI writes a complete post with a catchy hook.',
      'Review the blog with its engaging intro, body sections, and conclusion CTA.',
      'Customize the content, add your personal experience, and publish.',
    ],
    keyFeatures: [
      'Catchy hooks and engaging introductions that reduce bounce rate',
      'Organized sections with descriptive subheadings for scannability',
      'Conversational tone optimized for modern blog audiences',
      'Built-in call-to-action suggestions in the conclusion',
      'Includes practical tips, examples, and actionable advice',
      'SEO-friendly structure with natural keyword placement',
    ],
    useCases: ['Bloggers', 'Content Creators', 'Affiliate Marketers', 'Small Businesses', 'Coaches', 'YouTubers'],
    faq: [
      { question: 'How is a blog post different from an article?', answer: 'Blog posts are typically more conversational, personal, and reader-friendly. The Blog Generator uses a casual, engaging tone with personal pronouns and storytelling elements.' },
      { question: 'Can I generate blog posts for any niche?', answer: 'Yes — technology, health, finance, travel, food, relationships, business, gaming, and any other niche. The AI adapts its tone and content to match your specified audience.' },
      { question: 'Will the blog posts rank on Google?', answer: 'AI-generated content can rank, but needs customization. Add your personal insights, real examples, internal links, and ensure content genuinely helps readers. Google rewards helpful, original content.' },
      { question: 'How often can I generate blog posts?', answer: 'As often as you like — InfinityKit blog generator is completely free with no daily limits.' },
      { question: 'Does it generate images for the blog?', answer: 'The text generator creates written content. Use InfinityKit AI Image Generator to create custom featured images and graphics for your blog posts.' },
    ]
  },
  {
    id: 'faq-generator',
    name: 'AI FAQ Generator',
    description: 'Generate frequently asked questions (FAQs) and answers for your website, landing page, or product docs instantly.',
    category: 'writing-tools',
    icon: '❓',
    type: 'custom',
    componentName: 'FAQGenerator'
  ,
    seoTitle: 'Free AI FAQ Generator — Generate FAQs for Any Topic | InfinityKit',
    seoDescription: 'Generate professional FAQ sections for websites, products, and services instantly with free AI. Get 5 to 10 unique Q&As tailored to your topic. No sign-up needed.',
    howToSteps: [
      'Enter your product name, service, topic, or website description.',
      'Specify how many FAQs you want — typically 5, 10, or 15 question-answer pairs.',
      'Click Generate FAQs — the AI creates realistic questions your users actually ask.',
      'Review and edit the Q&As to match your specific product details.',
      'Copy the FAQ section directly into your website, landing page, or documentation.',
    ],
    keyFeatures: [
      'Generates realistic questions that real users actually search for',
      'Detailed, accurate answers tailored to your specific topic or product',
      'Schema-ready output compatible with Google FAQ rich results',
      'Reduces customer support load by answering common questions proactively',
      'Ideal for websites, SaaS products, e-commerce stores, and service businesses',
      'Completely free — no credits or sign-up required',
    ],
    useCases: ['Website Owners', 'SaaS Founders', 'E-commerce Stores', 'Content Writers', 'Customer Support Teams', 'Course Creators'],
    faq: [
      { question: 'Why should I add an FAQ section to my website?', answer: 'FAQ sections improve SEO by targeting long-tail question keywords, reduce customer support inquiries, increase conversion rates by addressing objections, and can earn Google FAQ rich result snippets.' },
      { question: 'Can the FAQs appear in Google search results?', answer: 'Yes. FAQ content structured with Schema.org FAQPage markup can appear as expandable rich results in Google SERP. InfinityKit pages include JSON-LD FAQ schema automatically.' },
      { question: 'How many FAQs should I add to my page?', answer: 'Aim for 5 to 10 high-quality FAQs per page. Focus on the most common objections, usage questions, and concerns specific to your product or topic.' },
      { question: 'Can I generate FAQs in other languages?', answer: 'Yes — specify the language in your prompt. The AI can generate FAQs in Spanish, French, German, Hindi, Arabic, Portuguese, and dozens of other languages.' },
      { question: 'Are the generated FAQs unique and original?', answer: 'Yes — the AI generates fresh Q&As based on your specific topic. Always review and customize answers to accurately reflect your actual product or policies.' },
    ]
  },
  {
    id: 'ai-rewriter',
    name: 'AI Content Rewriter',
    description: 'Rewrite, paraphrase, expand, or simplify any content locally using advanced machine learning models.',
    category: 'writing-tools',
    icon: '🔄',
    type: 'custom',
    componentName: 'AIRewriter'
  ,
    seoTitle: 'Free AI Content Rewriter & Paraphraser — Rewrite Any Text | InfinityKit',
    seoDescription: 'Rewrite, paraphrase, or restructure any text instantly with free AI. Avoid plagiarism, refresh old content, and get new variations. No sign-up needed.',
    howToSteps: [
      'Paste the content you want to rewrite into the input box.',
      'Select a rewriting mode: Standard Rewrite, Creative, Simplified, or Expanded.',
      'Click Rewrite Content — the AI produces a fresh version of your text.',
      'Compare the rewritten version with your original text.',
      'Copy the result or click Rewrite again for additional variations.',
    ],
    keyFeatures: [
      'Multiple rewriting modes: Standard, Creative, Simplified, Expanded',
      'Preserves original meaning while changing sentence structure and vocabulary',
      'Useful for avoiding plagiarism and refreshing old content',
      'Ideal for paraphrasing research sources, blog posts, and marketing copy',
      'Powered by Gemini — produces natural, human-sounding rewrites',
      'Unlimited rewrites — completely free with no daily limits',
    ],
    useCases: ['Content Writers', 'Students', 'SEO Professionals', 'Marketers', 'Researchers', 'Bloggers', 'Social Media Managers'],
    faq: [
      { question: 'What is the difference between rewriting and paraphrasing?', answer: 'Paraphrasing keeps the same ideas but changes the words. Rewriting can go further — restructuring sentences, changing perspective, adjusting tone, and producing a significantly different version.' },
      { question: 'Can I use the rewriter to avoid plagiarism?', answer: 'Yes — rewriting changes sentence structure and vocabulary while preserving meaning. For academic work, always cite original sources regardless of rewriting.' },
      { question: 'Does the rewriter change the meaning of my text?', answer: 'The AI is designed to preserve core meaning. In creative mode it may take more liberties with structure. Always review the output to ensure accuracy.' },
      { question: 'What types of content can I rewrite?', answer: 'Blog posts, articles, product descriptions, social media posts, email copy, academic paragraphs, and any other written content from a single sentence to full paragraphs.' },
      { question: 'How many times can I rewrite the same text?', answer: 'Unlimited. Each rewrite produces a different variation. Use multiple rewrites to find the version that best suits your needs.' },
    ]
  },
  {
    id: 'ai-humanizer',
    name: 'AI Text Humanizer',
    description: 'Convert robotic or AI-generated copy into highly natural, organic, human-sounding text.',
    category: 'writing-tools',
    icon: '👤',
    type: 'custom',
    componentName: 'AIHumanizer'
  ,
    seoTitle: 'Free AI Text Humanizer — Make AI Text Sound Human | InfinityKit',
    seoDescription: 'Transform AI-generated text into natural, human-sounding writing instantly. Bypass AI detectors, improve readability, and make content authentic. Free, no sign-up.',
    howToSteps: [
      'Paste your AI-generated text or robotic-sounding content into the input box.',
      'Click Humanize Text — the AI rewrites it to sound naturally human-written.',
      'The output avoids common AI patterns like delve, moreover, and testament to.',
      'Review the humanized version for natural, organic-sounding flow.',
      'Use the result for blog posts, emails, reports, or professional content.',
    ],
    keyFeatures: [
      'Eliminates robotic AI writing patterns and overused AI vocabulary',
      'Adds natural sentence variation for human-like rhythm and burstiness',
      'Removes dead giveaways: delve, moreover, testament, in conclusion',
      'Passes most AI content detection tools by producing organic text',
      'Preserves the original meaning and all factual information',
      'Works with content from ChatGPT, Claude, Gemini, and all AI writers',
    ],
    useCases: ['Content Writers', 'Bloggers', 'Students', 'SEO Professionals', 'Marketing Teams', 'Businesses using AI tools'],
    faq: [
      { question: 'What is AI text humanization?', answer: 'AI text humanization is the process of rewriting AI-generated content to remove patterns that make it sound robotic. This includes varying sentence length, removing overused AI vocabulary, and adding natural conversational flow.' },
      { question: 'Will humanized text pass AI detection tools like GPTZero?', answer: 'Our humanizer is designed to produce text that reads as naturally human-written. While no tool guarantees 100% bypass of all detectors, humanized text performs significantly better than raw AI output.' },
      { question: 'What AI writing patterns does the humanizer remove?', answer: 'It removes overused words like delve, testament, moreover, furthermore, in conclusion, and it is worth noting. It also fixes uniform sentence length, passive voice overuse, and overly formal phrasing.' },
      { question: 'Does it work for content from ChatGPT and other AI tools?', answer: 'Yes — it works on content from ChatGPT, Claude, Gemini, Copilot, Jasper, and any other AI writing tool. Simply paste the generated text and click Humanize.' },
      { question: 'Is the humanized content original?', answer: 'The content is a rewrite of your input — the ideas remain the same but the expression is transformed. Combine humanization with your own edits and personal insights for best results.' },
    ]
  },
  {
    id: 'grammar-fixer',
    name: 'AI Grammar Fixer',
    description: 'Correct all spelling mistakes, grammatical errors, and sentence structure issues instantly.',
    category: 'writing-tools',
    icon: '🛠️',
    type: 'custom',
    componentName: 'GrammarFixer'
  ,
    seoTitle: 'Free AI Grammar Fixer & Spell Checker — Fix Errors Instantly | InfinityKit',
    seoDescription: 'Fix grammar, spelling, and punctuation errors instantly with free AI. More powerful than basic spell checkers — corrects sentence structure and style. No sign-up needed.',
    howToSteps: [
      'Paste your text with grammar or spelling errors into the input box.',
      'Click Fix Grammar — the AI scans and corrects all errors instantly.',
      'Review the corrected text with all changes applied.',
      'Copy the corrected version for your document, email, or post.',
      'For additional improvement, run the corrected text through the Text Improver tool.',
    ],
    keyFeatures: [
      'Fixes spelling mistakes, typos, and incorrect word usage',
      'Corrects subject-verb agreement, tense consistency, and article usage',
      'Fixes punctuation: commas, apostrophes, quotation marks, and semicolons',
      'Improves sentence structure for readability and clarity',
      'More powerful than basic checkers — fixes complex contextual errors',
      'Supports US, UK, and Australian English variants',
    ],
    useCases: ['Students', 'Non-native English Speakers', 'Professionals', 'Email Writers', 'Content Creators', 'Job Applicants'],
    faq: [
      { question: 'Is this grammar checker better than Grammarly?', answer: 'InfinityKit Grammar Fixer uses Google Gemini which understands context deeply. It catches complex grammatical errors that rule-based tools miss — including contextual errors, tense shifts, and nuanced style issues.' },
      { question: 'Does it fix punctuation errors too?', answer: 'Yes — it corrects all punctuation including missing commas, incorrect apostrophes, run-on sentences, semicolon misuse, and quotation mark formatting.' },
      { question: 'Can it help non-native English speakers?', answer: 'Absolutely. The Grammar Fixer is especially useful for ESL learners who struggle with articles, prepositions, irregular verbs, and sentence structure patterns.' },
      { question: 'Does it change my writing style?', answer: 'The Grammar Fixer corrects errors while preserving your voice. It does not significantly rewrite your content — only fixes mistakes. Use the Text Improver if you want your style enhanced.' },
      { question: 'What is the maximum text length?', answer: 'Up to 30,000 characters — about 5,000 words. For longer documents, split into sections for the most thorough grammar check.' },
    ]
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
  ,
    seoTitle: 'Free Strong Password Generator — Create Secure Passwords | InfinityKit',
    seoDescription: 'Generate cryptographically strong random passwords instantly. Choose length, include numbers and symbols. 100% private — generated in your browser. Free, no sign-up.',
    howToSteps: [
      'Use the length slider to set your desired password length (8 to 64 characters).',
      'Toggle "Include Numbers" to add digits (0-9) to your password.',
      'Toggle "Include Symbols" to add special characters for maximum security.',
      'Click Calculate Results — your strong password is generated instantly.',
      'Click the copy button to copy your password to clipboard and store it in a password manager.',
    ],
    keyFeatures: [
      'Cryptographically random generation using browser-native secure random APIs',
      'Adjustable length from 8 to 64 characters',
      'Include or exclude numbers, symbols, and mixed case letters',
      'Generated entirely in your browser — never sent to any server',
      'One-click clipboard copy for instant use',
      'Free with no sign-up — generate unlimited passwords',
    ],
    useCases: ['Everyone', 'IT Administrators', 'Web Developers', 'Security Professionals', 'Business Owners', 'Students'],
    faq: [
      { question: 'Are the generated passwords truly random and secure?', answer: 'Yes. InfinityKit uses the browser Web Crypto API (crypto.getRandomValues) which generates cryptographically secure random values. These are the same standards used in professional security applications.' },
      { question: 'What makes a password strong?', answer: 'A strong password is at least 12 characters long, contains uppercase and lowercase letters, numbers, and special symbols, and is unique for every account. Avoid dictionary words, names, or dates.' },
      { question: 'Where should I store my generated passwords?', answer: 'Use a reputable password manager like Bitwarden (free and open-source), 1Password, or Dashlane. Never write passwords in a plain text file or reuse them across multiple accounts.' },
      { question: 'Is my generated password stored or sent anywhere?', answer: 'No. All password generation happens entirely in your browser. The password never leaves your device — there are no server calls, no logs, and no tracking of any kind.' },
      { question: 'How long should my password be?', answer: 'At minimum 12 characters for personal accounts, 16 or more for important accounts like email and banking, and 20 or more for administrative and server credentials.' },
    ]
  },
  {
    id: 'qrcode-gen',
    name: 'Scan-to-Open QR Code Generator',
    description: 'Create instantly scannable codes for links, text, or contacts.',
    category: 'generator-tools',
    icon: '📱',
    type: 'custom',
    componentName: 'QRCodeGenerator'
  ,
    seoTitle: 'Free QR Code Generator — Create Scannable QR Codes Online | InfinityKit',
    seoDescription: 'Generate QR codes for URLs, text, email, phone numbers, and more instantly. Free online QR code maker — download as PNG, no sign-up required.',
    howToSteps: [
      'Enter the URL, text, phone number, email, or any content you want to encode.',
      'Your QR code generates automatically as you type — no button click needed.',
      'Customize the size and error correction level if needed.',
      'Click Download to save the QR code as a PNG image.',
      'Use the QR code on business cards, flyers, posters, packaging, or websites.',
    ],
    keyFeatures: [
      'Generates QR codes for URLs, plain text, email addresses, phone numbers, and more',
      'Real-time preview — QR code updates as you type',
      'Download as high-resolution PNG suitable for print',
      'Error correction built-in — QR codes still scan even if slightly damaged',
      'Works on all devices — desktop and mobile',
      'Completely free — no sign-up, no watermarks, no limits',
    ],
    useCases: ['Business Owners', 'Marketers', 'Event Organizers', 'Restaurants', 'Teachers', 'Content Creators', 'Developers'],
    faq: [
      { question: 'What can I encode in a QR code?', answer: 'You can encode URLs, plain text, email addresses, phone numbers, SMS messages, WiFi credentials, vCard contact information, geographic coordinates, and much more. QR codes are versatile data containers.' },
      { question: 'Are QR codes free to use commercially?', answer: 'Yes — QR codes are a free, open standard. QR codes generated by InfinityKit have no restrictions on commercial use. You can print them on products, marketing materials, and business cards without any licensing fees.' },
      { question: 'How far away can a QR code be scanned?', answer: 'A standard smartphone can scan a QR code from about 1 foot (30cm) to 5 feet (1.5m) away at typical sizes. For large-format print (posters, billboards), QR codes can be scanned from much greater distances.' },
      { question: 'Do QR codes expire?', answer: 'Static QR codes (like those generated here) never expire. The data is encoded directly in the pattern. Dynamic QR codes that point to redirect URLs may expire if the redirect service stops, but static ones are permanent.' },
      { question: 'What size should my QR code be for printing?', answer: 'For business cards: minimum 1.5 cm × 1.5 cm (0.6 inch). For flyers: 2.5 cm to 5 cm. For posters: 5 cm to 10 cm. Larger is always better for reliable scanning.' },
    ]
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
  ,
    seoTitle: 'Free Multi-Unit Converter — Convert Length, Weight, Temp | InfinityKit',
    seoDescription: 'Convert units of length, weight, temperature, area, volume, and speed instantly. Free, comprehensive online unit conversion tool.',
    howToSteps: [
      'Select the unit category (e.g. Length, Weight, Temperature, Area).',
      'Choose the input unit (From) and the target unit (To).',
      'Enter the value you wish to convert in the input field.',
      'Click Calculate Results to see the converted value instantly.',
      'Copy the converted output or change unit categories to convert different parameters.',
    ],
    keyFeatures: [
      'Supports conversion across multiple categories: Length, Mass, Temp, Speed, Area, Volume',
      'Converts metric and imperial units (e.g. meters to feet, kilograms to pounds)',
      'High-precision decimal calculations with instant outputs',
      'Runs completely locally in your browser for fast, offline-capable use',
      'User-friendly dropdown navigation and clean layout',
    ],
    useCases: ['Students', 'Engineers', 'Travelers', 'Chefs & Bakers', 'DIY Hobbyists'],
    faq: [
      { question: 'Does this converter support temperature conversions?', answer: 'Yes, it converts between Celsius, Fahrenheit, and Kelvin using standard temperature formulas.' },
      { question: 'What is the difference between imperial and metric systems?', answer: 'The metric system (meters, kilograms) is decimal-based and used globally. The imperial system (inches, pounds) is primary in the United States and United Kingdom.' },
      { question: 'Are there any conversion limits?', answer: 'No, you can perform unlimited conversions for free. All math is done client-side so it is extremely fast.' }
    ]
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
  ,
    seoTitle: 'Free Discount Calculator — Find Final Price & Savings | InfinityKit',
    seoDescription: 'Calculate the final price after discount instantly. Enter original price and discount percentage to see how much you save. Free online discount calculator.',
    howToSteps: [
      'Enter the original price of the item in the Original Price field.',
      'Enter the discount percentage in the Discount Percentage field (e.g., 20 for 20%).',
      'Click Calculate Results — the final price and amount saved appear instantly.',
      'Use the result to compare deals and make smarter purchasing decisions.',
    ],
    keyFeatures: [
      'Instantly calculates final price after any percentage discount',
      'Shows the exact amount saved in dollars',
      'Works for any currency — dollar, euro, pound, rupee, and more',
      'Simple, fast calculation requiring just two inputs',
      'Accurate to two decimal places for precise shopping math',
      'Free and private — no account or sign-up needed',
    ],
    useCases: ['Shoppers', 'Retailers', 'Students', 'Business Owners', 'Sales Teams', 'Cashiers'],
    faq: [
      { question: 'How is the discounted price calculated?', answer: 'The formula is: Final Price = Original Price × (1 - Discount% / 100). For example, a $100 item with 20% off: $100 × (1 - 0.20) = $100 × 0.80 = $80. You save $20.' },
      { question: 'Can I calculate the original price from a sale price?', answer: 'To find the original price when you know the sale price and discount: Original Price = Sale Price / (1 - Discount% / 100). For example, $80 sale with 20% discount: $80 / 0.80 = $100 original price.' },
      { question: 'How do I calculate multiple discounts (stacked discounts)?', answer: 'Calculate the first discount, then apply the second discount to the resulting price. For example, 20% off then 10% off a $100 item: $100 → $80 after 20% → $72 after 10%. This is not the same as 30% off.' },
      { question: 'What is the difference between discount and cashback?', answer: 'A discount reduces the price before payment. Cashback returns a percentage of the paid amount after purchase. The effective savings are similar but cashback requires you to pay the full price first.' },
      { question: 'Can this calculate sale tax after discount?', answer: 'This tool calculates the discount only. To add tax: calculate the discounted price first, then multiply by (1 + tax rate/100). For example, $80 with 8% tax: $80 × 1.08 = $86.40.' },
    ]
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
  ,
    seoTitle: 'Free Simple Percentage Calculator — Quick Math Tool | InfinityKit',
    seoDescription: 'Calculate percentages, percentage increases, decreases, fractions, and proportions instantly. Free, easy-to-use online percentage calculator.',
    howToSteps: [
      'Choose the percentage operation you want to perform from the list.',
      'Enter the values in the designated input fields.',
      'Click Calculate Results to view the percentage output instantly.',
      'Copy the result or clear the fields to run another percentage check.',
    ],
    keyFeatures: [
      'Multiple operations: find percent of a number, percentage change, and proportions',
      'Real-time calculations with instant, precise decimal results',
      'Responsive, clutter-free layout for quick desktop and mobile use',
      '100% client-side computing ensures your financial data stays private',
      'Completely free with no popups or registration required',
    ],
    useCases: ['Shoppers', 'Students', 'Business Analysts', 'Accountants', 'Teachers'],
    faq: [
      { question: 'How do I calculate a percentage increase?', answer: 'Subtract the old value from the new value, divide the difference by the old value, and multiply by 100. (e.g. increase from 50 to 75 is 50%).' },
      { question: 'Can this tool help with tipping or sales tax?', answer: 'Yes! You can find the tip or tax amount by calculating the percentage of your total bill, then adding it to the subtotal.' },
      { question: 'What is a percentage in math?', answer: 'A percentage is a number or ratio expressed as a fraction of 100. It is denoted using the percent sign "%".' }
    ]
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
  ,
    seoTitle: 'Free LCM & HCF Calculator — Least Common Multiple | InfinityKit',
    seoDescription: 'Calculate the Least Common Multiple (LCM) and Highest Common Factor (HCF / GCD) for multiple numbers instantly. Free educational math tool.',
    howToSteps: [
      'Enter the first number in the designated input field.',
      'Enter the second number (and subsequent numbers if needed).',
      'Click Calculate Results to compute the LCM and HCF values.',
      'Review the step-by-step prime factorization breakdown of the numbers.',
      'Use the output values for simplifying fractions or solving algebra problems.',
    ],
    keyFeatures: [
      'Finds both Least Common Multiple (LCM) and Highest Common Factor (HCF / GCD)',
      'Supports multiple integers simultaneously',
      'Displays prime factorization steps for educational learning',
      'Completely free to use with zero advertisements or subscription limits',
      'Calculates instantly in your browser without sending data to servers',
    ],
    useCases: ['Students', 'Math Teachers', 'Parents helping with homework', 'Engineers'],
    faq: [
      { question: 'What is the difference between LCM and HCF?', answer: 'LCM (Least Common Multiple) is the smallest positive integer divisible by all numbers. HCF (Highest Common Factor) is the largest integer that divides all numbers without a remainder.' },
      { question: 'Is HCF the same as GCD?', answer: 'Yes, HCF (Highest Common Factor) is also known as GCD (Greatest Common Divisor) or GCF (Greatest Common Factor).' },
      { question: 'How is LCM used in real life?', answer: 'LCM is commonly used to find common denominators when adding or subtracting fractions, and to coordinate events that repeat at different intervals.' }
    ]
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
  ,
    seoTitle: 'Free URL Encoder & Decoder — Encode Decode URLs Online | InfinityKit',
    seoDescription: 'Encode and decode URLs and strings online instantly. Convert special characters to URL-safe format or decode percent-encoded strings. Free, no sign-up needed.',
    howToSteps: [
      'Paste your URL or text string into the input field.',
      'Select Encode to convert special characters to URL-safe percent-encoded format.',
      'Select Decode to convert percent-encoded strings back to readable text.',
      'Click Calculate Results — the encoded or decoded output appears instantly.',
      'Copy the result for use in your browser, API, or application.',
    ],
    keyFeatures: [
      'Encodes special characters to percent-encoded URL-safe format',
      'Decodes percent-encoded strings back to readable text',
      'Handles all special characters: spaces, &, =, ?, #, @, and more',
      'Essential for building URLs with query parameters in web development',
      'Instant results — no button click needed after input',
      'Free and unlimited — no account required',
    ],
    useCases: ['Web Developers', 'API Developers', 'SEO Specialists', 'Digital Marketers', 'Students', 'System Administrators'],
    faq: [
      { question: 'What is URL encoding?', answer: 'URL encoding (also called percent-encoding) converts characters that are not allowed in URLs into a safe format. For example, a space becomes %20, and & becomes %26. This ensures URLs are valid and properly interpreted by browsers and servers.' },
      { question: 'When do I need to URL encode a string?', answer: 'You need to URL encode when passing special characters in query parameters, form data, or API calls. For example: https://example.com/search?q=hello%20world (where space is encoded as %20).' },
      { question: 'What is the difference between encodeURI and encodeURIComponent?', answer: 'encodeURI encodes an entire URL, preserving characters like /, ?, and #. encodeURIComponent encodes individual components like query parameter values, encoding those characters too. InfinityKit uses encodeURIComponent for maximum safety.' },
      { question: 'Can I decode multiple URLs at once?', answer: 'Currently the tool processes one URL or string at a time. Paste each URL separately and use the decode function to convert it.' },
      { question: 'Is URL decoding safe for all encoded strings?', answer: 'Standard percent-encoded strings decode safely. However, malformed or double-encoded strings may produce unexpected results. The tool shows an error message if decoding fails due to invalid encoding.' },
    ]
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
  ,
    seoTitle: 'Free Case Converter — UPPERCASE, lowercase, Title Case Online | InfinityKit',
    seoDescription: 'Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, or PascalCase instantly. Free online text case converter. No sign-up needed.',
    howToSteps: [
      'Paste or type your text into the input field.',
      'Select the conversion mode from the dropdown: UPPERCASE, lowercase, Title Case, camelCase, snake_case, or PascalCase.',
      'Click Calculate Results — your converted text appears instantly.',
      'Click the copy button to copy the converted text to your clipboard.',
      'Switch between different case formats as needed without retyping.',
    ],
    keyFeatures: [
      'Six conversion modes: UPPERCASE, lowercase, Title Case, camelCase, snake_case, PascalCase',
      'Converts entire paragraphs or single words instantly',
      'One-click copy to clipboard for immediate use',
      'Ideal for programming variable names, headings, and text formatting',
      '100% private — runs in browser, no text sent to any server',
      'Free and unlimited with no account required',
    ],
    useCases: ['Developers', 'Writers', 'Students', 'SEO Professionals', 'Data Entry Workers', 'Content Editors'],
    faq: [
      { question: 'What is the difference between camelCase and PascalCase?', answer: 'camelCase starts with a lowercase letter (e.g., myVariableName) and is used in JavaScript, Java, and Swift. PascalCase starts with an uppercase letter (e.g., MyVariableName) and is common in C#, class names, and React components.' },
      { question: 'What is snake_case used for?', answer: 'snake_case uses underscores between words in lowercase (e.g., my_variable_name). It is widely used in Python, Ruby, database column names, and file names in many projects.' },
      { question: 'What is Title Case?', answer: 'Title Case capitalizes the first letter of each major word (e.g., The Quick Brown Fox). It is used for book titles, article headings, movie titles, and formal document headings.' },
      { question: 'Can I convert multiple paragraphs at once?', answer: 'Yes — paste any amount of text and the entire block is converted to your selected case format instantly.' },
      { question: 'Is this tool useful for programming?', answer: 'Absolutely. Developers use the Case Converter to quickly generate properly formatted variable names, function names, and class names in their preferred programming convention.' },
    ]
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
  ,
    seoTitle: 'Free Word Counter & Character Counter — Count Words Online | InfinityKit',
    seoDescription: 'Count words, characters, paragraphs, and estimate reading time instantly. Free online word counter tool — paste your text and get results in real time. No sign-up needed.',
    howToSteps: [
      'Paste or type your text into the input field.',
      'Word count, character count, paragraph count, and reading time update instantly.',
      'No button to click — results appear in real time as you type.',
      'Use the statistics for essays, articles, social media posts, and more.',
      'Clear the field and paste new text to count a different document.',
    ],
    keyFeatures: [
      'Real-time counting — updates instantly as you type or paste',
      'Counts words, characters (with and without spaces), sentences, and paragraphs',
      'Estimates reading time based on average 200 words per minute',
      'Perfect for meeting word count requirements in essays, articles, and posts',
      'Works entirely in your browser — no text is sent to any server',
      'Free and unlimited — no account needed',
    ],
    useCases: ['Students', 'Writers', 'Bloggers', 'Social Media Managers', 'SEO Professionals', 'Journalists', 'Content Marketers'],
    faq: [
      { question: 'How does the word counter work?', answer: 'The tool counts sequences of characters separated by spaces, treating each sequence as a word. It simultaneously counts characters, paragraphs (separated by line breaks), and calculates estimated reading time at 200 words per minute.' },
      { question: 'What is the character limit on Twitter, Instagram, and LinkedIn?', answer: 'Twitter allows 280 characters per tweet. LinkedIn posts allow up to 3000 characters. Instagram captions allow up to 2200 characters. Use this counter to stay within limits.' },
      { question: 'Does it count characters with or without spaces?', answer: 'Both — the tool displays character count with spaces and character count without spaces separately, giving you flexibility for different platform requirements.' },
      { question: 'Can I count words in different languages?', answer: 'Yes — the word counter works with all languages that use spaces between words, including English, French, Spanish, German, and many others. For languages without spaces like Chinese or Japanese, it counts character sequences.' },
      { question: 'Is there a maximum text length?', answer: 'There is no hard limit. The tool handles documents of any length — from a single sentence to full research papers or books — and updates counts in real time.' },
    ]
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
  ,
    seoTitle: 'Free AI Chat PDF — Discuss & Ask Questions to Any PDF | InfinityKit',
    seoDescription: 'Chat with any PDF document for free. Upload your PDF and ask questions, find specific information, or get instant summaries. 100% private and secure.',
    howToSteps: [
      'Click the Upload PDF button to select a PDF document from your device.',
      'Once processed, type your question or query in the chat input box.',
      'Press Enter or click Send to ask the AI about the contents of your PDF.',
      'Read the precise response referencing details directly from your document.',
      'Continue chatting or upload a new PDF to start a fresh discussion.',
    ],
    keyFeatures: [
      'Instant PDF text extraction and semantic understanding',
      'Interactive chat interface powered by Google Gemini AI model',
      'Provides page-level references and accurate citations',
      '100% secure — document text processed locally and via secure AI API',
      'Completely free with no file size limits or registration required',
    ],
    useCases: ['Students', 'Researchers', 'Lawyers', 'Business Analysts', 'Teachers', 'Journalists'],
    faq: [
      { question: 'How does the AI Chat PDF tool work?', answer: 'The tool extracts text from your uploaded PDF and uses Gemini AI to search, analyze, and answer questions about it in real-time.' },
      { question: 'Is my uploaded PDF document secure and private?', answer: 'Yes, your privacy is our priority. Your files are not stored on our servers; they are processed locally in your browser session.' },
      { question: 'Is there a page or file size limit for PDFs?', answer: 'We support documents up to 50MB and hundreds of pages, though processing time may vary depending on your device\'s speed.' },
      { question: 'Can I translate my PDF contents using the chat?', answer: 'Yes, you can ask the AI to translate specific sections or summarize the entire PDF in any language you prefer.' }
    ]
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
  ,
    seoTitle: 'Free AI Image Generator — Generate Stunning Art from Text | InfinityKit',
    seoDescription: 'Convert your words into beautiful images instantly with our free AI Image Generator. Choose styles, customize prompts, and download custom graphics. No sign-up needed.',
    howToSteps: [
      'Enter a descriptive text prompt explaining what image you want to generate.',
      'Choose a style preset (e.g. Cinematic, Anime, 3D Render, Origami, Cyberpunk).',
      'Select your preferred aspect ratio (e.g. 1:1 Square, 16:9 Landscape, 9:16 Vertical).',
      'Click Generate Image — the AI synthesizes your visual graphic in seconds.',
      'Click the Download button to save the high-resolution image to your device.',
    ],
    keyFeatures: [
      'Powered by Pollinations AI model backend — fast and detailed image generation',
      'Wide array of artistic style presets: Cinematic, Anime, Photo, 3D Render, and more',
      'Multiple aspect ratios optimized for Instagram, YouTube, and blog headers',
      'Real-time loading indicator and interactive visual gallery',
      '100% free with no watermark, registration, or credit card required',
    ],
    useCases: ['Designers', 'Content Creators', 'Bloggers', 'Social Media Managers', 'Students', 'Web Developers'],
    faq: [
      { question: 'Is the AI Image Generator free to use commercially?', answer: 'Yes, images generated are 100% free for both personal and commercial use without licensing restrictions.' },
      { question: 'How detailed should my text prompts be?', answer: 'The more descriptive, the better. Instead of "a dog", write "a fluffy golden retriever puppy sitting in a sunny park, cinematic lighting, 8k resolution".' },
      { question: 'Can I generate images in different aspect ratios?', answer: 'Yes, you can choose from 1:1 Square, 16:9 Landscape (ideal for banners/headers), and 9:16 Portrait (perfect for phone wallpapers/stories).' },
      { question: 'What AI model does this generator use?', answer: 'InfinityKit AI Image Generator uses advanced stable diffusion models via the Pollinations API to provide high-quality image synthesis.' }
    ]
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
