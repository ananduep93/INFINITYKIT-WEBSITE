console.log('Infinity Kit Version 1.0 Loaded - Script-Based Path Resolver Active (Failsafe Fix)');
// Tip: If links fail, try a hard refresh (Ctrl + Shift + R) to clear browser cache.

// Folders with Tools Data
const baseFolders = [
    {
        id: 'daily-essentials',
        name: 'Daily Essentials',
        icon: '🏠',
        emoji: '🏠',
        tools: ['todolist', 'notes', 'timer']
    },
    {
        id: 'expense-tracker',
        name: 'Expense Tracker',
        icon: '💸',
        emoji: '💸',
        tools: [
            'expenseadd',
            'expenselist',
            'categorysummary',
            'dailymonthlyreport',
            'budgettracker',
            'searchexpenses',
            'resetexpenses',
            'expenseanalytics',
            'topspendinginsights',
            'smartsuggestions'
        ]
    },
    {
        id: 'survey-hub',
        name: 'Survey Hub',
        icon: '📈',
        emoji: '📈',
        tools: [
            'surveybuilder',
            'mysurveys'
        ]
    },
    {
        id: 'utilities',
        name: 'Utilities',
        icon: '🛠️',
        emoji: '🛠️',
        tools: ['unitconverter', 'passwordgen', 'passwordsaver', 'passwordstrength', 'randomnamepicker']
    },
    {
        id: 'pdf-tools',
        name: 'PDF Tools',
        icon: '📄',
        emoji: '📄',
        tools: ['imagetopdf', 'pdftoimage', 'mergepdf', 'rotatepdf']
    },
    {
        id: 'image',
        name: 'Image',
        icon: '🖼️',
        emoji: '🖼️',
        tools: ['compressimage', 'imageinfo']
    },
    {
        id: 'math-tools',
        name: 'Math Tools',
        icon: '📊',
        emoji: '📊',
        tools: ['discountcalc', 'percentagecalc', 'primenumber', 'palindrome', 'factorial', 'fibonacci', 'lcmhcf', 'trianglechecker', 'distancecalc', 'equationsolver']
    },
    {
        id: 'time-tools',
        name: 'Time Tools',
        icon: '⏰',
        emoji: '⏰',
        tools: ['daysbetween']
    },
    {
        id: 'text-tools',
        name: 'Text Tools',
        icon: '✍️',
        emoji: '✍️',
        tools: ['usernamegen']
    },
    {
        id: 'student-tools',
        name: 'Student Tools',
        icon: '📚',
        emoji: '📚',
        tools: ['examcalc']
    },
    {
        id: 'quick-tools',
        name: 'Quick Tools',
        icon: '⚡',
        emoji: '⚡',
        tools: ['texttospeech']
    },
    {
        id: 'data-tools',
        name: 'Data Tools',
        icon: '📊',
        emoji: '📊',
        tools: ['graphmaker', 'averagecalculator', 'numbersorter', 'csvviewer']
    },
    {
        id: 'decision-tools',
        name: 'Decision Tools',
        icon: '🎯',
        emoji: '🎯',
        tools: ['spinwheel', 'yesnogerator', 'choicecomparator']
    },
    {
        id: 'planner-tools',
        name: 'Planner Tools',
        icon: '📅',
        emoji: '📅',
        tools: ['calendarviewer', 'dailyplanner', 'reminderalert']
    },
    {
        id: 'web-tools',
        name: 'Web Tools',
        icon: '🌐',
        emoji: '🌐',
        tools: ['urlencoder', 'urlextractor', 'metatagviewer']
    },
    {
        id: 'health-utility-hub',
        name: 'Health Utility Hub 🩺⚡',
        icon: '🩺',
        emoji: '🩺',
        tools: ['bmicalculator', 'drugdosage', 'ivdripcalc', 'medicinereminder']
    },
    {
        id: 'ai-tools',
        name: 'AI Tools',
        icon: '🤖',
        emoji: '🤖',
        tools: ['chatbot', 'text-improver', 'summarizer', 'image-generator']
    }
];

// Dynamic folders array (will be updated with favorites)
let folders = [];

// App Global Settings (initialized with defaults)
let appSettings = {
    theme: 'light',
    fontSize: 'medium',
    cardSize: 'normal',
    animationsEnabled: true,
    favorites: [],
    recentTools: [],
    usageStats: {}
};

// Update folders (legacy helper, now just clones baseFolders)
function updateFolders() {
    folders = JSON.parse(JSON.stringify(baseFolders));
}

// updateFolders initialized during loadSettings for correctly syncing favorites

// Tools Data
const tools = [

    {
        id: 'todolist',
        name: 'To-Do List',
        icon: '✓',
        description: 'Manage your tasks'
    },
    {
        id: 'unitconverter',
        name: 'Unit Converter',
        icon: '📏',
        description: 'Convert units'
    },
    {
        id: 'passwordgen',
        name: 'Password Generator',
        icon: '🔐',
        description: 'Generate passwords'
    },
    {
        id: 'passwordsaver',
        name: 'Password Saver',
        icon: '🔒',
        description: 'Store passwords'
    },
    {
        id: 'notes',
        name: 'Quick Notes',
        icon: '📝',
        description: 'Take quick notes'
    },
    {
        id: 'timer',
        name: 'Timer & Stopwatch',
        icon: '⏱️',
        description: 'Track time'
    },
    {
        id: 'expenseadd',
        name: 'Add Expense',
        icon: '➕💸',
        description: 'Add a new expense entry'
    },
    {
        id: 'expenselist',
        name: 'Expense List',
        icon: '📋',
        description: 'View, edit, and delete expenses'
    },
    {
        id: 'categorysummary',
        name: 'Category Summary',
        icon: '📊',
        description: 'Category-wise expense totals'
    },
    {
        id: 'dailymonthlyreport',
        name: 'Daily / Monthly Report',
        icon: '📅',
        description: 'Today, week, and month spend report'
    },
    {
        id: 'budgettracker',
        name: 'Budget Tracker',
        icon: '🎯',
        description: 'Set budgets and monitor remaining'
    },
    {
        id: 'searchexpenses',
        name: 'Search Expenses',
        icon: '🔍',
        description: 'Instant search by note or category'
    },
    {
        id: 'resetexpenses',
        name: 'Reset Data',
        icon: '🗑️',
        description: 'Clear all expense tracker data'
    },
    {
        id: 'expenseanalytics',
        name: 'Graph & Analytics',
        icon: '📈🔥',
        description: 'Pie and bar charts for spending'
    },
    {
        id: 'topspendinginsights',
        name: 'Top Spending Insights',
        icon: '🧠',
        description: 'Auto insights from your spending'
    },
    {
        id: 'smartsuggestions',
        name: 'Smart Suggestions',
        icon: '💡',
        description: 'Simple intelligent spending tips'
    },
    {
        id: 'aiplanner',
        name: 'AI Planner',
        icon: '🤖',
        description: 'AI-powered planning',
        comingSoon: true
    },
    {
        id: 'doubtsolver',
        name: 'Doubt Solver',
        icon: '❓',
        description: 'Get help with doubts',
        comingSoon: true
    },
    {
        id: 'skillbuilder',
        name: 'Skill Builder',
        icon: '🎓',
        description: 'Learn new skills',
        comingSoon: true
    },
    {
        id: 'imagetopdf',
        name: 'Image to PDF',
        icon: '🖼️',
        description: 'Convert images to PDF'
    },
    {
        id: 'pdftoimage',
        name: 'PDF to Image',
        icon: '📸',
        description: 'Convert PDF pages to images'
    },
    {
        id: 'mergepdf',
        name: 'Merge PDF',
        icon: '📎',
        description: 'Combine multiple PDFs'
    },
    {
        id: 'rotatepdf',
        name: 'Rotate PDF',
        icon: '🔄',
        description: 'Rotate PDF pages'
    },
    {
        id: 'compressimage',
        name: 'Compress Image',
        icon: '🗜️',
        description: 'Reduce image file size'
    },
    {
        id: 'imageinfo',
        name: 'Image Info',
        icon: '📏',
        description: 'View image details'
    },
    {
        id: 'discountcalc',
        name: 'Discount Calculator',
        icon: '🧮',
        description: 'Calculate discounts'
    },
    {
        id: 'percentagecalc',
        name: 'Percentage Calculator',
        icon: '🔢',
        description: 'Calculate percentages'
    },
    {
        id: 'passwordstrength',
        name: 'Password Strength Checker',
        icon: '🔐',
        description: 'Check password strength'
    },
    {
        id: 'randomnamepicker',
        name: 'Random Name Picker',
        icon: '🎯',
        description: 'Pick random names'
    },
    {
        id: 'daysbetween',
        name: 'Days Between Dates',
        icon: '📅',
        description: 'Calculate days between dates'
    },
    {
        id: 'usernamegen',
        name: 'Username Generator',
        icon: '🔤',
        description: 'Generate usernames'
    },
    {
        id: 'clipboardcleaner',
        name: 'Clipboard Cleaner',
        icon: '📋',
        description: 'Clean text formatting'
    },
    {
        id: 'examcalc',
        name: 'Exam Marks Calculator',
        icon: '📝',
        description: 'Calculate exam scores'
    },
    {
        id: 'texttospeech',
        name: 'Text to Speech',
        icon: '🔊',
        description: 'Convert text to speech'
    },
    {
        id: 'primenumber',
        name: 'Prime Number Checker',
        icon: '🔢',
        description: 'Check if number is prime'
    },
    {
        id: 'palindrome',
        name: 'Palindrome Checker',
        icon: '🔁',
        description: 'Check if text is palindrome'
    },
    {
        id: 'factorial',
        name: 'Factorial Calculator',
        icon: '📊',
        description: 'Calculate factorial (n!)'
    },
    {
        id: 'fibonacci',
        name: 'Fibonacci Generator',
        icon: '🔢',
        description: 'Generate Fibonacci sequence'
    },
    {
        id: 'wordcounter',
        name: 'Word Counter',
        icon: '🔤',
        description: 'Count words and characters'
    },
    {
        id: 'textreverse',
        name: 'Text Reverser',
        icon: '🔁',
        description: 'Reverse text instantly'
    },
    {
        id: 'caseconverter',
        name: 'Case Converter',
        icon: '🔠',
        description: 'Change text case'
    },
    {
        id: 'removeduplicates',
        name: 'Remove Duplicate Words',
        icon: '🧹',
        description: 'Remove repeated words'
    },
    // Data Tools
    {
        id: 'graphmaker',
        name: 'Graph Maker',
        icon: '📊',
        description: 'Create bar graphs'
    },
    {
        id: 'averagecalculator',
        name: 'Average Calculator',
        icon: '📉',
        description: 'Calculate average & sum'
    },
    {
        id: 'numbersorter',
        name: 'Number Sorter',
        icon: '🔢',
        description: 'Sort numbers'
    },
    {
        id: 'csvviewer',
        name: 'CSV Viewer',
        icon: '📋',
        description: 'View CSV files as table'
    },
    // Math Tools (additions)
    {
        id: 'lcmhcf',
        name: 'LCM / HCF Calculator',
        icon: '📐',
        description: 'Find LCM and HCF'
    },
    {
        id: 'trianglechecker',
        name: 'Triangle Type Checker',
        icon: '🔺',
        description: 'Check triangle type'
    },
    {
        id: 'distancecalc',
        name: 'Distance Calculator',
        icon: '📏',
        description: 'Calculate distances'
    },
    {
        id: 'equationsolver',
        name: 'Equation Solver',
        icon: '🧮',
        description: 'Solve basic equations'
    },
    // Decision Tools
    {
        id: 'spinwheel',
        name: 'Spin Wheel',
        icon: '🎡',
        description: 'Spin to select option'
    },
    {
        id: 'yesnogerator',
        name: 'Yes / No Generator',
        icon: '🤔',
        description: 'Random yes or no'
    },
    {
        id: 'choicecomparator',
        name: 'Choice Comparator',
        icon: '📊',
        description: 'Compare options'
    },
    // Planner Tools
    {
        id: 'calendarviewer',
        name: 'Calendar Viewer',
        icon: '📅',
        description: 'View calendar'
    },
    {
        id: 'dailyplanner',
        name: 'Daily Planner',
        icon: '📝',
        description: 'Plan your day'
    },
    {
        id: 'reminderalert',
        name: 'Reminder Alert',
        icon: '⏰',
        description: 'Set reminders'
    },
    // Web Tools
    {
        id: 'urlencoder',
        name: 'URL Encoder / Decoder',
        icon: '🔗',
        description: 'Encode/decode URLs'
    },
    {
        id: 'urlextractor',
        name: 'URL Parameter Extractor',
        icon: '🌍',
        description: 'Extract URL params'
    },
    {
        id: 'metatagviewer',
        name: 'Meta Tag Viewer',
        icon: '📄',
        description: 'View meta tags'
    },
    // Health Utility Hub Tools
    {
        id: 'bmicalculator',
        name: 'BMI Calculator',
        icon: '🧮',
        description: 'Calculate your BMI instantly'
    },
    {
        id: 'drugdosage',
        name: 'Drug Dosage Calculator',
        icon: '💊',
        description: 'Calculate drug dosages (Educational)'
    },
    {
        id: 'ivdripcalc',
        name: 'IV Drip Rate Calculator',
        icon: '💧',
        description: 'Calculate IV drip rates'
    },
    {
        id: 'medicinereminder',
        name: 'Medicine Reminder',
        icon: '⏰',
        description: 'Generate reminder schedules'
    },
    // Survey Hub Tools
    {
        id: 'surveybuilder',
        name: 'Survey Builder',
        icon: '🛠️',
        description: 'Create and customize your surveys'
    },
    {
        id: 'mysurveys',
        name: 'My Surveys',
        icon: '📋',
        description: 'Manage your created surveys'
    },
    {
        id: 'publicsurvey',
        name: 'Public Survey',
        icon: '🌐',
        description: 'View and fill out a survey'
    },
    {
        id: 'responseviewer',
        name: 'Response Viewer',
        icon: '📊',
        description: 'View and analyze survey responses'
    },
    // AI Tools
    {
        id: 'chatbot',
        name: 'AI Chatbot',
        icon: '🤖',
        description: 'Chat with a powerful AI assistant'
    },
    {
        id: 'text-improver',
        name: 'Text Improver',
        icon: '✍️',
        description: 'Rewrite your text for better clarity'
    },
    {
        id: 'summarizer',
        name: 'Summarizer',
        icon: '📋',
        description: 'Condense long text into key points'
    },
    {
        id: 'code-helper',
        name: 'Code Helper',
        icon: '💻',
        description: 'Explain, fix, or convert your code',
        comingSoon: true
    },
    {
        id: 'image-generator',
        name: 'Image Generator',
        icon: '🎨',
        description: 'Generate images from text prompts'
    },
    {
        id: 'translator',
        name: 'AI Translator',
        icon: '🌍',
        description: 'Translate text between languages',
        comingSoon: true
    },
    {
        id: 'voice-assistant',
        name: 'Voice Assistant',
        icon: '🎙️',
        description: 'Interact using your voice',
        comingSoon: true
    },
    {
        id: 'document-checker',
        name: 'Document Checker',
        icon: '📄',
        description: 'Extract points from documents',
        comingSoon: true
    }
];

// DOM Elements
const foldersGrid = document.getElementById('foldersGrid');
const toolsGrid = document.getElementById('toolsGrid');
const searchBar = document.getElementById('searchBar');
const modal = document.getElementById('toolModal');
const closeBtn = document.getElementById('closeBtn');
const toolContent = document.getElementById('toolContent');
const toolTitle = document.getElementById('toolTitle');
let toast;
const backButton = document.getElementById('backButton');
const backButtonContainer = document.getElementById('backButtonContainer');
const currentFolderTitle = document.getElementById('currentFolderTitle');
const searchResults = document.getElementById('searchResults');
const searchResultsList = document.getElementById('searchResultsList');
const noResults = document.getElementById('noResults');
const recentSearches = document.getElementById('recentSearches');
const installAppBtn = document.getElementById('installAppBtn');
const footerPwaContainer = document.getElementById('footerPwaContainer');
const footerInstallBtn = document.getElementById('footerInstallBtn');
const copyrightText = document.getElementById('copyrightText');

// Centralized Path Management System
const PathManager = {
    // Detect current directory depth (0 = root, 1 = subfolder)
    // Uses segment analysis to avoid false positives from site root folder names
    getDepth() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(s => s !== '' && !s.includes('.html'));
        return segments.length;
    },

    getPrefix() {
        // Absolute paths are more reliable for modern web hosting
        return '/';
    },

    getToolPath(toolId) {
        const aiTools = ['chatbot', 'text-improver', 'summarizer', 'code-helper', 'image-generator', 'translator', 'voice-assistant', 'document-checker'];
        if (aiTools.includes(toolId)) {
            return `/ai-tools/${toolId}.html`;
        }
        return `/tools/${toolId}.html`;
    },

    getFolderPath(folderId) {
        return `/folder/${folderId}.html`;
    },

    getHomePath() {
        return '/';
    },

    // Guard to prevent invalid navigation patterns
    normalize(url) {
        if (!url) return url;
        if (url.includes('folder/tools/') || url.includes('tools/tools/')) {
            console.warn('PathManager: Normalizing invalid path:', url);
            return url.replace('folder/tools/', 'tools/').replace('tools/tools/', 'tools/');
        }
        return url;
    }
};

// App State
let calcDisplay = '';
let currentFolder = null;
let recentSearchesList = JSON.parse(localStorage.getItem('recentSearches')) || [];
let deferredInstallPrompt = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    try {
        loadSettings();
        applySettings();
        updateFolders(); // Called after loadSettings so favorites are populated correctly
        
        if (typeof renderFolders === 'function') renderFolders();
        if (typeof setupSafeListeners === 'function') setupSafeListeners();
        if (typeof setupPwaInstall === 'function') setupPwaInstall();
        if (typeof registerServiceWorker === 'function') registerServiceWorker();
        if (typeof updateCopyrightYear === 'function') updateCopyrightYear();
        
        // Update Settings button to have both icon and text
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.innerHTML = `
                <span class="settings-icon">&#9881;&#65039;</span>
                <span class="settings-text">Settings</span>
            `;
            settingsBtn.title = 'Open Settings';
        }
        
        // Inject footer on all pages except index.html
        if (typeof injectGlobalFooter === 'function') injectGlobalFooter();

        // Initialize Notification System
        if (window.NotificationManager) {
            window.NotificationManager.init();
        }

        handleInitialNavigation();
    } catch (e) {
        console.error('Infinity Kit Initialization Error:', e);
    }
});

// Helper to safely set up event listeners or elements
function setupSafeListeners() {
    if (searchBar) {
        searchBar.addEventListener('focus', () => {
            if (searchBar.value.trim() === '') {
                showRecentSearches();
            }
        });

        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query === '') {
                showRecentSearches();
            } else {
                performSearch(query);
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeTool);
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            triggerHaptic('light');
            backToFolders(false);
        });
    }

    // Modal click-outside
    if (window && modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeTool();
        });
    }

    // Global click-outside for search
    document.addEventListener('click', (e) => {
        if (searchResults && !e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
}

// Listener for Service Worker messages (Snooze, etc)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SNOOZE_ALERT') {
            const data = event.data.data;
            if (window.NotificationManager) {
                console.log('Snoozing for 10 minutes...');
                // Schedule new alert 10 mins into the future
                window.NotificationManager.schedule(data.title || 'Snoozed Reminder', 'Dismissed alert resumed', 10, data.type);
            }
        }
    });
}

function handleInitialNavigation() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    if (!Array.isArray(folders) || !Array.isArray(tools)) return;

    const folder = folders.find(f => f.id === hash);
    const tool = tools.find(t => t.id === hash);

    if (folder || tool) {
        // Inject home state into history
        history.replaceState({ type: 'home' }, '', window.location.pathname + window.location.search);
        
        if (folder) {
            openFolder(folder);
        } else if (tool) {
            const parent = folders.find(f => f.tools.includes(tool.id));
            if (parent) {
                currentFolder = parent;
                if (foldersGrid) foldersGrid.style.display = 'none';
                if (backButtonContainer) backButtonContainer.style.display = 'flex';
                if (currentFolderTitle) currentFolderTitle.textContent = `${parent.emoji} ${parent.name}`;
                renderToolsInFolder(parent);
                if (toolsGrid) toolsGrid.style.display = 'grid';
                history.pushState({ type: 'folder', folderId: parent.id }, '', `#${parent.id}`);
            }
            openTool(tool.id, tool.name, tool.icon);
        }
    }
}

function setupPwaInstall() {
    updateInstallButtonState();
    
    if (installAppBtn) {
        installAppBtn.addEventListener('click', handleInstallApp);
    }
    if (footerInstallBtn) {
        footerInstallBtn.addEventListener('click', handleInstallApp);
    }

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        updateInstallButtonState();
    });

    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        updateInstallButtonState();
        showToast('Infinity Kit installed successfully', 'success');
    });

}

function updateInstallButtonState() {
    if (installAppBtn) {
        // Button is ALWAYS enabled and shows "Install App" per user requirement
        installAppBtn.classList.remove('is-installed');
        installAppBtn.disabled = false;
        installAppBtn.textContent = '📥 Install App';
        installAppBtn.title = 'Install Infinity Kit for faster access and offline support.';
    }

    // Always show in footer if buttons exist
    if (footerPwaContainer) {
        footerPwaContainer.style.display = 'block';
    }
}

function updateCopyrightYear() {
    if (copyrightText) {
        const year = new Date().getFullYear();
        copyrightText.textContent = `\u00A9 ${year} Infinity Kit. All rights reserved.`;
    }
}

async function handleInstallApp() {
    if (!deferredInstallPrompt) {
        // If browser hasn't provided the prompt, we provide manual instructions
        showToast('If it not pops up, To install: open your browser menu (⋮ or ⇧) and select "Add to Home Screen" or "Install App".', 'info');
        return;
    }

    try {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;

        if (outcome === 'accepted') {
            showToast('Install started', 'success');
        } else {
            showToast('Install canceled', 'info');
        }
    } catch (error) {
        showToast('Unable to open install prompt', 'error');
    } finally {
        deferredInstallPrompt = null;
        updateInstallButtonState();
    }
}

    // Service Worker Registration Disabled for Safety
    window.addEventListener('load', () => {
        console.log("Service Worker Registration bypassed.");
    });



// Render folder cards
function renderFolders() {
    if (!foldersGrid) return;
    foldersGrid.innerHTML = '';

    folders.forEach(folder => {
        const card = document.createElement('div');
        card.className = 'folder-card';
        const toolCount = Array.isArray(folder.tools) ? folder.tools.length : 0;
        
        card.innerHTML = `
            <div class="folder-icon">${folder.emoji}</div>
            <div class="folder-name">${folder.name}</div>
            <div class="folder-count">${toolCount} tools</div>
        `;

        card.addEventListener('click', () => {
            triggerHaptic('light');
            location.href = PathManager.getFolderPath(folder.id);
        });

        foldersGrid.appendChild(card);
    });
}

// Open folder
function openFolder(folder, fromHistory = false) {
    currentFolder = folder;
    if (foldersGrid) foldersGrid.style.display = 'none';
    if (backButtonContainer) backButtonContainer.style.display = 'flex';
    if (searchResults) searchResults.style.display = 'none';
    if (searchBar) searchBar.value = '';
    
    if (currentFolderTitle) currentFolderTitle.textContent = `${folder.emoji} ${folder.name}`;
    renderToolsInFolder(folder);
    
    if (toolsGrid) toolsGrid.style.display = 'grid';

    // Add animation classes
    if (toolsGrid) {
        toolsGrid.classList.add('slide-in-right');
        setTimeout(() => toolsGrid.classList.remove('slide-in-right'), 400);
    }

    if (!fromHistory) {
        history.pushState({ type: 'folder', folderId: folder.id }, '', `#${folder.id}`);
    }
}

// Render tools in a folder
function renderToolsInFolder(folder) {
    if (!toolsGrid) return;
    toolsGrid.innerHTML = '';
    
    const folderItems = Array.isArray(folder.tools) ? folder.tools : [];
    folderItems.forEach(itemId => {
        // Try to find as a tool first
        const tool = tools.find(t => t.id === itemId);
        const sourceFolder = baseFolders.find(f => f.id === itemId && !f.isFavorites);
        
        if (tool) {
            const card = document.createElement('a');
            card.className = 'tool-card';
            card.href = tool.comingSoon ? '#' : PathManager.getToolPath(itemId);
            
            if (tool.comingSoon) {
                card.style.opacity = '0.6';
                card.style.cursor = 'not-allowed';
                card.onclick = (e) => e.preventDefault();
            }
            
            card.innerHTML = `
                <div class="tool-card-header">
                    <div class="tool-icon">${tool.icon || '🛠️'}</div>
                </div>
                <div class="tool-name">${tool.name}</div>
            `;
            
            if (!tool.comingSoon) {
                card.addEventListener('click', () => {
                    triggerHaptic('light');
                });
            }
            toolsGrid.appendChild(card);
        } else if (sourceFolder) {
            // Render folder as a card in the favorites view
            const card = document.createElement('div');
            card.className = 'folder-card favorite-item-folder';
            card.style.cursor = 'pointer';
            
            card.innerHTML = `
                <div class="folder-favorite-badge">⭐</div>
                <div class="folder-icon">${sourceFolder.emoji || '📁'}</div>
                <div class="folder-name">${sourceFolder.name}</div>
                <div class="folder-count">${sourceFolder.tools.length} tools</div>
            `;
            
            card.addEventListener('click', () => {
                triggerHaptic('light');
                location.href = PathManager.getFolderPath(sourceFolder.id);
            });
            toolsGrid.appendChild(card);
        }
    });
}

// Back to folders
function backToFolders(fromHistory = false) {
    // Ensure tool is fully unmounted first
    closeTool(true);
    
    // Add animation classes for "going back"
    if (foldersGrid) {
        foldersGrid.classList.add('slide-in-left');
        setTimeout(() => foldersGrid.classList.remove('slide-in-left'), 400);
    }

    if (toolsGrid) toolsGrid.style.display = 'none';
    if (backButtonContainer) backButtonContainer.style.display = 'none';
    if (foldersGrid) foldersGrid.style.display = 'grid';
    currentFolder = null;
    if (searchBar) searchBar.value = '';
    if (searchResults) searchResults.style.display = 'none';
    
    if (!fromHistory) {
        // If we have a hash, we want to go back to the root (no hash)
        // We go back until the hash is gone, or just land on the home state
        if (window.location.hash) {
            history.pushState({ type: 'home' }, '', window.location.pathname);
            // Trigger haptic for home transition
            triggerHaptic('light');
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    searchBar.addEventListener('focus', () => {
        if (searchBar.value.trim() === '') {
            showRecentSearches();
        }
    });

    searchBar.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query === '') {
            showRecentSearches();
        } else {
            performSearch(query);
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });

    closeBtn.addEventListener('click', closeTool);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeTool();
    });

    backButton.addEventListener('click', () => {
        triggerHaptic('light');
        backToFolders(false);
    });

    // Support for browser back/forward and mobile gestures
    window.addEventListener('popstate', (event) => {
        const state = event.state;
        
        if (state && state.type === 'tool') {
            doOpenTool(state.toolId, state.toolName, state.toolIcon, true);
        } else if (state && state.type === 'folder') {
            closeTool(true);
            const folder = folders.find(f => f.id === state.folderId);
            if (folder) openFolder(folder, true);
        } else {
            // No state or home state - explicitly clear everything
            closeTool(true);
            currentFolder = null;
            backButtonContainer.style.display = 'none';
            toolsGrid.style.display = 'none';
            foldersGrid.style.display = 'grid';
            searchBar.value = '';
            searchResults.style.display = 'none';
            // Also ensure we are at the top
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    });
}

// Smart search function
// Show recent searches
function showRecentSearches() {
    recentSearches.innerHTML = '';
    searchResultsList.innerHTML = '';
    noResults.style.display = 'none';

    if (recentSearchesList.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    const title = document.createElement('div');
    title.className = 'recent-search-title';
    title.textContent = 'Recent Searches';
    recentSearches.appendChild(title);

    recentSearchesList.slice(0, 5).forEach(search => {
        const item = document.createElement('div');
        item.className = 'recent-search-item';
        item.textContent = search;
        item.addEventListener('click', () => {
            searchBar.value = search;
            searchBar.dispatchEvent(new Event('input'));
        });
        recentSearches.appendChild(item);
    });

    searchResults.style.display = 'block';
}

// Add to recent searches
async function addToRecentSearches(search) {
    // Remove if already exists
    recentSearchesList = recentSearchesList.filter(item => item !== search);
    
    // Add to beginning
    recentSearchesList.unshift(search);
    
    // Keep only last 10
    recentSearchesList = recentSearchesList.slice(0, 10);
    
    // Save to syncService
    if (window.syncService) {
        await window.syncService.saveData('recentSearches', recentSearchesList);
    } else {
        localStorage.setItem('recentSearches', JSON.stringify(recentSearchesList));
    }
}

// Pages Navigation
function navigateTo(pageId) {
    const pages = document.querySelectorAll('.page-view');
    pages.forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if(targetPage) {
        targetPage.style.display = 'block';
        targetPage.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Open tool
function openTool(toolId, toolName, toolIcon, fromHistory = false) {
    const loadingOverlay = document.getElementById('toolLoadingOverlay');
    if(loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            doOpenTool(toolId, toolName, toolIcon, fromHistory);
        }, 400); // 400ms soft loading animation effect
    } else {
        doOpenTool(toolId, toolName, toolIcon, fromHistory);
    }
}

function doOpenTool(toolId, toolName, toolIcon, fromHistory = false) {
    if (typeof cleanupExpenseToolSync === 'function') {
        cleanupExpenseToolSync();
    }
    toolTitle.textContent = `${toolIcon} ${toolName}`;
    toolContent.innerHTML = '';
    
    // Track tool usage
    trackToolUsage(toolId);
    
    // Switch for loading specific tool logic...
    switch(toolId) {
        case 'calculator':
            loadCalculator();
            break;
        case 'todolist':
            loadToDoList();
            break;
        case 'unitconverter':
            loadUnitConverter();
            break;
        case 'passwordgen':
            loadPasswordGenerator();
            break;
        case 'passwordsaver':
            loadPasswordSaver();
            break;
        case 'notes':
            loadQuickNotes();
            break;
        case 'timer':
            loadTimer();
            break;
        case 'expenseadd':
            loadExpenseAddTool();
            break;
        case 'expenselist':
            loadExpenseListTool();
            break;
        case 'categorysummary':
            loadCategorySummaryTool();
            break;
        case 'dailymonthlyreport':
            loadDailyMonthlyReportTool();
            break;
        case 'budgettracker':
            loadBudgetTrackerTool();
            break;
        case 'searchexpenses':
            loadSearchExpensesTool();
            break;
        case 'resetexpenses':
            loadResetExpenseDataTool();
            break;
        case 'expenseanalytics':
            loadExpenseAnalyticsTool();
            break;
        case 'topspendinginsights':
            loadTopSpendingInsightsTool();
            break;
        case 'smartsuggestions':
            loadSmartSuggestionsTool();
            break;
        case 'imagetopdf':
            loadImageToPDF();
            break;
        case 'pdftoimage':
            loadPDFToImage();
            break;
        case 'mergepdf':
            loadMergePDF();
            break;
        case 'rotatepdf':
            loadRotatePDF();
            break;
        case 'compressimage':
            loadCompressImage();
            break;
        case 'imageinfo':
            loadImageInfo();
            break;
        case 'discountcalc':
            loadDiscountCalculator();
            break;
        case 'percentagecalc':
            loadPercentageCalculator();
            break;
        case 'passwordstrength':
            loadPasswordStrengthChecker();
            break;
        case 'randomnamepicker':
            loadRandomNamePicker();
            break;
        case 'daysbetween':
            loadDaysBetween();
            break;
        case 'usernamegen':
            loadUsernameGenerator();
            break;
        case 'examcalc':
            loadExamCalculator();
            break;
        case 'texttospeech':
            loadTextToSpeech();
            break;
        case 'primenumber':
            loadPrimeChecker();
            break;
        case 'palindrome':
            loadPalindromeChecker();
            break;
        case 'factorial':
            loadFactorialCalculator();
            break;
        case 'fibonacci':
            loadFibonacciGenerator();
            break;
        case 'wordcounter':
            loadWordCounter();
            break;
        case 'textreverse':
            loadTextReverser();
            break;
        case 'caseconverter':
            loadCaseConverter();
            break;
        case 'removeduplicates':
            loadRemoveDuplicates();
            break;
        // Data Tools
        case 'graphmaker':
            loadGraphMaker();
            break;
        case 'averagecalculator':
            loadAverageCalculator();
            break;
        case 'numbersorter':
            loadNumberSorter();
            break;
        case 'csvviewer':
            loadCSVViewer();
            break;
        // Math Tools
        case 'lcmhcf':
            loadLCMHCF();
            break;
        case 'trianglechecker':
            loadTriangleChecker();
            break;
        case 'distancecalc':
            loadDistanceCalculator();
            break;
        case 'equationsolver':
            loadEquationSolver();
            break;
        // Decision Tools
        case 'spinwheel':
            loadSpinWheel();
            break;
        case 'yesnogerator':
            loadYesNoGenerator();
            break;
        case 'choicecomparator':
            loadChoiceComparator();
            break;
        // Planner Tools
        case 'calendarviewer':
            loadCalendarViewer();
            break;
        case 'dailyplanner':
            loadDailyPlanner();
            break;
        case 'reminderalert':
            loadReminderAlert();
            break;
        // Web Tools
        case 'urlencoder':
            loadURLEncoder();
            break;
        case 'urlextractor':
            loadURLExtractor();
            break;
        case 'metatagviewer':
            loadMetaTagViewer();
            break;
        // Health Utility Tools
        case 'bmicalculator':
            loadBMICalculator();
            break;
        case 'drugdosage':
            loadDrugDosage();
            break;
        case 'ivdripcalc':
            loadIVDripCalc();
            break;
        case 'medicinereminder':
            loadMedicineReminder();
            break;
        // Survey Hub
        case 'surveybuilder':
            if (typeof loadSurveyBuilder === 'function') loadSurveyBuilder();
            break;
        case 'mysurveys':
            if (typeof loadMySurveys === 'function') loadMySurveys();
            break;
        case 'publicsurvey':
            if (typeof loadPublicSurvey === 'function') loadPublicSurvey();
            break;
        case 'responseviewer':
            if (typeof loadResponseViewer === 'function') loadResponseViewer();
            break;
    }

    // Track recent tool usage
    addRecentTool(toolId, toolName);
    
    modal.style.display = 'block';

    if (!fromHistory) {
        history.pushState({ type: 'tool', toolId, toolName, toolIcon, folderId: currentFolder?.id }, '', `#${toolId}`);
    }
}

// Close tool
function closeTool(fromHistory = false) {
    if (typeof cleanupExpenseToolSync === 'function') {
        cleanupExpenseToolSync();
    }
    
    // Completely unmount/clear tool content as requested
    modal.style.display = 'none';
    toolContent.innerHTML = '';
    toolTitle.textContent = '';
    calcDisplay = '';
    window.activeToolId = null;

    // Trigger history back only if this wasn't called from a popstate event (e.g., clicking X button)
    // fromHistory will be an Event object if called from button click, so we check strictly for true
    if (fromHistory !== true && history.state && history.state.type === 'tool') {
        history.back();
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    if (!toast) {
        toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
    }
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Haptic Feedback Helper
function triggerHaptic(type = 'light') {
    if (!('vibrate' in navigator)) return;
    const durations = { light: 10, medium: 30, strong: 50 };
    navigator.vibrate(durations[type] || 10);
}

// ==================== CALCULATOR ====================
let calculatorState = {
    expression: '', // Actual expression with *, /, -
    displayValue: '0' // What user sees
};

function loadCalculator() {
    calculatorState.expression = '';
    calculatorState.displayValue = '0';
    
    let html = `
        <div class="calculator-wrapper">
            <div class="calc-input-display">
                <input type="text" id="calcInput" class="calc-input-field" placeholder="0" readonly>
            </div>
            <div class="calculator">
    `;
    
    // Layout matching the image:
    // Row 1: AC, (), %, ÷
    // Row 2: 7, 8, 9, ×
    // Row 3: 4, 5, 6, −
    // Row 4: 1, 2, 3, +
    // Row 5: 0, ., ⌫, =
    
    const buttons = [
        // Row 1: Operations
        { symbol: 'AC', class: 'clear', action: 'clearCalc' },
        { symbol: '( )', class: 'operator', action: 'addNumber', value: '()' },
        { symbol: '%', class: 'percent', action: 'addOperator', value: '%' },
        { symbol: '÷', class: 'operator', action: 'addOperator', value: '/' },
        
        // Row 2: 7, 8, 9, ×
        { symbol: '7', class: 'number', action: 'addNumber', value: '7' },
        { symbol: '8', class: 'number', action: 'addNumber', value: '8' },
        { symbol: '9', class: 'number', action: 'addNumber', value: '9' },
        { symbol: '×', class: 'operator', action: 'addOperator', value: '*' },
        
        // Row 3: 4, 5, 6, −
        { symbol: '4', class: 'number', action: 'addNumber', value: '4' },
        { symbol: '5', class: 'number', action: 'addNumber', value: '5' },
        { symbol: '6', class: 'number', action: 'addNumber', value: '6' },
        { symbol: '−', class: 'operator', action: 'addOperator', value: '-' },
        
        // Row 4: 1, 2, 3, +
        { symbol: '1', class: 'number', action: 'addNumber', value: '1' },
        { symbol: '2', class: 'number', action: 'addNumber', value: '2' },
        { symbol: '3', class: 'number', action: 'addNumber', value: '3' },
        { symbol: '+', class: 'operator', action: 'addOperator', value: '+' },
        
        // Row 5: 0, ., ⌫, =
        { symbol: '0', class: 'number', action: 'addNumber', value: '0' },
        { symbol: '.', class: 'number', action: 'addDecimal', value: '.' },
        { symbol: '⌫', class: 'backspace', action: 'backspaceCalc' },
        { symbol: '=', class: 'equals', action: 'calculate' },
    ];

    buttons.forEach((btn) => {
        let onclickHandler = `handleCalcButton('${btn.action}'`;
        
        if (btn.value) {
            onclickHandler += `, '${btn.value}'`;
        }
        onclickHandler += ')';
        
        html += `<button class="calc-btn ${btn.class}" onclick="${onclickHandler}">${btn.symbol}</button>`;
    });

    html += `
            </div>
        </div>
    `;
    
    toolContent.innerHTML = html;
    updateCalcDisplay();
    
    // Add keyboard support
    const calcInput = document.getElementById('calcInput');
    if (calcInput) {
        calcInput.addEventListener('keydown', handleCalcKeyPress);
    }
}

function handleCalcButton(action, value) {
    switch(action) {
        case 'addNumber':
            addNumber(value);
            break;
        case 'addOperator':
            addOperator(value);
            break;
        case 'addDecimal':
            addDecimal();
            break;
        case 'clearCalc':
            clearCalc();
            break;
        case 'backspaceCalc':
            backspaceCalc();
            break;
        case 'calculate':
            calculateResult();
            break;
    }
}

function addNumber(num) {
    // Skip parentheses for now
    if (num === '()') {
        return;
    }
    
    // If expression is empty and display shows "0", replace it
    if (calculatorState.displayValue === '0') {
        calculatorState.expression = num;
    } else {
        calculatorState.expression += num;
    }
    updateCalcDisplay();
}

function addOperator(op) {
    // Handle percent
    if (op === '%') {
        if (calculatorState.expression === '') return;
        
        try {
            const result = eval(calculatorState.expression) / 100;
            calculatorState.expression = result.toString();
            updateCalcDisplay();
        } catch (e) {
            showToast('Invalid operation', 'error');
        }
        return;
    }
    
    const lastChar = calculatorState.expression.slice(-1);
    
    // Prevent multiple operators in a row
    if (['+', '-', '*', '/', '%'].includes(lastChar)) {
        return;
    }
    
    // If expression is empty, don't add operator
    if (calculatorState.expression === '') {
        return;
    }
    
    calculatorState.expression += op;
    updateCalcDisplay();
}

function addDecimal() {
    // Get the last number (after last operator)
    const lastOperatorIndex = Math.max(
        calculatorState.expression.lastIndexOf('+'),
        calculatorState.expression.lastIndexOf('-'),
        calculatorState.expression.lastIndexOf('*'),
        calculatorState.expression.lastIndexOf('/')
    );
    
    const lastNumber = calculatorState.expression.substring(lastOperatorIndex + 1);
    
    // Don't add decimal if already present in current number
    if (lastNumber.includes('.')) {
        return;
    }
    
    // If expression is empty or ends with operator, add "0."
    if (calculatorState.expression === '' || ['+', '-', '*', '/'].includes(calculatorState.expression.slice(-1))) {
        calculatorState.expression += '0.';
    } else {
        calculatorState.expression += '.';
    }
    
    updateCalcDisplay();
}

function updateCalcDisplay() {
    const input = document.getElementById('calcInput');
    
    if (input) {
        // Convert internal operators to display versions for showing
        const displayExpr = convertToDisplayFormat(calculatorState.expression);
        input.value = displayExpr || '0';
    }
    
    // Update internal display value
    calculatorState.displayValue = calculatorState.expression || '0';
}

function convertToDisplayFormat(expr) {
    return expr
        .replace(/\*/g, ' × ')
        .replace(/\//g, ' ÷ ')
        .replace(/\+/g, ' + ')
        .replace(/-(?!\.)/g, ' − '); // Don't replace minus in decimals
}

function calculateResult() {
    if (calculatorState.expression === '') {
        return;
    }
    
    try {
        // Evaluate the expression
        const result = eval(calculatorState.expression);
        
        // Check if result is a number
        if (typeof result === 'number' && !isNaN(result)) {
            // Convert to fixed decimals if needed (avoid floating point errors)
            const finalResult = Math.round(result * 100000000) / 100000000;
            
            // Show result
            calculatorState.expression = finalResult.toString();
            calculatorState.displayValue = finalResult.toString();
            updateCalcDisplay();
            
            // Show success toast
            showToast('✓ Calculation complete', 'success');
        } else {
            showToast('Invalid calculation', 'error');
            clearCalc();
        }
    } catch (e) {
        showToast('Error in calculation', 'error');
        clearCalc();
    }
}

function clearCalc() {
    calculatorState.expression = '';
    calculatorState.displayValue = '0';
    updateCalcDisplay();
}

function backspaceCalc() {
    if (calculatorState.expression.length > 0) {
        calculatorState.expression = calculatorState.expression.slice(0, -1);
    }
    calcDisplay = calculatorState.expression;
    updateCalcDisplay();
}

function handleCalcKeyPress(event) {
    const key = event.key;
    
    // Numbers
    if (key >= '0' && key <= '9') {
        addNumber(key);
    }
    // Decimal
    else if (key === '.') {
        addDecimal();
    }
    // Operators
    else if (key === '+') {
        addOperator('+');
    }
    else if (key === '-') {
        addOperator('-');
    }
    else if (key === '*') {
        addOperator('*');
    }
    else if (key === '/') {
        event.preventDefault(); // Prevent browser search
        addOperator('/');
    }
    else if (key === '%') {
        addOperator('%');
    }
    // Enter or equals
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculateResult();
    }
    // Backspace
    else if (key === 'Backspace') {
        event.preventDefault();
        backspaceCalc();
    }
    // Delete key for clear
    else if (key === 'Delete') {
        event.preventDefault();
        clearCalc();
    }
}

// ==================== TO-DO LIST ====================
async function loadToDoList() {
    // Wait for sync service
    for (let i = 0; i < 10; i++) {
        if (window.syncService) break;
        await new Promise(r => setTimeout(r, 200));
    }

    let todos = [];
    if (window.syncService) {
        todos = await window.syncService.getData('todos', true) || [];
    } else {
        todos = JSON.parse(localStorage.getItem('todos')) || [];
    }
    
    let html = `
        <div class="todolist-content">
            <div class="todo-input-group">
                <input type="text" id="todoInput" placeholder="Add a new task...">
                <button onclick="addTodo()">Add</button>
            </div>
            <ul class="todo-list" id="todoList">
    `;

    if (todos.length === 0) {
        html += '<li class="empty-message">No tasks yet. Add one to get started!</li>';
    } else {
        todos.forEach((todo, index) => {
            html += `
                <li class="todo-item ${todo.completed ? 'completed' : ''}">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="toggleTodo(${index})">
                    <span>${escapeHtml(todo.text)}</span>
                    <button class="todo-delete" onclick="deleteTodo(${index})">Delete</button>
                </li>
            `;
        });
    }

    html += '</ul></div>';
    toolContent.innerHTML = html;

    document.getElementById('todoInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
}

async function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (!text) {
        showToast('Please enter a task', 'error');
        return;
    }

    const todos = await window.syncService.getData('todos', true) || [];
    todos.push({ text, completed: false });
    await window.syncService.saveData('todos', todos);
    loadToDoList(); // Refresh
    showToast('Task added!', 'success');
}

async function toggleTodo(index) {
    const todos = await window.syncService.getData('todos', true) || [];
    todos[index].completed = !todos[index].completed;
    await window.syncService.saveData('todos', todos);
    loadToDoList();
}

async function deleteTodo(index) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const todos = await window.syncService.getData('todos', true) || [];
    todos.splice(index, 1);
    await window.syncService.saveData('todos', todos);
    loadToDoList();
    showToast('Task deleted!', 'success');
}

// ==================== UNIT CONVERTER ====================
function loadUnitConverter() {
    let html = `
        <div class="tool-form">
            <h3>🔄 Unit Converter</h3>
            <div class="form-group">
                <label>Category</label>
                <select id="ucCategory" onchange="ucPopulateUnits()" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                    <option value="Length">Length</option>
                    <option value="Weight">Weight</option>
                    <option value="Temperature">Temperature</option>
                </select>
            </div>
            <div class="converter-group">
                <input type="number" id="ucInput1" oninput="ucConvert('1')" placeholder="Value">
                <select id="ucUnit1" onchange="ucConvert('1')"></select>
            </div>
            <div style="text-align: center; margin: 5px 0; font-size: 1.2rem; color: #667eea; font-weight: bold;">⇅</div>
            <div class="converter-group">
                <input type="number" id="ucInput2" oninput="ucConvert('2')" placeholder="Value">
                <select id="ucUnit2" onchange="ucConvert('2')"></select>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    ucPopulateUnits();
}

function ucPopulateUnits() {
    const cat = document.getElementById('ucCategory').value;
    const u1 = document.getElementById('ucUnit1');
    const u2 = document.getElementById('ucUnit2');
    
    let options = '';
    if (cat === 'Length') {
        ['mm', 'cm', 'm', 'km'].forEach(u => options += `<option value="${u}">${u}</option>`);
    } else if (cat === 'Weight') {
        ['mg', 'g', 'kg'].forEach(u => options += `<option value="${u}">${u}</option>`);
    } else if (cat === 'Temperature') {
        ['°C', '°F', 'K'].forEach(u => options += `<option value="${u}">${u}</option>`);
    }
    
    u1.innerHTML = options;
    u2.innerHTML = options;
    if (u1.options.length > 1) u2.selectedIndex = 1;
    ucConvert('1');
}

function ucConvert(source) {
    const cat = document.getElementById('ucCategory').value;
    const fromId = source === '1' ? '1' : '2';
    const toId = source === '1' ? '2' : '1';
    
    const vFrom = document.getElementById('ucInput' + fromId).value;
    if(vFrom === '') { document.getElementById('ucInput' + toId).value = ''; return; }
    const val = parseFloat(vFrom);
    if(isNaN(val)) return;
    
    const uFrom = document.getElementById('ucUnit' + fromId).value;
    const uTo = document.getElementById('ucUnit' + toId).value;
    
    let res = 0;
    if (cat === 'Temperature') {
        let c = 0;
        if (uFrom === '°C') c = val;
        else if (uFrom === '°F') c = (val - 32) * 5/9;
        else if (uFrom === 'K') c = val - 273.15;
        
        if (uTo === '°C') res = c;
        else if (uTo === '°F') res = (c * 9/5) + 32;
        else if (uTo === 'K') res = c + 273.15;
    } else {
        const rates = {
            'Length': { mm: 0.001, cm: 0.01, m: 1, km: 1000 },
            'Weight': { mg: 0.000001, g: 0.001, kg: 1 }
        };
        const inBase = val * rates[cat][uFrom];
        res = inBase / rates[cat][uTo];
    }
    
    document.getElementById('ucInput' + toId).value = parseFloat(res.toPrecision(10));
}

// ==================== PASSWORD GENERATOR ====================
function loadPasswordGenerator() {
    let html = `
        <div class="tool-form">
            <div class="form-group">
                <label>Password Length:</label>
                <input type="range" id="pwdLength" min="4" max="32" value="12" 
                       oninput="updatePasswordLength(this.value)">
                <span id="lengthDisplay">12 characters</span>
            </div>

            <div class="password-options">
                <label class="checkbox-group">
                    <input type="checkbox" id="pwdUppercase" checked>
                    <span>Uppercase Letters (A-Z)</span>
                </label>
                <label class="checkbox-group">
                    <input type="checkbox" id="pwdLowercase" checked>
                    <span>Lowercase Letters (a-z)</span>
                </label>
                <label class="checkbox-group">
                    <input type="checkbox" id="pwdNumbers" checked>
                    <span>Numbers (0-9)</span>
                </label>
                <label class="checkbox-group">
                    <input type="checkbox" id="pwdSymbols" checked>
                    <span>Symbols (!@#$%)</span>
                </label>
            </div>

            <button onclick="generatePassword()">Generate Password</button>
            <div class="generated-password" id="generatedPwd">Click Generate</div>
            
            <div class="control-group">
                <button onclick="copyPassword()">Copy</button>
                <button onclick="savePwd()" class="btn-secondary">Save Password</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function updatePasswordLength(value) {
    document.getElementById('lengthDisplay').textContent = `${value} characters`;
}

function generatePassword() {
    let length = parseInt(document.getElementById('pwdLength').value);
    if (length < 4) length = 4;
    const useUppercase = document.getElementById('pwdUppercase').checked;
    const useLowercase = document.getElementById('pwdLowercase').checked;
    const useNumbers = document.getElementById('pwdNumbers').checked;
    const useSymbols = document.getElementById('pwdSymbols').checked;

    let chars = '';
    if (useUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) {
        showToast('Select at least one option', 'error');
        return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    document.getElementById('generatedPwd').textContent = password;
    window.currentPassword = password;
}

function copyPassword() {
    const pwd = window.currentPassword || document.getElementById('generatedPwd').textContent;
    if (pwd === 'Click Generate') {
        showToast('Generate a password first', 'error');
        return;
    }
    navigator.clipboard.writeText(pwd);
    showToast('Password copied!', 'success');
}

async function savePwd() {
    const pwd = window.currentPassword;
    if (!pwd) {
        showToast('Generate a password first', 'error');
        return;
    }

    const appName = prompt('Enter application/service name:');
    if (!appName) return;

    const passwords = await window.syncService.getData('savedPasswords', true) || [];
    passwords.push({ appName, password: pwd, date: new Date().toLocaleString() });
    await window.syncService.saveData('savedPasswords', passwords);
    showToast('Password saved!', 'success');
}

// ==================== PASSWORD SAVER ====================
async function loadPasswordSaver() {
    // Wait for sync service
    for (let i = 0; i < 10; i++) {
        if (window.syncService) break;
        await new Promise(r => setTimeout(r, 200));
    }

    let passwords = [];
    if (window.syncService) {
        passwords = await window.syncService.getData('savedPasswords', true) || [];
    } else {
        const saved = localStorage.getItem('savedPasswords');
        passwords = saved ? JSON.parse(saved) : [];
    }

    let html = `
        <div class="tool-form">
            <div class="form-group">
                <label>Application Name:</label>
                <input type="text" id="appName" placeholder="e.g., Gmail, Laptop">
            </div>
            <div class="form-group">
                <label>Password:</label>
                <input type="password" id="appPassword" placeholder="Enter password">
            </div>
            <button onclick="saveSinglePassword()">Save Password</button>

            <hr style="margin: 20px 0; border: none; border-top: 2px solid #e0e0e0;">
            <h3 style="margin: 15px 0;">Saved Passwords</h3>
    `;

    if (passwords.length === 0) {
        html += '<p class="empty-message">No saved passwords yet</p>';
    } else {
        passwords.forEach((pwd, index) => {
            html += `
                <div class="password-item">
                    <div class="password-item-header">
                        <span class="password-app-name">${escapeHtml(pwd.appName)}</span>
                        <button class="password-toggle" onclick="togglePasswordVisibility(${index})">Show</button>
                    </div>
                    <div class="password-text" id="pwd${index}" style="display: none;">
                        ${escapeHtml(pwd.password)}
                    </div>
                    <small style="color: #999;">Saved: ${pwd.date}</small>
                    <div class="password-item-actions">
                        <button onclick="copyPasswordItem(${index})">Copy</button>
                        <button class="btn-danger" onclick="deletePasswordItem(${index})">Delete</button>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    toolContent.innerHTML = html;
}

function togglePasswordVisibility(index) {
    const element = document.getElementById(`pwd${index}`);
    const button = event.target;
    
    if (element.style.display === 'none') {
        element.style.display = 'block';
        button.textContent = 'Hide';
    } else {
        element.style.display = 'none';
        button.textContent = 'Show';
    }
}

async function saveSinglePassword() {
    const appName = document.getElementById('appName').value.trim();
    const password = document.getElementById('appPassword').value;

    if (!appName || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }

    const passwords = await window.syncService.getData('savedPasswords', true) || [];
    passwords.push({ appName, password, date: new Date().toLocaleString() });
    await window.syncService.saveData('savedPasswords', passwords);
    
    document.getElementById('appName').value = '';
    document.getElementById('appPassword').value = '';
    loadPasswordSaver();
    showToast('Password saved!', 'success');
}

async function copyPasswordItem(index) {
    const passwords = await window.syncService.getData('savedPasswords', true) || [];
    navigator.clipboard.writeText(passwords[index].password);
    showToast('Password copied!', 'success');
}

async function deletePasswordItem(index) {
    if (!confirm('Are you sure you want to delete this password?')) return;

    const passwords = await window.syncService.getData('savedPasswords', true) || [];
    passwords.splice(index, 1);
    await window.syncService.saveData('savedPasswords', passwords);
    loadPasswordSaver();
    showToast('Password deleted!', 'success');
}

// ==================== DECISION MAKER ====================
// ==================== QUICK NOTES ====================
async function loadQuickNotes() {
    // Wait for sync service
    for (let i = 0; i < 10; i++) {
        if (window.syncService) break;
        await new Promise(r => setTimeout(r, 200));
    }

    let notes = [];
    if (window.syncService) {
        notes = await window.syncService.getData('quickNotes', true) || [];
    } else {
        const saved = localStorage.getItem('quickNotes');
        notes = saved ? JSON.parse(saved) : [];
    }

    let html = `
        <div class="tool-form">
            <textarea id="noteInput" placeholder="Write your notes here..." 
                      style="height: 150px; resize: vertical;"></textarea>
            <button onclick="saveNote()">Save Note</button>

            <hr style="margin: 20px 0; border: none; border-top: 2px solid #e0e0e0;">
            <h3 style="margin: 15px 0;">Your Notes</h3>
            <ul class="todo-list" id="notesList">
    `;

    if (notes.length === 0) {
        html += '<li class="empty-message">No notes yet</li>';
    } else {
        notes.forEach((note, index) => {
            html += `
                <li class="todo-item">
                    <div style="flex: 1;">
                        <div style="font-weight: 600;">${escapeHtml(note.title)}</div>
                        <div style="font-size: 0.9rem; color: #666; margin-top: 5px;">${escapeHtml(note.content)}</div>
                        <small style="color: #999;">${note.date}</small>
                    </div>
                    <button class="todo-delete" onclick="deleteNote(${index})">Delete</button>
                </li>
            `;
        });
    }

    html += '</ul></div>';
    toolContent.innerHTML = html;
}

async function saveNote() {
    const input = document.getElementById('noteInput');
    const content = input.value.trim();

    if (!content) {
        showToast('Please write something', 'error');
        return;
    }

    const title = content.substring(0, 50);
    const notes = await window.syncService.getData('quickNotes', true) || [];
    notes.push({ title, content, date: new Date().toLocaleString() });
    await window.syncService.saveData('quickNotes', notes);

    input.value = '';
    loadQuickNotes();
    showToast('Note saved!', 'success');
}

async function deleteNote(index) {
    if (!confirm('Are you sure?')) return;

    const notes = await window.syncService.getData('quickNotes', true) || [];
    notes.splice(index, 1);
    await window.syncService.saveData('quickNotes', notes);
    loadQuickNotes();
    showToast('Note deleted!', 'success');
}

// ==================== TIMER & STOPWATCH ====================
function loadTimer() {
    let html = `
        <div class="tool-form">
            <div id="notifIndicator" class="notif-status"></div>
            
            <div style="margin-bottom: 20px;">
                <h3>⏱️ Timer Mode</h3>
                <div class="form-group">
                    <label>Minutes:</label>
                    <input type="number" id="timerMin" min="0" max="59" value="1">
                </div>
                <div class="form-group">
                    <label>Seconds:</label>
                    <input type="number" id="timerSec" min="0" max="59" value="0">
                </div>
                <div class="control-group">
                    <button onclick="startTimer()">Start</button>
                    <button class="btn-secondary" onclick="stopTimer()">Stop</button>
                    <button class="btn-secondary" onclick="resetTimer()">Reset</button>
                </div>
            </div>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid var(--glass-border);">

            <div>
                <h3>⏱️ Stopwatch Mode</h3>
                <div id="stopwatchDisplay" style="font-size: 2.5rem; text-align: center; font-weight: bold; margin: 20px 0; font-family: monospace; color: #667eea;">00:00:00</div>
                <div class="control-group">
                    <button onclick="startStopwatch()">Start</button>
                    <button class="btn-secondary" onclick="stopStopwatch()">Stop</button>
                    <button class="btn-secondary" onclick="resetStopwatch()">Reset</button>
                </div>
                
                <div class="form-group">
                    <label>Alert at specific time:</label>
                    <div class="input-group">
                        <input type="number" id="swAlertMin" placeholder="Min">
                        <span style="align-self: center; font-weight: bold;">:</span>
                        <input type="number" id="swAlertSec" placeholder="Sec">
                    </div>
                </div>
            </div>

            <div id="activeRemindersList" class="active-reminders-container"></div>
        </div>
    `;
    toolContent.innerHTML = html;

    window.timerInterval = null;
    window.stopwatchInterval = null;
    window.stopwatchTime = 0;
    
    if (window.NotificationManager) {
        window.NotificationManager.updateUIStatus();
        window.NotificationManager.updateActiveLists();
    }
}

function startTimer() {
    if (window.timerInterval) return;

    let minutes = parseInt(document.getElementById('timerMin').value) || 0;
    let seconds = parseInt(document.getElementById('timerSec').value) || 0;

    if (minutes === 0 && seconds === 0) {
        showToast('Set a time first', 'error');
        return;
    }

    const totalMinutes = minutes + (seconds / 60);
    if (window.NotificationManager) {
        window.NotificationManager.schedule('Timer Finished', 'Your timer has ended.', totalMinutes, 'timer');
    }

    window.timerInterval = setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(window.timerInterval);
                // showToast('Time\'s up!', 'success'); // Already handled by NotifTrigger
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }

        const mEl = document.getElementById('timerMin');
        const sEl = document.getElementById('timerSec');
        if (mEl) mEl.value = minutes;
        if (sEl) sEl.value = seconds;
    }, 1000);
}

function stopTimer() {
    clearInterval(window.timerInterval);
    window.timerInterval = null;
}

function resetTimer() {
    stopTimer();
    document.getElementById('timerMin').value = '0';
    document.getElementById('timerSec').value = '0';
}

function startStopwatch() {
    if (window.stopwatchInterval) return;

    const alertMin = parseInt(document.getElementById('swAlertMin')?.value) || -1;
    const alertSec = parseInt(document.getElementById('swAlertSec')?.value) || 0;
    const alertTotalSec = alertMin >= 0 ? (alertMin * 60) + alertSec : -1;

    window.stopwatchInterval = setInterval(() => {
        window.stopwatchTime++;
        updateStopwatchDisplay();

        if (alertTotalSec > 0 && window.stopwatchTime === alertTotalSec) {
            if (window.NotificationManager) {
                window.NotificationManager.trigger({
                    title: 'Stopwatch Alert',
                    message: `Target time reached: ${pad(alertMin)}:${pad(alertSec)}`,
                    type: 'stopwatch'
                });
            }
        }
    }, 1000);
}

function stopStopwatch() {
    clearInterval(window.stopwatchInterval);
    window.stopwatchInterval = null;
}

function resetStopwatch() {
    stopStopwatch();
    window.stopwatchTime = 0;
    updateStopwatchDisplay();
}

function updateStopwatchDisplay() {
    const hours = Math.floor(window.stopwatchTime / 3600);
    const minutes = Math.floor((window.stopwatchTime % 3600) / 60);
    const seconds = window.stopwatchTime % 60;

    document.getElementById('stopwatchDisplay').textContent = 
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

// ==================== PDF TOOLS ====================

// ========== PDF HELPERS ==========
let pdfState = {
    currentFiles: [],
    currentImages: [],
    converterFile: null,
    rotateFile: null
};

// Standardized Download Function
function downloadFile(data, filename, mimeType = 'application/pdf') {
    console.log(`[PDF] Preparing download: ${filename}`);
    try {
        let url;
        let isDataUrl = false;

        if (typeof data === 'string' && data.startsWith('data:')) {
            url = data; // Handle base64 strings (data URLs) directly
            isDataUrl = true;
        } else {
            const blob = (data instanceof Blob) ? data : new Blob([data], { type: mimeType });
            url = URL.createObjectURL(blob);
        }

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        
        // Use a slight delay to ensure the browser registers the click properly
        setTimeout(() => {
            a.click();
            console.log(`[PDF] Triggered download for: ${filename}`);
            
            // Wait longer before cleanup to ensure the download starts, 
            // especially for larger files or slower systems.
            setTimeout(() => {
                if (document.body.contains(a)) document.body.removeChild(a);
                if (!isDataUrl && url.startsWith('blob:')) {
                    window.URL.revokeObjectURL(url);
                    console.log(`[PDF] Revoked Object URL for: ${filename}`);
                }
            }, 2000); 
        }, 100);
    } catch (error) {
        console.error('[PDF] Download failed:', error);
        showToast('Download failed. Please try again.', 'error');
    }
}

// Visual Progress Update
function updateProgress(message, progress) {
    console.log(`[PDF Progress] ${message}: ${progress}%`);
    const progressContainer = document.getElementById('pdfProgressContainer');
    if (!progressContainer) {
        const container = document.getElementById('toolContent');
        const progressBarHtml = `
            <div id="pdfProgressContainer" class="pdf-progress-container">
                <div class="progress-message" id="progressMsg">${message}</div>
                <div class="progress-bar-wrapper">
                    <div id="progressBarFill" class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-percent" id="progressPercent">${progress}%</div>
            </div>
        `;
        // Inject at top of toolContent
        container.insertAdjacentHTML('afterbegin', progressBarHtml);
    } else {
        document.getElementById('progressMsg').textContent = message;
        document.getElementById('progressBarFill').style.width = `${progress}%`;
        document.getElementById('progressPercent').textContent = `${progress}%`;
    }
}

function removeProgress() {
    const el = document.getElementById('pdfProgressContainer');
    if (el) el.remove();
}

// Toggle loading state on buttons
function toggleToolLoading(buttonId, isLoading, defaultText) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.disabled = isLoading;
    btn.innerHTML = isLoading ? `<span class="spinner-small"></span> Processing...` : defaultText;
}

// Drag & Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-active');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-active');
}

// Set up PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// ========== IMAGE TO PDF ==========
// ========== IMAGE TO PDF ==========
function loadImageToPDF() {
    console.log('[PDF] Loading Image to PDF tool');
    pdfState.currentImages = [];
    
    let html = `
        <div class="tool-form">
            <div class="pdf-upload-area" id="imageUploadArea" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleImageDrop(event)">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🖼️</div>
                    <div class="pdf-upload-text">
                        <h3>Upload Images</h3>
                        <p>Drag & drop or click to select multiple images</p>
                        <small>Supports JPG, PNG, GIF, BMP</small>
                    </div>
                </div>
                <input type="file" id="imageFileInput" accept="image/*" multiple style="display: none;">
            </div>
            
            <div id="imagePreviewContainer" class="image-preview-grid"></div>
            
            <div class="tool-settings glass-panel" style="margin-top: 20px; padding: 20px; display: none;" id="imageToPdfSettings">
                <div class="form-group">
                    <label>Page Size:</label>
                    <select id="pageSize" class="glass-input">
                        <option value="a4">A4 (210 x 297mm)</option>
                        <option value="letter">Letter (8.5 x 11in)</option>
                        <option value="a3">A3 (297 x 420mm)</option>
                    </select>
                </div>
                <div class="form-group" style="margin-top: 15px;">
                    <label>Fit Mode:</label>
                    <select id="fitMode" class="glass-input">
                        <option value="contain">Fit (Maintain Aspect)</option>
                        <option value="cover">Fill Page</option>
                        <option value="original">Original Size</option>
                    </select>
                </div>
                <button id="convertBtn" class="pdf-btn" onclick="convertImagesToPDF()">⬇️ Convert to PDF</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    
    const fileInput = document.getElementById('imageFileInput');
    const uploadArea = document.getElementById('imageUploadArea');
    
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleImageFiles(e.target.files);
}

function handleImageDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-active');
    handleImageFiles(e.dataTransfer.files);
}

async function handleImageFiles(files) {
    console.log(`[PDF] Selected ${files.length} images`);
    if (files.length === 0) return;
    
    const container = document.getElementById('imagePreviewContainer');
    const settings = document.getElementById('imageToPdfSettings');
    settings.style.display = 'block';
    
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        // Show immediate placeholder to give user feedback
        const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        previewItem.id = tempId;
        previewItem.innerHTML = `
            <div style="height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.05); font-size: 0.8rem; color: #666; padding: 10px; text-align: center;">
                ⌛ Loading ${file.name}...
            </div>
            <button class="image-preview-remove" onclick="removeSelectedImage('${tempId}')">×</button>
        `;
        container.appendChild(previewItem);
        
        // Read file contents
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            const id = 'img_' + Math.random().toString(36).substr(2, 9);
            pdfState.currentImages.push({ id, name: file.name, data: imageData, type: file.type });
            
            // Update the placeholder with the actual image
            const item = document.getElementById(tempId);
            if (item) {
                item.id = id;
                item.innerHTML = `
                    <img src="${imageData}" alt="${file.name}">
                    <button class="image-preview-remove" onclick="removeSelectedImage('${id}')">×</button>
                `;
            }
            console.log(`[PDF] Image loaded: ${file.name}`);
        };
        reader.onerror = () => {
            console.error(`[PDF] Failed to read image: ${file.name}`);
            const item = document.getElementById(tempId);
            if (item) item.remove();
            showToast(`Failed to load ${file.name}`, 'error');
        };
        reader.readAsDataURL(file);
    }
}

function removeSelectedImage(id) {
    pdfState.currentImages = pdfState.currentImages.filter(img => img.id !== id);
    const el = document.getElementById(id);
    if (el) el.remove();
    if (pdfState.currentImages.length === 0) {
        document.getElementById('imageToPdfSettings').style.display = 'none';
    }
}

async function convertImagesToPDF() {
    if (pdfState.currentImages.length === 0) {
        showToast('Please select images first', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const pageSize = document.getElementById('pageSize').value;
    const fitMode = document.getElementById('fitMode').value;
    const btn = document.getElementById('convertBtn');
    
    toggleToolLoading('convertBtn', true, '⬇️ Convert to PDF');
    updateProgress('Initializing PDF...', 10);
    
    try {
        let pageWidth = 210, pageHeight = 297; // A4
        if (pageSize === 'letter') { pageWidth = 215.9; pageHeight = 279.4; }
        else if (pageSize === 'a3') { pageWidth = 297; pageHeight = 420; }
        
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: pageSize });
        
        for (let i = 0; i < pdfState.currentImages.length; i++) {
            const imgData = pdfState.currentImages[i];
            updateProgress(`Processing image ${i + 1}/${pdfState.currentImages.length}`, Math.round(10 + (80 * (i / pdfState.currentImages.length))));
            
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    if (i > 0) pdf.addPage(pageSize);
                    
                    let w = pageWidth, h = pageHeight;
                    let x = 0, y = 0;
                    
                    if (fitMode === 'contain') {
                        const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
                        w = img.width * ratio;
                        h = img.height * ratio;
                        x = (pageWidth - w) / 2;
                        y = (pageHeight - h) / 2;
                    } else if (fitMode === 'original') {
                        w = img.width * 0.264583; // px to mm
                        h = img.height * 0.264583;
                    }
                    
                    pdf.addImage(imgData.data, 'JPEG', x, y, w, h, undefined, 'FAST');
                    resolve();
                };
                img.onerror = reject;
                img.src = imgData.data;
            });
        }
        
        updateProgress('Finalizing...', 95);
        const pdfBlob = pdf.output('blob');
        downloadFile(pdfBlob, 'converted-images.pdf');
        showToast('✓ PDF generated successfully!', 'success');
    } catch (error) {
        console.error('[PDF] Error converting images:', error);
        showToast('Error during conversion: ' + error.message, 'error');
    } finally {
        toggleToolLoading('convertBtn', false, '⬇️ Convert to PDF');
        setTimeout(removeProgress, 2000);
    }
}

// ========== PDF TO IMAGE ==========
// ========== PDF TO IMAGE ==========
function loadPDFToImage() {
    console.log('[PDF] Loading PDF to Image tool');
    pdfState.converterFile = null;
    
    let html = `
        <div class="tool-form">
            <div class="pdf-upload-area" id="pdfToImageArea" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handlePDFToImageDrop(event)">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📄</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDF</h3>
                        <p>Drag & drop or click to select a PDF file</p>
                    </div>
                </div>
                <input type="file" id="pdfToImageInput" accept=".pdf" style="display: none;">
            </div>
            
            <div id="pdfFileInfo" class="file-preview-container" style="display: none; margin-bottom: 20px;"></div>
            
            <div class="tool-settings glass-panel" id="pdfToImageSettings" style="display: none; padding: 20px;">
                <div class="tool-grid-2">
                    <div class="form-group">
                        <label>Format:</label>
                        <select id="imageFormat" class="glass-input">
                            <option value="png">PNG (Best Quality)</option>
                            <option value="jpeg">JPG (Smaller Size)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Quality (DPI):</label>
                        <select id="imageDPI" class="glass-input">
                            <option value="150">150 DPI (Standard)</option>
                            <option value="300">300 DPI (High Quality)</option>
                            <option value="72">72 DPI (Web Optimized)</option>
                        </select>
                    </div>
                </div>
                <button id="startConversionBtn" class="pdf-btn" onclick="startPDFToImageConversion()">📸 Convert to Images</button>
            </div>
            
            <div id="conversionResult" class="image-preview-grid" style="margin-top: 20px;"></div>
        </div>
    `;
    toolContent.innerHTML = html;
    
    const fileInput = document.getElementById('pdfToImageInput');
    const uploadArea = document.getElementById('pdfToImageArea');
    
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handlePDFToImageFile(e.target.files[0]);
}

function handlePDFToImageDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-active');
    handlePDFToImageFile(e.dataTransfer.files[0]);
}

function handlePDFToImageFile(file) {
    if (!file || file.type !== 'application/pdf') {
        showToast('Please select a valid PDF file', 'error');
        return;
    }
    
    pdfState.converterFile = file;
    console.log(`[PDF] Selected file for conversion: ${file.name}`);
    
    const info = document.getElementById('pdfFileInfo');
    info.style.display = 'block';
    info.innerHTML = `
        <div class="file-item">
            <div class="file-icon">📄</div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
        </div>
    `;
    
    document.getElementById('pdfToImageSettings').style.display = 'block';
    document.getElementById('conversionResult').innerHTML = '';
}

async function startPDFToImageConversion() {
    if (!pdfState.converterFile) return;
    
    const format = document.getElementById('imageFormat').value;
    const dpi = parseInt(document.getElementById('imageDPI').value);
    const scale = dpi / 72;
    const results = document.getElementById('conversionResult');
    
    toggleToolLoading('startConversionBtn', true, '📸 Convert to Images');
    results.innerHTML = '';
    
    try {
        updateProgress('Reading PDF...', 10);
        const arrayBuffer = await pdfState.converterFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = Math.min(pdf.numPages, 50); // Limit to 50 pages for performance
        
        for (let i = 1; i <= totalPages; i++) {
            updateProgress(`Rendering page ${i}/${totalPages}`, Math.round(10 + (85 * (i / totalPages))));
            
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({ canvasContext: ctx, viewport }).promise;
            
            const imgData = canvas.toDataURL(`image/${format}`, 0.9);
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.style.cursor = 'pointer';
            previewItem.title = 'Click to download this page';
            previewItem.innerHTML = `
                <img src="${imgData}">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; font-size: 10px; padding: 2px; text-align: center;">Page ${i}</div>
            `;
            previewItem.onclick = () => downloadFile(imgData, `page-${i}.${format}`, `image/${format}`);
            results.appendChild(previewItem);
        }
        
        showToast(`✓ Converted ${totalPages} pages. Click to download!`, 'success');
    } catch (error) {
        console.error('[PDF] Conversion error:', error);
        showToast('Error converting PDF: ' + error.message, 'error');
    } finally {
        toggleToolLoading('startConversionBtn', false, '📸 Convert to Images');
        setTimeout(removeProgress, 2000);
    }
}

// ========== MERGE PDF ==========
// ========== MERGE PDF ==========
function loadMergePDF() {
    console.log('[PDF] Loading Merge PDF tool');
    pdfState.currentFiles = [];
    
    let html = `
        <div class="tool-form">
            <div class="pdf-upload-area" id="mergeUploadArea" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleMergeDrop(event)">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📎</div>
                    <div class="pdf-upload-text">
                        <h3>Upload PDFs</h3>
                        <p>Select multiple PDF files to merge together</p>
                    </div>
                </div>
                <input type="file" id="mergeFileInput" accept=".pdf" multiple style="display: none;">
            </div>
            
            <div id="mergeFilesList" class="file-preview-container" style="display: none;">
                <h4>Selected Files:</h4>
                <div class="file-items" id="mergeFilesItems"></div>
                <button id="mergeBtn" class="pdf-btn" onclick="performMergePDF()">📎 Merge PDFs</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    
    const fileInput = document.getElementById('mergeFileInput');
    const uploadArea = document.getElementById('mergeUploadArea');
    
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleMergeFiles(e.target.files);
}

function handleMergeDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-active');
    handleMergeFiles(e.dataTransfer.files);
}

function handleMergeFiles(files) {
    if (files.length === 0) return;
    
    for (const file of files) {
        if (file.type !== 'application/pdf') continue;
        const id = 'pdf_' + Math.random().toString(36).substr(2, 9);
        pdfState.currentFiles.push({ id, file });
    }
    
    renderMergeList();
}

function renderMergeList() {
    const container = document.getElementById('mergeFilesList');
    const items = document.getElementById('mergeFilesItems');
    
    if (pdfState.currentFiles.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    items.innerHTML = '';
    
    pdfState.currentFiles.forEach((item, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-icon">📄</div>
            <div class="file-info">
                <div class="file-name">${item.file.name}</div>
                <div class="file-size">${(item.file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            <button class="file-remove-btn" onclick="removeMergeFile('${item.id}')">×</button>
        `;
        items.appendChild(fileItem);
    });
}

function removeMergeFile(id) {
    pdfState.currentFiles = pdfState.currentFiles.filter(f => f.id !== id);
    renderMergeList();
}

async function performMergePDF() {
    if (pdfState.currentFiles.length < 2) {
        showToast('Please select at least 2 PDF files to merge', 'error');
        return;
    }
    
    toggleToolLoading('mergeBtn', true, '📎 Merge PDFs');
    updateProgress('Loading PDF library...', 10);
    
    try {
        if (!window.PDFLib) {
            throw new Error('PDF library failed to load. Please refresh the page.');
        }
        
        const mergedPdf = await window.PDFLib.PDFDocument.create();
        
        for (let i = 0; i < pdfState.currentFiles.length; i++) {
            const file = pdfState.currentFiles[i].file;
            updateProgress(`Merging: ${file.name}`, Math.round(10 + (80 * (i / pdfState.currentFiles.length))));
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }
        
        updateProgress('Saving merged PDF...', 90);
        const mergedBytes = await mergedPdf.save();
        downloadFile(mergedBytes, 'merged-document.pdf');
        showToast('✓ PDFs merged successfully!', 'success');
    } catch (error) {
        console.error('[PDF] Merge error:', error);
        showToast('Error merging PDFs: ' + error.message, 'error');
    } finally {
        toggleToolLoading('mergeBtn', false, '📎 Merge PDFs');
        setTimeout(removeProgress, 2000);
    }
}

// ========== COMPRESS IMAGE ==========
function loadCompressImage() {
    let html = `
        <div class="tool-form">
            <h3>🗜️ Compress Image</h3>
            <div class="image-upload-area" ondrop="handleImageDropForCompress(event)" ondragover="event.preventDefault()" ondragleave="event.preventDefault()">
                <div class="image-upload-content">
                    <div class="image-upload-icon">📸</div>
                    <h3>Upload Image</h3>
                    <p>JPG, PNG (Drag & drop or click)</p>
                </div>
                <input type="file" id="compressImageInput" accept=".jpg,.jpeg,.png" style="display: none;">
            </div>
            
            <div id="imagePreviewSection" style="display: none; margin-top: 15px;">
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px;">
                        <label style="font-weight: bold; display: block; margin-bottom: 8px;">Original Image:</label>
                        <img id="originalPreview" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px;" />
                        <div id="originalSize" style="margin-top: 8px; font-size: 0.9rem; color: #666;"></div>
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <label style="font-weight: bold; display: block; margin-bottom: 8px;">Compressed Preview:</label>
                        <img id="compressedPreview" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px; display: none;" />
                        <div id="compressedSize" style="margin-top: 8px; font-size: 0.9rem; color: #666;"></div>
                    </div>
                </div>
                
                <div class="form-group" style="margin-top: 15px;">
                    <label>Compression Quality Slider (Slide left for smaller sizes, down to ~5KB):</label>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 0.85rem; color:#666;">Max Compression</span>
                        <input type="range" id="compressionSlider" min="0.01" max="1" step="0.05" value="0.6" oninput="setCompressionLevel(this.value)" style="flex: 1; cursor: pointer;">
                        <span style="font-size: 0.85rem; color:#666;">Original Quality</span>
                    </div>
                </div>
                
                <div style="margin-top: 15px; padding: 12px; background: #f0f0f0; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Size Reduction:</span>
                        <span id="sizeReduction" style="font-weight: bold; color: #28a745;">--%</span>
                    </div>
                </div>
                
                <button id="downloadCompressedBtn" onclick="downloadCompressedImage()" style="width: 100%; margin-top: 15px; display: none;">⬇️ Download Compressed Image</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    setupCompressImageUpload();
}

let imageState = {
    originalFile: null,
    originalCanvas: null,
    compressedCanvas: null,
    compressionQuality: 0.6,
};

function setupCompressImageUpload() {
    const uploadArea = document.querySelector('.image-upload-area');
    const fileInput = document.getElementById('compressImageInput');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                loadImageForCompression(file);
            }
        });
    }
}

function handleImageDropForCompress(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            loadImageForCompression(file);
        } else {
            showToast('Please upload a valid image file (JPG, PNG)', 'error');
        }
    }
}

function loadImageForCompression(file) {
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        showToast('Only JPG and PNG images are supported', 'error');
        return;
    }
    
    imageState.originalFile = file;
    imageState.compressionQuality = 0.6; // Reset to medium
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            document.getElementById('imagePreviewSection').style.display = 'block';
            document.getElementById('originalPreview').src = img.src;
            document.getElementById('originalSize').textContent = `📊 Size: ${getFileSizeString(file.size)}`;
            document.getElementById('compressedPreview').style.display = 'none';
            document.getElementById('compressedSize').textContent = '';
            document.getElementById('sizeReduction').textContent = '--%';
            document.getElementById('downloadCompressedBtn').style.display = 'none';
            document.getElementById('compressionSlider').value = 0.6;
            
            // Create original canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            imageState.originalCanvas = canvas;
            imageState.compressedCanvas = null;
            
            showToast('✓ Image loaded. Select compression level.', 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

let compressTimeout = null;
function setCompressionLevel(quality) {
    imageState.compressionQuality = parseFloat(quality);
    
    if (!imageState.originalCanvas) return;
    
    clearTimeout(compressTimeout);
    compressTimeout = setTimeout(() => {
        compressImageCanvas();
    }, 150);
}

function compressImageCanvas() {
    if (!imageState.originalCanvas) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = imageState.originalCanvas.width;
    canvas.height = imageState.originalCanvas.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageState.originalCanvas, 0, 0);
    
    imageState.compressedCanvas = canvas;
    
    const compressedDataUrl = canvas.toDataURL('image/jpeg', imageState.compressionQuality);
    const compressedSize = Math.ceil((compressedDataUrl.length * 3) / 4);
    const originalSize = imageState.originalFile.size;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    document.getElementById('compressedPreview').src = compressedDataUrl;
    document.getElementById('compressedPreview').style.display = 'block';
    document.getElementById('compressedSize').textContent = `📊 Size: ${getFileSizeString(compressedSize)}`;
    document.getElementById('sizeReduction').textContent = `${reduction}%`;
    document.getElementById('downloadCompressedBtn').style.display = 'block';
    
    showToast(`✓ Image compressed by ${reduction}%`, 'success');
}

function getFileSizeString(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function downloadCompressedImage() {
    if (!imageState.compressedCanvas) {
        showToast('Please compress an image first', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = imageState.compressedCanvas.toDataURL('image/jpeg', imageState.compressionQuality);
    
    const originalName = imageState.originalFile.name.replace(/\.[^.]+$/, '');
    link.download = `${originalName}-compressed.jpg`;
    link.click();
    
    showToast('✓ Image downloaded successfully', 'success');
}

// ========== IMAGE INFO ==========
function loadImageInfo() {
    let html = `
        <div class="tool-form">
            <h3>📏 Image Info</h3>
            <div class="image-upload-area" ondrop="handleImageInfoDrop(event)" ondragover="event.preventDefault()" ondragleave="event.preventDefault()">
                <div class="image-upload-content">
                    <div class="image-upload-icon">📸</div>
                    <h3>Upload Image</h3>
                    <p>JPG, PNG, WEBP (Drag & drop or click)</p>
                </div>
                <input type="file" id="imageInfoInput" accept=".jpg,.jpeg,.png,.webp" style="display: none;">
            </div>
            
            <div id="imageInfoResultSection" style="display: none; margin-top: 20px;">
                <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 20px;">
                    <div style="flex: 1; min-width: 200px;">
                        <img id="imageInfoPreview" style="max-width: 100%; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                    </div>
                    <div style="flex: 1; min-width: 250px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h4 style="color: #667eea; margin-bottom: 15px; font-size: 1.1rem;">Image Details</h4>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="padding: 10px; background: #f5f7fa; border-radius: 6px; border-left: 4px solid #667eea;">
                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">📐 Width</div>
                                <div id="imageInfoWidth" style="font-size: 1.3rem; font-weight: bold; color: #333;">-</div>
                            </div>
                            <div style="padding: 10px; background: #f5f7fa; border-radius: 6px; border-left: 4px solid #764ba2;">
                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">📐 Height</div>
                                <div id="imageInfoHeight" style="font-size: 1.3rem; font-weight: bold; color: #333;">-</div>
                            </div>
                            <div style="padding: 10px; background: #f5f7fa; border-radius: 6px; border-left: 4px solid #28a745;">
                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">📦 File Size</div>
                                <div id="imageInfoSize" style="font-size: 1.3rem; font-weight: bold; color: #333;">-</div>
                            </div>
                            <div style="padding: 10px; background: #f5f7fa; border-radius: 6px; border-left: 4px solid #ffc107;">
                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">📁 File Name</div>
                                <div id="imageInfoName" style="font-size: 1rem; font-weight: bold; color: #333; word-break: break-all;">-</div>
                            </div>
                            <div style="padding: 10px; background: #f5f7fa; border-radius: 6px; border-left: 4px solid #17a2b8;">
                                <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">🔍 Format</div>
                                <div id="imageInfoFormat" style="font-size: 1.3rem; font-weight: bold; color: #333;">-</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    setupImageInfoUpload();
}

let imageInfoState = {
    file: null,
    width: 0,
    height: 0
};

function setupImageInfoUpload() {
    const uploadArea = document.querySelector('.image-upload-area');
    const fileInput = document.getElementById('imageInfoInput');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                loadImageInfoData(file);
            }
        });
    }
}

function handleImageInfoDrop(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            loadImageInfoData(file);
        } else {
            showToast('Please upload a valid image file (JPG, PNG, WEBP)', 'error');
        }
    }
}

function loadImageInfoData(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showToast('Only JPG, PNG, and WEBP images are supported', 'error');
        return;
    }
    
    imageInfoState.file = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            imageInfoState.width = img.width;
            imageInfoState.height = img.height;
            
            // Display the results
            document.getElementById('imageInfoResultSection').style.display = 'block';
            document.getElementById('imageInfoPreview').src = img.src;
            document.getElementById('imageInfoWidth').textContent = `${img.width}px`;
            document.getElementById('imageInfoHeight').textContent = `${img.height}px`;
            document.getElementById('imageInfoSize').textContent = getFileSizeString(file.size);
            document.getElementById('imageInfoName').textContent = file.name;
            
            // Get format from MIME type
            const formatMap = {
                'image/jpeg': 'JPG',
                'image/png': 'PNG',
                'image/webp': 'WEBP'
            };
            document.getElementById('imageInfoFormat').textContent = formatMap[file.type] || 'Unknown';
            
            showToast('✓ Image info loaded successfully', 'success');
        };
        img.onerror = () => {
            showToast('Error loading image', 'error');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ========== DISCOUNT CALCULATOR ==========
function loadDiscountCalculator() {
    let html = `
        <div class="tool-form">
            <h3>🧮 Discount Calculator</h3>
            <div class="form-group">
                <label>Original Price (₹)</label>
                <input type="number" id="originalPrice" placeholder="Enter price" min="0" step="0.01" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <div class="form-group">
                <label>Discount (%)</label>
                <input type="number" id="discountPercent" placeholder="Enter discount %" min="0" max="100" step="0.01" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="padding: 15px; background: #f5f7fa; border-radius: 6px;">
                        <div style="font-size: 0.85rem; color: #666;">Discount Amount</div>
                        <div id="discountAmount" style="font-size: 1.5rem; font-weight: bold; color: #28a745; margin-top: 5px;">₹ 0.00</div>
                    </div>
                    <div style="padding: 15px; background: #f5f7fa; border-radius: 6px;">
                        <div style="font-size: 0.85rem; color: #666;">Final Price</div>
                        <div id="finalPrice" style="font-size: 1.5rem; font-weight: bold; color: #667eea; margin-top: 5px;">₹ 0.00</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    document.getElementById('originalPrice').addEventListener('input', calculateDiscount);
    document.getElementById('discountPercent').addEventListener('input', calculateDiscount);
}

function calculateDiscount() {
    const price = parseFloat(document.getElementById('originalPrice').value) || 0;
    const discount = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discountAmount = (price * discount) / 100;
    const finalPrice = price - discountAmount;
    
    document.getElementById('discountAmount').textContent = '₹ ' + discountAmount.toFixed(2);
    document.getElementById('finalPrice').textContent = '₹ ' + finalPrice.toFixed(2);
}

// ========== PERCENTAGE CALCULATOR ==========
function loadPercentageCalculator() {
    let html = `
        <div class="tool-form">
            <h3>🔢 Percentage Calculator</h3>
            <div class="form-group">
                <label>Number</label>
                <input type="number" id="percentNumber" placeholder="Enter number" step="0.01" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <div class="form-group">
                <label>Percentage (%)</label>
                <input type="number" id="percentage" placeholder="Enter percentage" step="0.01" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="text-align: center;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">Result</div>
                    <div id="percentResult" style="font-size: 2rem; font-weight: bold; color: #667eea;">0</div>
                </div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    document.getElementById('percentNumber').addEventListener('input', calculatePercentage);
    document.getElementById('percentage').addEventListener('input', calculatePercentage);
}

function calculatePercentage() {
    const number = parseFloat(document.getElementById('percentNumber').value) || 0;
    const percent = parseFloat(document.getElementById('percentage').value) || 0;
    const result = (number * percent) / 100;
    
    document.getElementById('percentResult').textContent = result.toFixed(2);
}

// ========== PASSWORD STRENGTH CHECKER ==========
function loadPasswordStrengthChecker() {
    let html = `
        <div class="tool-form">
            <h3>🔐 Password Strength Checker</h3>
            <div class="form-group">
                <label>Enter Password</label>
                <input type="password" id="passwordInput" placeholder="Enter password" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <button onclick="togglePasswordVisibility('passwordInput')" style="width: 100%; padding: 10px; background: #ddd; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 15px;">👁️ Show/Hide</button>
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 8px;">Strength: <span id="strengthLevel" style="font-weight: bold;">-</span></div>
                    <div id="strengthBar" style="height: 8px; background: #ddd; border-radius: 4px; overflow: hidden;">
                        <div id="strengthFill" style="height: 100%; width: 0%; background: #999; transition: width 0.3s, background 0.3s;"></div>
                    </div>
                </div>
                <div id="strengthRules" style="font-size: 0.85rem; color: #666;"></div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    document.getElementById('passwordInput').addEventListener('input', checkPasswordStrength);
}

function checkPasswordStrength() {
    const password = document.getElementById('passwordInput').value;
    let strength = 0;
    const rules = [];
    
    if (password.length >= 8) { strength++; rules.push('✓ Length ≥ 8'); } else rules.push('✗ Length < 8');
    if (/[a-z]/.test(password)) { strength++; rules.push('✓ Lowercase'); } else rules.push('✗ No lowercase');
    if (/[A-Z]/.test(password)) { strength++; rules.push('✓ Uppercase'); } else rules.push('✗ No uppercase');
    if (/\d/.test(password)) { strength++; rules.push('✓ Numbers'); } else rules.push('✗ No numbers');
    if (/[!@#$%^&*]/.test(password)) { strength++; rules.push('✓ Symbols'); } else rules.push('✗ No symbols');
    
    let level = 'Weak', color = '#dc3545', percent = 20;
    if (strength >= 3) { level = 'Medium'; color = '#ffc107'; percent = 60; }
    if (strength >= 4) { level = 'Strong'; color = '#28a745'; percent = 100; }
    
    document.getElementById('strengthLevel').textContent = level;
    document.getElementById('strengthFill').style.width = percent + '%';
    document.getElementById('strengthFill').style.background = color;
    document.getElementById('strengthRules').innerHTML = rules.join('<br>');
}

// ========== RANDOM NAME PICKER ==========
function loadRandomNamePicker() {
    let html = `
        <div class="tool-form">
            <h3>🎯 Random Name Picker</h3>
            <div class="form-group">
                <label>Enter Names (comma or line separated)</label>
                <textarea id="namesList" placeholder="john, jane, bob&#10;or&#10;john&#10;jane&#10;bob" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; resize: vertical; min-height: 120px;"></textarea>
            </div>
            <button onclick="pickRandomName()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">🎲 Pick Random Name</button>
            <div id="resultBox" style="display: none; background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">Selected Name</div>
                <div id="pickedName" style="font-size: 2.5rem; font-weight: bold; color: #667eea; margin-bottom: 15px;">-</div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function pickRandomName() {
    const input = document.getElementById('namesList').value;
    let names = [];
    
    if (input.includes(',')) {
        names = input.split(',').map(n => n.trim()).filter(n => n);
    } else {
        names = input.split('\n').map(n => n.trim()).filter(n => n);
    }
    
    if (names.length === 0) {
        showToast('Please enter at least one name', 'error');
        return;
    }
    
    const picked = names[Math.floor(Math.random() * names.length)];
    document.getElementById('resultBox').style.display = 'block';
    document.getElementById('pickedName').textContent = picked;
    showToast('✓ Name picked!', 'success');
}

// ========== DAYS BETWEEN DATES ==========
function loadDaysBetween() {
    let html = `
        <div class="tool-form">
            <h3>📅 Days Between Dates</h3>
            <div class="form-group">
                <label>Start Date</label>
                <input type="date" id="startDate" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" id="endDate" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <button onclick="calculateDays()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">Calculate Days</button>
            <div id="daysResult" style="display: none; background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">Total Days</div>
                <div id="daysBetween" style="font-size: 2.5rem; font-weight: bold; color: #28a745;">0</div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function calculateDays() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showToast('Please select both dates', 'error');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    document.getElementById('daysResult').style.display = 'block';
    document.getElementById('daysBetween').textContent = diffDays;
    showToast('✓ Days calculated!', 'success');
}

// ========== USERNAME GENERATOR ==========
let generatedUsernames = [];
let usernameDisplayIndex = 0;

function loadUsernameGenerator() {
    let html = `
        <div class="tool-form">
            <h3>🔤 Username Generator</h3>
            <div class="form-group">
                <label>Name / Keyword</label>
                <input type="text" id="usernameKeyword" placeholder="e.g., john" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button onclick="generateUsernames()" style="flex: 2; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">Generate Recommendations</button>
                <button onclick="showNextUsernames()" id="refreshUsernamesBtn" style="flex: 1; padding: 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; display: none;">🔄 Refresh</button>
            </div>
            <div id="usernamesBox" style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: none;">
                <label style="font-weight:bold; margin-bottom: 10px; display: block;" id="usernamesCountLabel">Showing 10 usernames</label>
                <div id="suggestionsList" style="display: flex; flex-direction: column; gap: 8px;"></div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function generateUsernames() {
    const keyword = document.getElementById('usernameKeyword').value.trim();
    if (!keyword) {
        showToast('Please enter a name or keyword', 'error');
        return;
    }
    
    generatedUsernames = [];
    usernameDisplayIndex = 0;
    
    const prefixes = ['the', 'real', 'mr', 'ms', 'dr', 'pro', 'super', 'epic', 'itz', 'its', 'iam'];
    const suffixes = ['_x', '007', 'pro', 'dev', '_', '123', 'official', 'gaming', 'vlogs', 'yt', 'hub'];
    
    generatedUsernames.push(keyword);
    generatedUsernames.push(keyword + '_' + new Date().getFullYear());
    
    while(generatedUsernames.length < 100) {
        let type = Math.floor(Math.random() * 4);
        let name = '';
        if (type === 0) name = keyword + Math.floor(Math.random() * 9999);
        else if (type === 1) name = prefixes[Math.floor(Math.random()*prefixes.length)] + '_' + keyword;
        else if (type === 2) name = keyword + suffixes[Math.floor(Math.random()*suffixes.length)];
        else name = prefixes[Math.floor(Math.random()*prefixes.length)] + keyword + Math.floor(Math.random() * 99);
        
        if(!generatedUsernames.includes(name)) generatedUsernames.push(name);
    }
    
    document.getElementById('usernamesBox').style.display = 'block';
    document.getElementById('refreshUsernamesBtn').style.display = 'block';
    showNextUsernames();
    showToast('✓ 100 Usernames generated!', 'success');
}

function showNextUsernames() {
    if (generatedUsernames.length === 0) return;
    
    let end = usernameDisplayIndex + 10;
    if (end > generatedUsernames.length) {
        usernameDisplayIndex = 0;
        end = 10;
    }
    
    const chunk = generatedUsernames.slice(usernameDisplayIndex, end);
    const html = chunk.map(u => `
        <div style="padding: 10px; background: #f5f7fa; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: monospace;">${u}</span>
            <button onclick="copyToClip('${u}')" style="padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">📋 Copy</button>
        </div>
    `).join('');
    
    document.getElementById('suggestionsList').innerHTML = html;
    document.getElementById('usernamesCountLabel').textContent = `Showing recommendations ${usernameDisplayIndex + 1} to ${end} (out of 100)`;
    usernameDisplayIndex = end;
}

function copyToClip(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✓ Copied: ' + text, 'success');
    });
}



// ========== EXAM MARKS CALCULATOR ==========
function loadExamCalculator() {
    let html = `
        <div class="tool-form">
            <h3>📝 Exam Marks Calculator</h3>
            <div id="subjectCountForm" style="margin-bottom: 20px;">
                <div class="form-group">
                    <label>Number of Subjects</label>
                    <input type="number" id="numSubjects" placeholder="e.g. 5" min="1" max="20" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                </div>
                <button onclick="generateSubjectFields()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">Generate Fields</button>
            </div>
            
            <div id="subjectsContainer" style="margin-bottom: 15px; display: none;"></div>
            
            <div id="resultsContainer" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: none;">
                <div class="tool-results-grid">
                    <div class="result-box">
                        <div style="font-size: 0.85rem; color: #666;">Total Marks</div>
                        <div id="totalMarks" style="font-size: 1.5rem; font-weight: bold; color: #667eea; margin-top: 5px;">0</div>
                    </div>
                    <div class="result-box">
                        <div style="font-size: 0.85rem; color: #666;">Average (%)</div>
                        <div id="totalPercent" style="font-size: 1.5rem; font-weight: bold; color: #28a745; margin-top: 5px;">0%</div>
                    </div>
                </div>
                <button onclick="loadExamCalculator()" style="width: 100%; margin-top: 15px; padding: 10px; background: #ddd; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Reset Form</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function generateSubjectFields() {
    const num = parseInt(document.getElementById('numSubjects').value) || 0;
    if(num < 1) { showToast('Please enter a valid number', 'error'); return; }
    
    let html = '';
    for(let i=0; i<num; i++) {
        html += `
        <div class="subject-field-card">
            <div class="exam-subject-row">
                <input type="text" placeholder="Subject ${i+1}" value="">
                <input type="number" class="exam-mark" placeholder="Obtained" value="0" min="0" oninput="updateMarks()">
                <input type="number" class="exam-outof" placeholder="Out Of" value="100" min="1" oninput="updateMarks()">
            </div>
        </div>`;
    }
    document.getElementById('subjectsContainer').innerHTML = html;
    document.getElementById('subjectsContainer').style.display = 'block';
    document.getElementById('resultsContainer').style.display = 'block';
    document.getElementById('subjectCountForm').style.display = 'none';
    updateMarks();
}

function updateMarks() {
    let total = 0, outOf = 0;
    const marks = document.querySelectorAll('.exam-mark');
    const outofs = document.querySelectorAll('.exam-outof');
    
    marks.forEach((input, index) => {
        total += parseFloat(input.value) || 0;
        outOf += parseFloat(outofs[index].value) || 100;
    });
    
    const percent = outOf > 0 ? ((total / outOf) * 100).toFixed(1) : 0;
    document.getElementById('totalMarks').textContent = total + ' / ' + outOf;
    document.getElementById('totalPercent').textContent = percent + '%';
}

// ========== TEXT TO SPEECH ==========
function loadTextToSpeech() {
    let html = `
        <div class="tool-form">
            <h3>🔊 Text to Speech</h3>
            <div class="form-group">
                <label>Enter Text</label>
                <textarea id="speechText" placeholder="Enter text to be spoken..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; resize: vertical; min-height: 150px;"></textarea>
            </div>
            <div class="form-group">
                <label>Speed</label>
                <input type="range" id="speechSpeed" min="0.5" max="2" step="0.1" value="1" style="width: 100%;"> <span id="speedValue">1x</span>
            </div>
            <div class="form-group">
                <label>Pitch</label>
                <input type="range" id="speechPitch" min="0.5" max="2" step="0.1" value="1" style="width: 100%;"> <span id="pitchValue">1</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <button onclick="speakText()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">🔊 Speak</button>
                <button onclick="downloadSpeech()" style="width: 100%; padding: 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">📥 Download MP3</button>
            </div>
            <button onclick="stopSpeech()" style="width: 100%; padding: 12px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">⏹️ Stop</button>
        </div>
    `;
    toolContent.innerHTML = html;
    document.getElementById('speechSpeed').addEventListener('input', (e) => {
        document.getElementById('speedValue').textContent = e.target.value + 'x';
    });
    document.getElementById('speechPitch').addEventListener('input', (e) => {
        document.getElementById('pitchValue').textContent = e.target.value;
    });
}

function speakText() {
    const text = document.getElementById('speechText').value;
    if (!text.trim()) {
        showToast('Please enter some text', 'error');
        return;
    }
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = parseFloat(document.getElementById('speechSpeed').value);
        utterance.pitch = parseFloat(document.getElementById('speechPitch').value);
        speechSynthesis.speak(utterance);
        showToast('🔊 Speaking...', 'success');
    } else {
        showToast('Speech Synthesis not supported in this browser', 'error');
    }
}

function downloadSpeech() {
    const text = document.getElementById('speechText').value;
    if (!text.trim()) {
        showToast('Please enter some text', 'error');
        return;
    }
    const safeText = encodeURIComponent(text.substring(0, 200)); // Google TTS has ~200 char limit
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${safeText}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = 'speech.mp3';
    a.click();
    showToast('Opened MP3 audio stream for download!', 'success');
}

function stopSpeech() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        showToast('Speech stopped', 'info');
    }
}

// ========== PRIME NUMBER CHECKER ==========
function loadPrimeChecker() {
    let html = `
        <div class="tool-form">
            <h3>🔢 Prime Number Checker</h3>
            <div class="form-group">
                <label>Enter Number</label>
                <input type="number" id="primeInput" placeholder="Enter a number" min="2" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <button onclick="checkPrime()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">Check Prime</button>
            <div id="primeResult" style="display: none; background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">Result</div>
                <div id="primeStatus" style="font-size: 2rem; font-weight: bold; color: #667eea;">-</div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function checkPrime() {
    const num = parseInt(document.getElementById('primeInput').value);
    if (isNaN(num) || num < 2) {
        showToast('Please enter a number greater than 1', 'error');
        return;
    }
    
    let isPrime = true;
    if (num === 2) isPrime = true;
    else if (num % 2 === 0) isPrime = false;
    else {
        for (let i = 3; i <= Math.sqrt(num); i += 2) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        }
    }
    
    const status = isPrime ? '✓ Prime' : '✗ Not Prime';
    const color = isPrime ? '#28a745' : '#dc3545';
    document.getElementById('primeResult').style.display = 'block';
    document.getElementById('primeStatus').textContent = status;
    document.getElementById('primeStatus').style.color = color;
    showToast(status, isPrime ? 'success' : 'info');
}

// ========== PALINDROME CHECKER ==========
function loadPalindromeChecker() {
    let html = `
        <div class="tool-form">
            <h3>🔁 Palindrome Checker</h3>
            <div class="form-group">
                <label>Enter Text or Number</label>
                <input type="text" id="palindromeInput" placeholder="e.g., 121 or racecar" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <button onclick="checkPalindrome()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">Check Palindrome</button>
            <div id="palindromeResult" style="display: none; background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">Result</div>
                <div id="palindromeStatus" style="font-size: 2rem; font-weight: bold; color: #667eea;">-</div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function checkPalindrome() {
    const input = document.getElementById('palindromeInput').value.trim();
    if (!input) {
        showToast('Please enter text or number', 'error');
        return;
    }
    
    const cleaned = input.toLowerCase().replace(/[^a-z0-9]/g, '');
    const reversed = cleaned.split('').reverse().join('');
    const isPalindrome = cleaned === reversed;
    
    const status = isPalindrome ? '✓ Palindrome' : '✗ Not Palindrome';
    const color = isPalindrome ? '#28a745' : '#dc3545';
    document.getElementById('palindromeResult').style.display = 'block';
    document.getElementById('palindromeStatus').textContent = status;
    document.getElementById('palindromeStatus').style.color = color;
    showToast(status, isPalindrome ? 'success' : 'info');
}

// ========== FACTORIAL CALCULATOR ==========
function loadFactorialCalculator() {
    let html = `
        <div class="tool-form">
            <h3>📊 Factorial Calculator</h3>
            <div class="form-group">
                <label>Enter Number (n!)</label>
                <input type="number" id="factorialInput" placeholder="e.g., 5" min="0" max="20" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <button onclick="calculateFactorial()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">Calculate Factorial</button>
            <div id="factorialResult" style="display: none; background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">Result</div>
                <div id="factorialValue" style="font-size: 2rem; font-weight: bold; color: #667eea; word-break: break-all;">0</div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function calculateFactorial() {
    const num = parseInt(document.getElementById('factorialInput').value);
    if (isNaN(num) || num < 0) {
        showToast('Please enter a non-negative number', 'error');
        return;
    }
    if (num > 20) {
        showToast('Maximum value is 20', 'error');
        return;
    }
    
    let result = 1;
    for (let i = 2; i <= num; i++) {
        result *= i;
    }
    
    document.getElementById('factorialResult').style.display = 'block';
    document.getElementById('factorialValue').textContent = num + '! = ' + result;
    showToast('✓ Factorial calculated!', 'success');
}

// ========== FIBONACCI GENERATOR ==========
function loadFibonacciGenerator() {
    let html = `
        <div class="tool-form">
            <h3>🔢 Fibonacci Generator</h3>
            <div class="form-group">
                <label>Number of Terms</label>
                <input type="number" id="fibonacciTerms" placeholder="e.g., 5" min="1" max="30" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <button onclick="generateFibonacci()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">Generate Sequence</button>
            <div id="fibonacciResult" style="display: none; background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">Fibonacci Sequence</div>
                <div id="fibonacciSeq" style="font-size: 1.1rem; font-weight: bold; color: #667eea; word-break: break-word; padding: 10px; background: #f5f7fa; border-radius: 4px;">0</div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function generateFibonacci() {
    const terms = parseInt(document.getElementById('fibonacciTerms').value);
    if (isNaN(terms) || terms < 1) {
        showToast('Please enter at least 1 term', 'error');
        return;
    }
    if (terms > 30) {
        showToast('Maximum is 30 terms', 'error');
        return;
    }
    
    const sequence = [];
    let a = 0, b = 1;
    for (let i = 0; i < terms; i++) {
        sequence.push(a);
        [a, b] = [b, a + b];
    }
    
    document.getElementById('fibonacciResult').style.display = 'block';
    document.getElementById('fibonacciSeq').textContent = sequence.join(', ');
    showToast('✓ Sequence generated!', 'success');
}

// ========== WORD COUNTER ==========
function loadWordCounter() {
    let html = `
        <div class="tool-form">
            <h3>🔤 Word Counter</h3>
            <div class="form-group">
                <label>Enter Text</label>
                <textarea id="counterText" placeholder="Paste your text here..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; resize: vertical; min-height: 150px;"></textarea>
            </div>
            <button onclick="countWords()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Count Words</button>
            <div id="counterResult" style="display: none; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="padding: 15px; background: #f5f7fa; border-radius: 6px;">
                        <div style="font-size: 0.85rem; color: #666;">Words</div>
                        <div id="wordCount" style="font-size: 1.5rem; font-weight: bold; color: #667eea; margin-top: 5px;">0</div>
                    </div>
                    <div style="padding: 15px; background: #f5f7fa; border-radius: 6px;">
                        <div style="font-size: 0.85rem; color: #666;">Characters</div>
                        <div id="charCount" style="font-size: 1.5rem; font-weight: bold; color: #28a745; margin-top: 5px;">0</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    document.getElementById('counterText').addEventListener('input', countWords);
}

function countWords() {
    const text = document.getElementById('counterText').value;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const characters = text.length;
    
    if (text.trim().length > 0) {
        document.getElementById('counterResult').style.display = 'block';
        document.getElementById('wordCount').textContent = words;
        document.getElementById('charCount').textContent = characters;
    }
}

// ========== TEXT REVERSER ==========
function loadTextReverser() {
    let html = `
        <div class="tool-form">
            <h3>🔁 Text Reverser</h3>
            <div class="form-group">
                <label>Enter Text</label>
                <input type="text" id="reverseInput" placeholder="e.g., hello" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 15px;">
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">Reversed Text</div>
                <div id="reverseOutput" style="font-size: 1.3rem; font-weight: bold; color: #667eea; padding: 10px; background: #f5f7fa; border-radius: 4px; min-height: 40px; display: flex; align-items: center;">-</div>
                <button onclick="copyReverseText()" style="width: 100%; margin-top: 10px; padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">📋 Copy Reversed</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    document.getElementById('reverseInput').addEventListener('input', reverseText);
}

function reverseText() {
    const input = document.getElementById('reverseInput').value;
    const reversed = input.split('').reverse().join('');
    document.getElementById('reverseOutput').textContent = reversed || '-';
}

function copyReverseText() {
    const text = document.getElementById('reverseOutput').textContent;
    if (text !== '-') {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✓ Copied!', 'success');
        });
    }
}

// ========== CASE CONVERTER ==========
function loadCaseConverter() {
    let html = `
        <div class="tool-form">
            <h3>🔠 Case Converter</h3>
            <div class="form-group">
                <label>Enter Text</label>
                <textarea id="caseInput" placeholder="Enter text..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; resize: vertical; min-height: 100px;"></textarea>
            </div>
            <div class="tool-grid-3">
                <button onclick="convertCase('upper')" style="font-weight: bold;">UPPER</button>
                <button onclick="convertCase('lower')" style="font-weight: bold;">lower</button>
                <button onclick="convertCase('capitalize')" style="font-weight: bold;">Capitalize</button>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">Result</div>
                <textarea id="caseOutput" readonly style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; resize: vertical; min-height: 100px; background: #f5f7fa;"></textarea>
                <button onclick="copyCaseText()" style="width: 100%; margin-top: 10px; padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">📋 Copy Result</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function convertCase(type) {
    const input = document.getElementById('caseInput').value;
    let output = '';
    
    if (type === 'upper') output = input.toUpperCase();
    else if (type === 'lower') output = input.toLowerCase();
    else if (type === 'capitalize') {
        output = input.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    
    document.getElementById('caseOutput').value = output;
    showToast('✓ Converted!', 'success');
}

function copyCaseText() {
    const text = document.getElementById('caseOutput').value;
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✓ Copied!', 'success');
        });
    }
}

// ========== REMOVE DUPLICATE WORDS ==========
function loadRemoveDuplicates() {
    let html = `
        <div class="tool-form">
            <h3>🧹 Remove Duplicate Words</h3>
            <div class="form-group">
                <label>Enter Text</label>
                <textarea id="duplicateInput" placeholder="Enter text with duplicates..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; resize: vertical; min-height: 120px;"></textarea>
            </div>
            <button onclick="removeDuplicates()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Remove Duplicates</button>
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">Cleaned Text</div>
                <textarea id="duplicateOutput" readonly style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; resize: vertical; min-height: 120px; background: #f5f7fa;"></textarea>
                <button onclick="copyDuplicateText()" style="width: 100%; margin-top: 10px; padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">📋 Copy Result</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function removeDuplicates() {
    const input = document.getElementById('duplicateInput').value;
    const words = input.split(/\s+/).filter(w => w);
    const unique = [...new Set(words)];
    const output = unique.join(' ');
    
    document.getElementById('duplicateOutput').value = output;
    showToast('✓ Duplicates removed!', 'success');
}

function copyDuplicateText() {
    const text = document.getElementById('duplicateOutput').value;
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✓ Copied!', 'success');
        });
    }
}

// ========== SETTINGS SYSTEM ==========
// appSettings declared at top level

async function loadSettings() {
    // Wait for sync service
    for (let i = 0; i < 10; i++) {
        if (window.syncService) break;
        await new Promise(r => setTimeout(r, 200));
    }

    let settings = null;
    if (window.syncService) {
        settings = await window.syncService.getData('infinityKitSettings');
    } else {
        const saved = localStorage.getItem('infinityKitSettings');
        if (saved) {
            try { settings = JSON.parse(saved); } catch(e) {}
        }
    }

    if (settings) {
        appSettings = settings;
    }

    if (!Array.isArray(appSettings.favorites)) {
        appSettings.favorites = [];
    }

    if (!Array.isArray(appSettings.recentTools)) {
        appSettings.recentTools = [];
    }
    if (!appSettings.usageStats || typeof appSettings.usageStats !== 'object') {
        appSettings.usageStats = {};
    }

    // Force-clear any legacy or potentially cached 'installed' flags
    localStorage.removeItem('installed');
    localStorage.removeItem('isInstalled');
    sessionStorage.removeItem('installed');

    updateSettingsUI();
    updateFolders(); // Ensure folders are updated after settings load
}

async function saveSettings() {
    await window.syncService.saveData('infinityKitSettings', appSettings);
}

function applySettings() {
    // Apply theme
    document.body.setAttribute('data-theme', appSettings.theme);
    document.body.classList.remove('dark-mode');
    if (appSettings.theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // Apply font size
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add('font-' + appSettings.fontSize);
    
    // Apply card size
    document.body.classList.remove('card-compact', 'card-normal');
    document.body.classList.add('card-' + appSettings.cardSize);
    
    // Apply animation preference
    document.body.classList.remove('no-animations');
    if (!appSettings.animationsEnabled) {
        document.body.classList.add('no-animations');
    }
}

function updateSettingsUI() {
    // Current settings UI only includes App Install section
    // which is handled by updateInstallButtonState() when opening the settings
}

function openSettings() {
    const settingsModal = document.getElementById('settingsModal');
    settingsModal.classList.add('show');
    updateInstallButtonState();
}

function closeSettings() {
    const settingsModal = document.getElementById('settingsModal');
    settingsModal.classList.remove('show');
}

// Close settings when clicking outside
const settingsModal = document.getElementById('settingsModal');
if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
    });
}





function addRecentTool(toolId, toolName) {
    // Remove if already exists
    appSettings.recentTools = appSettings.recentTools.filter(t => t.id !== toolId);
    
    // Add to beginning
    appSettings.recentTools.unshift({ id: toolId, name: toolName, timestamp: Date.now() });
    
    // Keep only last 10
    appSettings.recentTools = appSettings.recentTools.slice(0, 10);
    
    // Update usage stats
    if (!appSettings.usageStats[toolId]) {
        appSettings.usageStats[toolId] = 0;
    }
    appSettings.usageStats[toolId]++;
    
    saveSettings();
}

function clearRecentTools() {
    if (appSettings.recentTools.length === 0) {
        showToast('No recent tools to clear', 'info');
        return;
    }
    if (confirm('Are you sure you want to clear recent tools history?')) {
        appSettings.recentTools = [];
        saveSettings();
        showToast('✓ Recent tools cleared', 'success');
    }
}

function clearUsageStats() {
    if (Object.keys(appSettings.usageStats).length === 0) {
        showToast('No usage stats to clear', 'info');
        return;
    }
    if (confirm('Are you sure you want to reset usage statistics?')) {
        appSettings.usageStats = {};
        saveSettings();
        showToast('✓ Usage stats reset', 'success');
    }
}

function resetAllSettings() {
    if (confirm('⚠️ This will reset ALL settings, preferences, and data. Are you sure?')) {
        if (confirm('Really reset everything? This cannot be undone.')) {
            appSettings = {
                theme: 'light',
                fontSize: 'medium',
                cardSize: 'normal',
                animationsEnabled: true,
                favorites: [],
                recentTools: [],
                usageStats: {}
            };
            localStorage.removeItem('infinityKitSettings');
            saveSettings();
            loadSettings();
            applySettings();
            updateFolders();
            renderFolders();
            showToast('✓ All settings reset to default', 'success');
        }
    }
}

// ========== SMART FEATURES SYSTEM ==========


// Inject Global Footer to all pages
function injectGlobalFooter() {
    // Only inject if it's not the main index page (which has its own footer)
    const isIndex = !window.location.pathname.includes('folder/') && !window.location.pathname.includes('tools/') && !window.location.pathname.includes('survey/');
    
    if (isIndex && document.querySelector('body > .footer')) return;

    let footer = document.querySelector('.footer');
    const prefix = PathManager.getPrefix();
    const currentYear = new Date().getFullYear();

    const footerHTML = `
        <div class="footer-links">
            <a href="${prefix}index.html#about-page">About</a>
            <a href="${prefix}index.html#privacy-page">Privacy Policy</a>
            <a href="${prefix}index.html#terms-page">Terms & Conditions</a>
            <a href="${prefix}index.html#contact-page">Contact</a>
            <a href="${prefix}index.html#disclaimer-page">Disclaimer</a>
        </div>

        <div class="footer-bottom">
            <p class="footer-brand">Made for everyday tools ⚡</p>
            <p class="footer-tagline">Built to simplify your digital life ⚡</p>
            <p id="copyrightText" class="copyright-text">© ${currentYear} Infinity Kit. All rights reserved.</p>
        </div>
    `;

    if (footer) {
        footer.innerHTML = footerHTML;
    } else {
        footer = document.createElement('footer');
        footer.className = 'footer';
        footer.innerHTML = footerHTML;
        document.body.appendChild(footer);
    }
}


// Get most used tools (for dashboard/stats)
function getMostUsedTools(limit = 5) {
    const toolsWithUsage = Object.entries(appSettings.usageStats || {})
        .map(([toolId, count]) => ({
            toolId,
            count,
            tool: tools.find(t => t.id === toolId)
        }))
        .filter(item => item.tool)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    
    return toolsWithUsage;
}

// Enhanced search with live results
function performSearch(query) {
    if (!query || query.trim() === '') {
        searchResults.style.display = 'none';
        return;
    }
    
    const q = query.toLowerCase();
    const results = [];
    
    // Search in tool names and descriptions
    tools.forEach(tool => {
        if (tool.name.toLowerCase().includes(q) || 
            (tool.description && tool.description.toLowerCase().includes(q))) {
            results.push({ type: 'tool', item: tool });
        }
    });
    
    // Search in folder names
    folders.forEach(folder => {
        if (folder.name.toLowerCase().includes(q)) {
            results.push({ type: 'folder', item: folder });
        }
    });
    
    displaySearchResults(results, q);
}

function displaySearchResults(results, query) {
    searchResultsList.innerHTML = '';
    
    if (results.length === 0) {
        noResults.style.display = 'block';
        searchResultsList.style.display = 'none';
        searchResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    searchResultsList.style.display = 'block';
    searchResults.style.display = 'block';
    
    results.forEach(result => {
        const item = result.item;
        const icon = result.type === 'tool' ? (item.icon || '🛠️') : (item.emoji || '📁');
        const category = result.type === 'tool' ? 'Utility Tool' : 'Category Folder';
        
        const itemEl = document.createElement(result.type === 'tool' ? 'a' : 'div');
        itemEl.className = 'search-result-item';
        if (result.type === 'tool') itemEl.href = PathManager.getToolPath(item.id);
        
        itemEl.innerHTML = `
            <div class="result-icon">${icon}</div>
            <div class="result-info">
                <div class="result-name">${item.name}</div>
                <div class="result-category">${category}</div>
            </div>
        `;
        
        itemEl.onclick = () => {
            if (result.type === 'folder') {
                openFolder(item);
                searchResults.style.display = 'none';
            }
            addToRecentSearches(item.name);
        };
        
        searchResultsList.appendChild(itemEl);
    });
}

// Enhanced openTool to track usage
function trackToolUsage(toolId) {
    if (!appSettings.usageStats) {
        appSettings.usageStats = {};
    }
    
    if (!appSettings.usageStats[toolId]) {
        appSettings.usageStats[toolId] = 0;
    }
    appSettings.usageStats[toolId]++;
    
    saveSettings();
}

// ========== ROTATE PDF ==========
// ========== ROTATE PDF ==========
function loadRotatePDF() {
    console.log('[PDF] Loading Rotate PDF tool');
    pdfState.rotateFile = null;
    
    let html = `
        <div class="tool-form">
            <div class="pdf-upload-area" id="rotateUploadArea" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleRotateDrop(event)">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🔄</div>
                    <div class="pdf-upload-text">
                        <h3>Rotate PDF</h3>
                        <p>Drag & drop or click to select a PDF to rotate</p>
                    </div>
                </div>
                <input type="file" id="rotateFileInput" accept=".pdf" style="display: none;">
            </div>
            
            <div id="rotateFileInfo" class="file-preview-container" style="display: none; margin-bottom: 20px;"></div>
            
            <div class="tool-settings glass-panel" id="rotateSettings" style="display: none; padding: 20px;">
                <div class="form-group">
                    <label>Page Selection:</label>
                    <select id="pageSelection" class="glass-input">
                        <option value="all">All Pages</option>
                        <option value="odd">Odd Pages Only</option>
                        <option value="even">Even Pages Only</option>
                    </select>
                </div>
                
                <div class="rotation-group">
                    <button class="rotation-btn" onclick="performRotatePDF(90)">↷ 90° Right</button>
                    <button class="rotation-btn" onclick="performRotatePDF(270)">↶ 90° Left</button>
                    <button class="rotation-btn" onclick="performRotatePDF(180)">↻ 180°</button>
                </div>
                
                <div id="rotateBtnPlaceholder" style="margin-top: 15px;">
                    <button id="rotateSubmitBtn" class="pdf-btn" style="display: none;">Processing...</button>
                </div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
    
    const fileInput = document.getElementById('rotateFileInput');
    const uploadArea = document.getElementById('rotateUploadArea');
    
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleRotateFile(e.target.files[0]);
}

function handleRotateDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-active');
    handleRotateFile(e.dataTransfer.files[0]);
}

function handleRotateFile(file) {
    if (!file || file.type !== 'application/pdf') {
        showToast('Please select a valid PDF file', 'error');
        return;
    }
    
    pdfState.rotateFile = file;
    console.log(`[PDF] Selected file for rotation: ${file.name}`);
    
    const info = document.getElementById('rotateFileInfo');
    info.style.display = 'block';
    info.innerHTML = `
        <div class="file-item">
            <div class="file-icon">📄</div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
        </div>
    `;
    
    document.getElementById('rotateSettings').style.display = 'block';
}

async function performRotatePDF(angle) {
    if (!pdfState.rotateFile) return;
    
    const pageSelection = document.getElementById('pageSelection').value;
    const info = document.getElementById('rotateFileInfo');
    
    // We don't have a single submit button to load, so we use a toast and progress
    updateProgress('Loading PDF...', 10);
    
    try {
        if (!window.PDFLib) {
            throw new Error('PDF library not loaded');
        }
        
        const arrayBuffer = await pdfState.rotateFile.arrayBuffer();
        const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        let rotatedCount = 0;
        
        updateProgress('Rotating pages...', 40);
        
        pages.forEach((page, i) => {
            let shouldRotate = false;
            if (pageSelection === 'all') shouldRotate = true;
            else if (pageSelection === 'odd' && (i + 1) % 2 === 1) shouldRotate = true;
            else if (pageSelection === 'even' && (i + 1) % 2 === 0) shouldRotate = true;
            
            if (shouldRotate) {
                const currentRotation = page.getRotation().angle;
                page.setRotation(window.PDFLib.degrees(currentRotation + angle));
                rotatedCount++;
            }
        });
        
        updateProgress('Saving rotated PDF...', 80);
        const rotatedBytes = await pdfDoc.save();
        downloadFile(rotatedBytes, `rotated-${pdfState.rotateFile.name}`);
        showToast(`✓ Successfully rotated ${rotatedCount} pages!`, 'success');
    } catch (error) {
        console.error('[PDF] Rotation error:', error);
        showToast('Error rotating PDF: ' + error.message, 'error');
    } finally {
        setTimeout(removeProgress, 2000);
    }
}

// ==================== NEW TOOLS - DATA TOOLS ====================
function loadGraphMaker() {
    let html = `
        <div class="tool-form">
            <h3>📊 Graph Maker</h3>
            <div class="form-group">
                <label>Enter numbers (comma-separated)</label>
                <input type="text" id="graphInput" placeholder="e.g., 10,20,30,40,50" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <button onclick="generateGraph()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Generate Graph</button>
            <div class="canvas-container">
                <canvas id="graphCanvas" class="responsive-canvas"></canvas>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function generateGraph() {
    const input = document.getElementById('graphInput').value;
    const numbers = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    
    if (numbers.length === 0) {
        showToast('⚠️ Please enter valid numbers', 'error');
        return;
    }
    
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    const containerWidth = canvas.parentElement.clientWidth;
    canvas.width = containerWidth || 400;
    canvas.height = 300;
    
    const maxNum = Math.max(...numbers);
    const barWidth = canvas.width / numbers.length;
    const scale = (canvas.height - 40) / maxNum;
    
    ctx.fillStyle = '#f5f7fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    numbers.forEach((num, i) => {
        const barHeight = num * scale;
        const x = i * barWidth + 10;
        const y = canvas.height - barHeight - 30;
        
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x, y, barWidth - 20, barHeight);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(num, x + barWidth/2 - 10, canvas.height - 10);
    });
    
    showToast('✓ Graph generated!', 'success');
}

function loadAverageCalculator() {
    let html = `
        <div class="tool-form">
            <h3>📉 Average Calculator</h3>
            <div class="form-group">
                <label>Enter numbers (comma-separated)</label>
                <input type="text" id="avgInput" placeholder="e.g., 10,20,30,40,50" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <button onclick="calculateAverage()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Calculate</button>
            <div class="tool-grid-2">
                <div style="padding: 15px; background: white; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="color: #666; margin-bottom: 5px;">Average</div>
                    <div id="avgResult" style="font-size: 1.5rem; font-weight: bold; color: #667eea;">-</div>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="color: #666; margin-bottom: 5px;">Sum</div>
                    <div id="sumResult" style="font-size: 1.5rem; font-weight: bold; color: #764ba2;">-</div>
                </div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function calculateAverage() {
    const input = document.getElementById('avgInput').value;
    const numbers = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    
    if (numbers.length === 0) {
        showToast('⚠️ Please enter valid numbers', 'error');
        return;
    }
    
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    
    document.getElementById('avgResult').textContent = avg.toFixed(2);
    document.getElementById('sumResult').textContent = sum.toFixed(2);
    showToast('✓ Calculated!', 'success');
}

function loadNumberSorter() {
    let html = `
        <div class="tool-form">
            <h3>🔢 Number Sorter</h3>
            <div class="form-group">
                <label>Enter numbers (comma-separated)</label>
                <input type="text" id="sortInput" placeholder="e.g., 50,10,30,20,40" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <button onclick="sortAscending()" style="padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Sort Ascending ⬆️</button>
                <button onclick="sortDescending()" style="padding: 12px; background: #764ba2; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Sort Descending ⬇️</button>
            </div>
            <div style="padding: 15px; background: white; border-radius: 8px;">
                <div style="color: #666; margin-bottom: 8px;">Result</div>
                <div id="sortResult" style="font-size: 1.1rem; font-weight: bold; color: #667eea;">-</div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function sortAscending() {
    const input = document.getElementById('sortInput').value;
    const numbers = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    numbers.sort((a, b) => a - b);
    document.getElementById('sortResult').textContent = numbers.join(', ');
    showToast('✓ Sorted ascending!', 'success');
}

function sortDescending() {
    const input = document.getElementById('sortInput').value;
    const numbers = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    numbers.sort((a, b) => b - a);
    document.getElementById('sortResult').textContent = numbers.join(', ');
    showToast('✓ Sorted descending!', 'success');
}

function loadCSVViewer() {
    let html = `
        <div class="tool-form">
            <h3>📋 CSV Viewer</h3>
            <div class="form-group">
                <label>Paste CSV or select file</label>
                <textarea id="csvInput" placeholder="Paste CSV data or upload..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; resize: vertical; min-height: 100px;"></textarea>
            </div>
            <input type="file" id="csvFile" accept=".csv" style="width: 100%; margin-bottom: 10px;">
            <button onclick="viewCSV()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">View as Table</button>
            <div id="csvTable" class="table-container"></div>
        </div>
    `;
    toolContent.innerHTML = html;
    document.getElementById('csvFile').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('csvInput').value = ev.target.result;
        };
        reader.readAsText(e.target.files[0]);
    };
}

function viewCSV() {
    const csv = document.getElementById('csvInput').value;
    const rows = csv.split('\\n').filter(r => r.trim());
    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse;';
    
    rows.forEach((row, i) => {
        const tr = document.createElement('tr');
        const cells = row.split(',');
        cells.forEach(cell => {
            const tag = i === 0 ? 'th' : 'td';
            const td = document.createElement(tag);
            td.textContent = cell.trim();
            td.style.cssText = 'padding: 12px; border: 1px solid #ddd; text-align: left;' + (i === 0 ? 'background: #667eea; color: white; font-weight: bold;' : '');
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
    
    document.getElementById('csvTable').innerHTML = '';
    document.getElementById('csvTable').appendChild(table);
    showToast('✓ CSV loaded!', 'success');
}

// ==================== NEW TOOLS - SEARCH TOOLS ====================
// ==================== NEW TOOLS - FORMAT TOOLS ====================
// ==================== NEW TOOLS - MATH TOOLS ====================
function loadLCMHCF() {
    let html = `
        <div class="tool-form">
            <h3>📐 LCM / HCF Calculator</h3>
            <div class="tool-grid-2">
                <div class="form-group">
                    <label>Number 1</label>
                    <input type="number" id="lcmNum1" placeholder="Value">
                </div>
                <div class="form-group">
                    <label>Number 2</label>
                    <input type="number" id="lcmNum2" placeholder="Value">
                </div>
            </div>
            <button onclick="calculateLCMHCF()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Calculate</button>
            <div class="tool-grid-2">
                <div style="padding: 15px; background: white; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="color: #666; margin-bottom: 5px;">LCM</div>
                    <div id="lcmResult" style="font-size: 1.4rem; font-weight: bold; color: #667eea;">-</div>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="color: #666; margin-bottom: 5px;">HCF (GCD)</div>
                    <div id="hcfResult" style="font-size: 1.4rem; font-weight: bold; color: #764ba2;">-</div>
                </div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function calculateLCMHCF() {
    const a = parseInt(document.getElementById('lcmNum1').value);
    const b = parseInt(document.getElementById('lcmNum2').value);
    
    if (isNaN(a) || isNaN(b)) {
        showToast('⚠️ Enter valid numbers', 'error');
        return;
    }
    
    const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
    const lcm = (x, y) => (x * y) / gcd(x, y);
    
    document.getElementById('hcfResult').textContent = gcd(a, b);
    document.getElementById('lcmResult').textContent = lcm(a, b);
    showToast('✓ Calculated!', 'success');
}

function loadTriangleChecker() {
    let html = `
        <div class="tool-form">
            <h3>🔺 Triangle Type Checker</h3>
            <div class="tool-grid-3">
                <div class="form-group">
                    <label>Side A</label>
                    <input type="number" id="triangleA" placeholder="A">
                </div>
                <div class="form-group">
                    <label>Side B</label>
                    <input type="number" id="triangleB" placeholder="B">
                </div>
                <div class="form-group">
                    <label>Side C</label>
                    <input type="number" id="triangleC" placeholder="C">
                </div>
            </div>
            <button onclick="checkTriangleType()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Check Type</button>
            <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
                <div id="triangleResult" style="font-size: 1.2rem; font-weight: bold; color: #667eea;">-</div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function checkTriangleType() {
    const a = parseFloat(document.getElementById('triangleA').value);
    const b = parseFloat(document.getElementById('triangleB').value);
    const c = parseFloat(document.getElementById('triangleC').value);
    
    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        showToast('⚠️ Enter valid sides', 'error');
        return;
    }
    
    if (a + b <= c || b + c <= a || c + a <= b) {
        document.getElementById('triangleResult').textContent = '❌ Not a valid triangle';
        return;
    }
    
    let type = '';
    if (a === b && b === c) type = '🟣 Equilateral (all sides equal)';
    else if (a === b || b === c || c === a) type = '🟠 Isosceles (two sides equal)';
    else type = '🟡 Scalene (all sides different)';
    
    document.getElementById('triangleResult').textContent = type;
    showToast('✓ Checked!', 'success');
}

function loadDistanceCalculator() {
    let html = `
        <div class="tool-form">
            <h3>📏 Distance Calculator</h3>
            <div class="tool-grid-2">
                <div>
                    <div style="margin-bottom: 8px; font-weight: bold;">Point 1 (x1, y1)</div>
                    <input type="number" id="dist_x1" placeholder="x1" style="margin-bottom: 8px;">
                    <input type="number" id="dist_y1" placeholder="y1">
                </div>
                <div>
                    <div style="margin-bottom: 8px; font-weight: bold;">Point 2 (x2, y2)</div>
                    <input type="number" id="dist_x2" placeholder="x2" style="margin-bottom: 8px;">
                    <input type="number" id="dist_y2" placeholder="y2">
                </div>
            </div>
            <button onclick="calculateDistance()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Calculate Distance</button>
            <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
                <div style="color: #666; margin-bottom: 5px;">Distance</div>
                <div id="distanceResult" style="font-size: 1.5rem; font-weight: bold; color: #667eea;">-</div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function calculateDistance() {
    const x1 = parseFloat(document.getElementById('dist_x1').value);
    const y1 = parseFloat(document.getElementById('dist_y1').value);
    const x2 = parseFloat(document.getElementById('dist_x2').value);
    const y2 = parseFloat(document.getElementById('dist_y2').value);
    
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        showToast('⚠️ Enter valid coordinates', 'error');
        return;
    }
    
    const distance = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    document.getElementById('distanceResult').textContent = distance.toFixed(2);
    showToast('✓ Calculated!', 'success');
}

function loadEquationSolver() {
    let html = `
        <div class="tool-form">
            <h3>🧮 Equation Solver (ax + b = 0)</h3>
            <div class="tool-grid-2">
                <div class="form-group">
                    <label>Coeff a</label>
                    <input type="number" id="equationA" placeholder="a">
                </div>
                <div class="form-group">
                    <label>Coeff b</label>
                    <input type="number" id="equationB" placeholder="b">
                </div>
            </div>
            <button onclick="solveEquation()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Solve</button>
            <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
                <div style="color: #666; margin-bottom: 5px;">Solution (x)</div>
                <div id="equationResult" style="font-size: 1.5rem; font-weight: bold; color: #667eea;">-</div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function solveEquation() {
    const a = parseFloat(document.getElementById('equationA').value);
    const b = parseFloat(document.getElementById('equationB').value);
    
    if (isNaN(a) || isNaN(b)) {
        showToast('⚠️ Enter valid numbers', 'error');
        return;
    }
    
    if (a === 0) {
        document.getElementById('equationResult').textContent = b === 0 ? 'Infinite solutions' : 'No solution';
        return;
    }
    
    const x = -b / a;
    document.getElementById('equationResult').textContent = x.toFixed(2);
    showToast('✓ Solved!', 'success');
}

// ==================== NEW TOOLS - DECISION TOOLS ====================
function loadSpinWheel() {
    let html = `
        <div class="tool-form">
            <h3>🎡 Spin Wheel</h3>
            <div class="form-group">
                <label>Enter options (comma-separated)</label>
                <input type="text" id="wheelOptions" placeholder="e.g., Option1, Option2, Option3" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; margin-bottom: 10px;">
            </div>
            <button onclick="prepareWheel()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Prepare Wheel</button>
            <div class="canvas-container" style="margin: 15px 0;">
                <canvas id="wheelCanvas" class="responsive-canvas"></canvas>
            </div>
            <button onclick="spinTheWheel()" id="spinBtn" style="width: 100%; padding: 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">🎡 SPIN!</button>
            <div id="wheelResult" style="text-align: center; font-size: 1.2rem; font-weight: bold; color: #667eea;"></div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function prepareWheel() {
    const input = document.getElementById('wheelOptions').value;
    const options = input.split(',').map(o => o.trim()).filter(o => o);
    window.wheelOptions = options;
    window.wheelRotation = 0;
    drawWheel();
    showToast('✓ Wheel ready to spin!', 'success');
}

function drawWheel() {
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set internal resolution based on parent container width
    const parentWidth = canvas.parentElement.clientWidth;
    const size = Math.min(parentWidth - 20, 400);
    canvas.width = size;
    canvas.height = size;
    
    const radius = size / 2 - 5;
    const options = window.wheelOptions;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(window.wheelRotation);
    
    const sliceAngle = (Math.PI * 2) / options.length;
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30b0ff'];
    
    options.forEach((option, i) => {
        ctx.beginPath();
        ctx.arc(0, 0, radius, i * sliceAngle, (i + 1) * sliceAngle);
        ctx.lineTo(0, 0);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        
        ctx.save();
        ctx.rotate(i * sliceAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(option, radius - 30, 0);
        ctx.restore();
    });
    ctx.restore();
    
    // Draw the pointer
    ctx.fillStyle = '#ff4757';
    const centerX = size / 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 12, 10);
    ctx.lineTo(centerX + 12, 10);
    ctx.lineTo(centerX, 35);
    ctx.fill();
}

function spinTheWheel() {
    if (window.wheelOptions.length === 0) {
        showToast('⚠️ Prepare wheel first!', 'error');
        return;
    }
    
    document.getElementById('spinBtn').disabled = true;
    const spins = Math.floor(Math.random() * 5) + 5;
    const totalRotation = spins * Math.PI * 2 + Math.random() * Math.PI * 2;
    window.wheelRotation = totalRotation;
    
    const segmentAngle = Math.PI * 2 / window.wheelOptions.length;
    const selectedIndex = Math.floor((totalRotation % (Math.PI * 2)) / segmentAngle) % window.wheelOptions.length;
    
    drawWheel();
    setTimeout(() => {
        document.getElementById('wheelResult').textContent = '🎯 Selected: ' + window.wheelOptions[selectedIndex];
        document.getElementById('spinBtn').disabled = false;
        showToast('✓ Result selected!', 'success');
    }, 500);
}

function loadYesNoGenerator() {
    let html = `
        <div class="tool-form">
            <h3>🤔 Yes / No Generator</h3>
            <div class="form-group">
                <label>Ask a question</label>
                <input type="text" id="yesnoQuestion" placeholder="Ask your question..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <button onclick="generateYesNo()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 20px;">Get Answer</button>
            <div style="padding: 30px; background: white; border-radius: 8px; text-align: center;">
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">Magic Ball Says...</div>
                <div id="yesnoResult" style="font-size: 2rem; font-weight: bold; color: #667eea; min-height: 40px;"></div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function generateYesNo() {
    const responses = ['Yes ✓', 'No ✗', 'Maybe 🤷', 'Absolutely!', 'Definitely not', 'Ask again later', 'Signs point to yes', 'Don\'t count on it'];
    const answer = responses[Math.floor(Math.random() * responses.length)];
    document.getElementById('yesnoResult').textContent = answer;
    showToast('✓ Magic ball answered!', 'success');
}

function loadChoiceComparator() {
    let html = `
        <div class="tool-form">
            <h3>📊 Choice Comparator</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div class="form-group">
                    <label>Choice A - Pros (one per line)</label>
                    <textarea id="choiceAPros" placeholder="Pro 1&#10;Pro 2&#10;Pro 3..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; resize: vertical; min-height: 100px;"></textarea>
                </div>
                <div class="form-group">
                    <label>Choice A - Cons</label>
                    <textarea id="choiceACons" placeholder="Con 1&#10;Con 2&#10;Con 3..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; resize: vertical; min-height: 100px;"></textarea>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div class="form-group">
                    <label>Choice B - Pros</label>
                    <textarea id="choiceBPros" placeholder="Pro 1&#10;Pro 2&#10;Pro 3..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; resize: vertical; min-height: 100px;"></textarea>
                </div>
                <div class="form-group">
                    <label>Choice B - Cons</label>
                    <textarea id="choiceBCons" placeholder="Con 1&#10;Con 2&#10;Con 3..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; resize: vertical; min-height: 100px;"></textarea>
                </div>
            </div>
            <button onclick="compareChoices()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Compare</button>
            <div id="comparisonResult" style="padding: 15px; background: white; border-radius: 8px;"></div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function compareChoices() {
    const aProCount = document.getElementById('choiceAPros').value.split('\\n').filter(l => l.trim()).length;
    const aConCount = document.getElementById('choiceACons').value.split('\\n').filter(l => l.trim()).length;
    const bProCount = document.getElementById('choiceBPros').value.split('\\n').filter(l => l.trim()).length;
    const bConCount = document.getElementById('choiceBCons').value.split('\\n').filter(l => l.trim()).length;
    
    const aScore = aProCount - (aConCount * 0.7);
    const bScore = bProCount - (bConCount * 0.7);
    
    let result = `<div style="text-align: center;">
        <div style="margin-bottom: 20px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Choice A Score</div>
            <div style="font-size: 1.5rem; color: #667eea; font-weight: bold;">${aScore.toFixed(1)}</div>
        </div>
        <div>
            <div style="font-weight: bold; margin-bottom: 5px;">Choice B Score</div>
            <div style="font-size: 1.5rem; color: #764ba2; font-weight: bold;">${bScore.toFixed(1)}</div>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f5f7fa; border-radius: 6px;">
            <div style="font-weight: bold;">Recommendation</div>
            <div style="font-size: 1.2rem; margin-top: 8px;">${aScore > bScore ? '✓ Choice A looks better!' : bScore > aScore ? '✓ Choice B looks better!' : '⚖️ Both are equally good!'}</div>
        </div>
    </div>`;
    
    document.getElementById('comparisonResult').innerHTML = result;
    showToast('✓ Comparison complete!', 'success');
}

// ==================== NEW TOOLS - PLANNER TOOLS ====================
function loadCalendarViewer() {
    let html = `
        <div class="tool-form">
            <h3>📅 Calendar Viewer</h3>
            <div class="form-group tool-controls-grid">
                <select id="calendarMonth" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    ${Array(12).fill().map((_, i) => `<option value="${i}">${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</option>`).join('')}
                </select>
                <select id="calendarYear" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    ${Array(5).fill().map((_, i) => {const y = new Date().getFullYear() - 2 + i; return `<option value="${y}" ${y === new Date().getFullYear() ? 'selected' : ''}>${y}</option>`}).join('')}
                </select>
            </div>
            <button onclick="showCalendar()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Show Calendar</button>
            <div id="calendarDisplay" style="background: white; padding: 20px; border-radius: 8px;"></div>
        </div>
    `;
    toolContent.innerHTML = html;
    showCalendar();
}

function showCalendar() {
    const month = parseInt(document.getElementById('calendarMonth').value);
    const year = parseInt(document.getElementById('calendarYear').value);
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let calendar = `<div style="text-align: center; margin-bottom: 15px; font-weight: bold; font-size: 1.1rem;">${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month]} ${year}</div>`;
    calendar += '<div class="calendar-grid">';
    
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        calendar += `<div class="weekday-header">${day}</div>`;
    });
    
    for (let i = 0; i < firstDay; i++) {
        calendar += '<div></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
        calendar += `<div class="${isToday ? 'today' : ''}">${day}</div>`;
    }
    
    calendar += '</div>';
    document.getElementById('calendarDisplay').innerHTML = calendar;
}

function loadDailyPlanner() {
    let html = `
        <div class="tool-form">
            <h3>📝 Daily Planner</h3>
            <div class="form-group" style="display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-bottom: 15px;">
                <input type="text" id="plannerTask" placeholder="Add a task..." style="padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                <button onclick="addPlannerTask()" style="padding: 12px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; white-space: nowrap;">Add Task</button>
            </div>
            <div id="plannerTasks" style="display: grid; gap: 10px;"></div>
        </div>
    `;
    toolContent.innerHTML = html;
    window.plannerTasks = [];
    renderPlannerTasks();
}

function addPlannerTask() {
    const task = document.getElementById('plannerTask').value.trim();
    if (!task) return;
    
    window.plannerTasks.unshift({id: Date.now(), text: task, done: false});
    document.getElementById('plannerTask').value = '';
    renderPlannerTasks();
    showToast('✓ Task added!', 'success');
}

function renderPlannerTasks() {
    const container = document.getElementById('plannerTasks');
    container.innerHTML = window.plannerTasks.map(task => `
        <div style="padding: 12px; background: ${task.done ? '#d4edda' : '#f5f7fa'}; border-left: 4px solid ${task.done ? '#28a745' : '#667eea'}; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${task.id})" style="margin-right: 10px;">
                <span style="text-decoration: ${task.done ? 'line-through' : 'none'}; color: ${task.done ? '#999' : '#333'};">${task.text}</span>
            </div>
            <button onclick="deletePlannerTask(${task.id})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Delete</button>
        </div>
    `).join('');
}

function toggleTask(id) {
    window.plannerTasks.find(t => t.id === id).done = !window.plannerTasks.find(t => t.id === id).done;
    renderPlannerTasks();
}

function deletePlannerTask(id) {
    window.plannerTasks = window.plannerTasks.filter(t => t.id !== id);
    renderPlannerTasks();
    showToast('✓ Task deleted!', 'success');
}

function loadReminderAlert() {
    let html = `
        <div class="tool-form">
            <div id="notifIndicator" class="notif-status"></div>
            
            <h3>⏰ Reminder Alert</h3>
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="reminderText" placeholder="What to remind you about..." style="width: 100%; padding: 12px; border: 1px solid var(--glass-border); border-radius: 6px; font-size: 1rem; margin-bottom: 10px; background: var(--glass-bg); color: var(--text-color);">
            </div>
            <div class="form-group">
                <label>Schedule for:</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <input type="date" id="reminderDate" style="padding: 12px; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass-bg); color: var(--text-color);">
                    <input type="time" id="reminderTimeExact" style="padding: 12px; border: 1px solid var(--glass-border); border-radius: 6px; background: var(--glass-bg); color: var(--text-color);">
                </div>
            </div>
            <button onclick="setReminder()" style="width: 100%; padding: 12px; background: var(--primary-gradient); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px; margin-top: 10px;">Set Reminder 🔔</button>
            <div id="activeRemindersList" class="active-reminders-container"></div>
        </div>
    `;
    toolContent.innerHTML = html;
    
    // Set default date to today
    const tomorrow = new Date();
    document.getElementById('reminderDate').value = tomorrow.toISOString().split('T')[0];
    
    if (window.NotificationManager) {
        window.NotificationManager.updateUIStatus();
        window.NotificationManager.updateActiveLists();
    }
}

function setReminder() {
    const text = document.getElementById('reminderText').value;
    const date = document.getElementById('reminderDate').value;
    const time = document.getElementById('reminderTimeExact').value;
    
    if (!text || !date || !time) {
        showToast('⚠️ Fill all fields', 'error');
        return;
    }
    
    if (window.NotificationManager) {
        window.NotificationManager.scheduleExact(text, 'Scheduled Reminder', date, time, 'reminder');
    }
}

// ==================== NEW TOOLS - WEB TOOLS ====================
function loadURLEncoder() {
    let html = `
        <div class="tool-form">
            <h3>🔗 URL Encoder / Decoder</h3>
            <div class="form-group">
                <label>Enter text or URL</label>
                <textarea id="urlInput" placeholder="Enter text to encode or encoded URL to decode..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; resize: vertical; min-height: 100px;"></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <button onclick="encodeURL()" style="padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Encode 🔒</button>
                <button onclick="decodeURL()" style="padding: 12px; background: #764ba2; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Decode 🔓</button>
            </div>
            <div style="padding: 15px; background: white; border-radius: 8px;">
                <textarea id="urlOutput" readonly style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; font-family: monospace; resize: vertical; min-height: 100px; background: #f5f7fa;"></textarea>
                <button onclick="copyURLResult()" style="width: 100%; margin-top: 10px; padding: 10px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">📋 Copy Result</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function encodeURL() {
    const input = document.getElementById('urlInput').value;
    const encoded = encodeURIComponent(input);
    document.getElementById('urlOutput').value = encoded;
    showToast('✓ Encoded!', 'success');
}

function decodeURL() {
    const input = document.getElementById('urlInput').value;
    try {
        const decoded = decodeURIComponent(input);
        document.getElementById('urlOutput').value = decoded;
        showToast('✓ Decoded!', 'success');
    } catch (e) {
        showToast('⚠️ Invalid encoded text', 'error');
    }
}

function copyURLResult() {
    const text = document.getElementById('urlOutput').value;
    navigator.clipboard.writeText(text).then(() => showToast('✓ Copied!', 'success'));
}

function loadURLExtractor() {
    let html = `
        <div class="tool-form">
            <h3>🌍 URL Parameter Extractor</h3>
            <div class="form-group">
                <label>Paste URL</label>
                <textarea id="urlToParse" placeholder="e.g., https://example.com?name=John&age=30" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; resize: vertical; min-height: 100px;"></textarea>
            </div>
            <button onclick="extractURLParams()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Extract Parameters</button>
            <div id="paramsResult" style="padding: 15px; background: white; border-radius: 8px; white-space: pre-wrap; word-break: break-all; font-family: monospace; font-size: 0.9rem;"></div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function extractURLParams() {
    const url = document.getElementById('urlToParse').value;
    try {
        const urlObj = new URL(url);
        const params = Object.fromEntries(urlObj.searchParams);
        let result = 'Parameters:\\n\\n';
        Object.entries(params).forEach(([key, value]) => {
            result += `${key}: ${value}\\n`;
        });
        document.getElementById('paramsResult').textContent = result || 'No parameters found';
        showToast('✓ Parameters extracted!', 'success');
    } catch (e) {
        showToast('⚠️ Invalid URL', 'error');
    }
}

function loadMetaTagViewer() {
    let html = `
        <div class="tool-form">
            <h3>📄 Meta Tag Viewer</h3>
            <div class="form-group">
                <label>Paste URL or HTML</label>
                <textarea id="metaInput" placeholder="Paste HTML source or URL..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; resize: vertical; min-height: 120px;"></textarea>
            </div>
            <button onclick="extractMetaTags()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Extract Meta Tags</button>
            <div id="metaResult" style="padding: 15px; background: white; border-radius: 8px;"></div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function extractMetaTags() {
    const input = document.getElementById('metaInput').value;
    const regexes = {
        'Title': /<title>([^<]*)<\/title>/i,
        'Description': /<meta\\s+name="description"\\s+content="([^"]*)">/i,
        'Keywords': /<meta\\s+name="keywords"\\s+content="([^"]*)">/i,
        'Author': /<meta\\s+name="author"\\s+content="([^"]*)">/i,
        'Viewport': /<meta\\s+name="viewport"\\s+content="([^"]*)">/i
    };
    
    let result = '<div>';
    Object.entries(regexes).forEach(([name, regex]) => {
        const match = input.match(regex);
        const value = match ? match[1] : 'Not found';
        result += `<div style="margin-bottom: 12px; padding: 12px; background: #f5f7fa; border-radius: 6px;">
            <div style="font-weight: bold; color: #667eea; margin-bottom: 4px;">${name}</div>
            <div style="color: #666; word-break: break-all;">${value}</div>
        </div>`;
    });
    result += '</div>';
    
    document.getElementById('metaResult').innerHTML = result;
    showToast('✓ Meta tags extracted!', 'success');
}

// ==================== UTILITY FUNCTIONS ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// Hamburger Menu Logic
function toggleMenu(forceState) {
    const navRight = document.getElementById('navRight');
    if (!navRight) return;
    if (typeof forceState === 'boolean') {
        if (forceState) navRight.classList.add('show');
        else navRight.classList.remove('show');
    } else {
        navRight.classList.toggle('show');
    }
}
function closeMenu() {
    toggleMenu(false);
}
// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const navRight = document.getElementById('navRight');
    const menuBtn = document.getElementById('menuBtn');
    if (navRight && navRight.classList.contains('show')) {
        if (!navRight.contains(e.target) && !menuBtn.contains(e.target)) {
            closeMenu();
        }
    }
});

// ========== GRAPH MAKER ==========
let currentChart = null;

function loadGraphMaker() {
    let html = `
        <div class="tool-form">
            <h3>📊 Graph Maker</h3>
            <div class="form-group">
                <label>Graph Type</label>
                <select id="graphType" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                    <option value="bar">Column Chart (Vertical Bar)</option>
                    <option value="horizontalBar">Bar Chart (Horizontal)</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                </select>
            </div>
            <div class="form-group">
                <label>Labels (Comma separated)</label>
                <input type="text" id="graphLabels" placeholder="e.g. Jan, Feb, Mar, Apr" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <div class="form-group">
                <label>Values (Comma separated)</label>
                <input type="text" id="graphValues" placeholder="e.g. 10, 20, 15, 30" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            
            <button onclick="generateGraph()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Generate Graph</button>
            
            <div id="graphContainer" class="canvas-container" style="display: none; margin-top: 15px;">
                <canvas id="graphCanvas" class="responsive-canvas"></canvas>
                <button onclick="downloadGraph()" style="width: 100%; margin-top: 15px; padding: 12px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold;">📥 Download as PNG</button>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function generateGraph() {
    if (!window.Chart) {
        showToast('Chart.js library is loading, please try again in a moment...', 'error');
        return;
    }

    const typeSelection = document.getElementById('graphType').value;
    const labelsRaw = document.getElementById('graphLabels').value;
    const valuesRaw = document.getElementById('graphValues').value;

    if (!labelsRaw.trim() || !valuesRaw.trim()) {
        showToast('Please enter both labels and values', 'error');
        return;
    }

    const labels = labelsRaw.split(',').map(l => l.trim());
    const values = valuesRaw.split(',').map(v => parseFloat(v.trim()));

    if (labels.length !== values.length) {
        showToast('Number of labels must match number of values', 'error');
        return;
    }
    
    if (values.some(isNaN)) {
        showToast('All values must be valid numbers', 'error');
        return;
    }

    document.getElementById('graphContainer').style.display = 'block';
    
    // In Chart.js we need a fresh canvas to destroy previously bound contexts, 
    // replacing the node is the cleanest approach.
    const canvasContainer = document.getElementById('graphContainer');
    const oldCanvas = document.getElementById('graphCanvas');
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'graphCanvas';
    newCanvas.className = 'responsive-canvas';
    canvasContainer.insertBefore(newCanvas, oldCanvas);
    oldCanvas.remove();

    const ctx = newCanvas.getContext('2d');

    if (currentChart) {
        currentChart.destroy();
    }

    let actualType = typeSelection;
    let indexAxis = 'x';
    if (typeSelection === 'horizontalBar') {
        actualType = 'bar';
        indexAxis = 'y';
    }

    const bgColors = [
        'rgba(102, 126, 234, 0.6)', 'rgba(118, 75, 162, 0.6)',
        'rgba(40, 167, 69, 0.6)', 'rgba(255, 193, 7, 0.6)',
        'rgba(220, 53, 69, 0.6)', 'rgba(23, 162, 184, 0.6)'
    ];
    
    // Repeat colors if more bars exist
    const extendedBg = Array(Math.max(values.length, 1)).fill().map((_, i) => bgColors[i % bgColors.length]);
    const borderColors = extendedBg.map(c => c.replace('0.6', '1'));

    currentChart = new Chart(ctx, {
        type: actualType,
        data: {
            labels: labels,
            datasets: [{
                label: 'Dataset',
                data: values,
                backgroundColor: actualType === 'line' ? 'rgba(102, 126, 234, 0.2)' : extendedBg,
                borderColor: actualType === 'line' ? borderColors[0] : borderColors,
                borderWidth: 2,
                fill: actualType === 'line',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            indexAxis: indexAxis,
            plugins: {
                legend: {
                    display: actualType === 'pie' || actualType === 'line'
                }
            }
        }
    });
    showToast('✓ Graph generated!', 'success');
}

function downloadGraph() {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    
    // Create a temporary canvas with white background for PNG transparency reasons
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.fillStyle = '#FFFFFF';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tCtx.drawImage(canvas, 0, 0);

    const url = tempCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'infinity_kit_graph.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('✓ Graph downloaded!', 'success');
}

// ==================== HEALTH UTILITY HUB ====================

function loadBMICalculator() {
    toolContent.innerHTML = `
        <div class="health-tool-card">
            <div class="health-input-group">
                <label>Height</label>
                <div class="health-input-row">
                    <input type="number" id="bmiHeight" class="health-input" placeholder="e.g. 170" inputmode="decimal">
                    <select id="bmiHeightUnit" class="health-select">
                        <option value="cm">cm</option>
                        <option value="ft">ft</option>
                    </select>
                </div>
            </div>
            <div class="health-input-group">
                <label>Weight</label>
                <div class="health-input-row">
                    <input type="number" id="bmiWeight" class="health-input" placeholder="e.g. 70" inputmode="decimal">
                    <select id="bmiWeightUnit" class="health-select">
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                    </select>
                </div>
            </div>
            <div id="bmiResultBox" class="health-result-box" style="display: none;">
                <div id="bmiValue" class="health-main-val"></div>
                <div id="bmiCategory" class="health-sub-val"></div>
            </div>
        </div>
    `;

    const inputs = ['bmiHeight', 'bmiHeightUnit', 'bmiWeight', 'bmiWeightUnit'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculateBMI);
    });
}

function calculateBMI() {
    let h = parseFloat(document.getElementById('bmiHeight').value);
    let hU = document.getElementById('bmiHeightUnit').value;
    let w = parseFloat(document.getElementById('bmiWeight').value);
    let wU = document.getElementById('bmiWeightUnit').value;
    let resultBox = document.getElementById('bmiResultBox');
    
    if (!h || !w) {
        resultBox.style.display = 'none';
        return;
    }

    if (hU === 'ft') {
        h = h * 0.3048; 
    } else {
        h = h / 100;
    }
    
    if (wU === 'lbs') {
        w = w * 0.453592;
    }
    
    if (h <= 0 || w <= 0) {
        resultBox.style.display = 'none';
        return;
    }

    let bmi = w / (h * h);
    bmi = bmi.toFixed(1);
    
    let category = '';
    let colorClass = '';
    if (bmi < 18.5) {
        category = 'Underweight';
        colorClass = 'bmi-yellow';
    } else if (bmi < 25) {
        category = 'Normal';
        colorClass = 'bmi-green';
    } else if (bmi < 30) {
        category = 'Overweight';
        colorClass = 'bmi-yellow';
    } else {
        category = 'Obese';
        colorClass = 'bmi-red';
    }
    
    document.getElementById('bmiValue').textContent = `BMI: ${bmi}`;
    let catEl = document.getElementById('bmiCategory');
    catEl.textContent = category;
    catEl.className = `health-sub-val ${colorClass}`;
    // Trigger tiny reflow for animation
    resultBox.style.display = 'none';
    resultBox.offsetHeight; 
    resultBox.style.display = 'block';
}

function loadDrugDosage() {
    toolContent.innerHTML = `
        <div class="health-tool-card">
            <div class="health-input-group">
                <label>Patient Weight (kg)</label>
                <input type="number" id="drugWeight" class="health-input" placeholder="e.g. 20" inputmode="decimal">
            </div>
            <div class="health-input-group">
                <label>Prescribed Dose (mg/kg)</label>
                <input type="number" id="drugDose" class="health-input" placeholder="e.g. 15" inputmode="decimal">
            </div>
            <div class="health-input-group">
                <label>Available Concentration (mg/ml)</label>
                <input type="number" id="drugConc" class="health-input" placeholder="e.g. 250" inputmode="decimal">
            </div>
            <div id="drugResultBox" class="health-result-box" style="display: none;">
                <div id="drugResultVal" class="health-main-val"></div>
            </div>
            <div class="health-warning">⚠️ For educational purposes only. Do not use for clinical decisions.</div>
        </div>
    `;

    ['drugWeight', 'drugDose', 'drugConc'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateDrug);
    });
}

function calculateDrug() {
    let w = parseFloat(document.getElementById('drugWeight').value);
    let d = parseFloat(document.getElementById('drugDose').value);
    let c = parseFloat(document.getElementById('drugConc').value);
    let resultBox = document.getElementById('drugResultBox');

    if (!w || !d || !c) {
        resultBox.style.display = 'none';
        return;
    }

    let totalMg = w * d;
    let ml = totalMg / c;

    document.getElementById('drugResultVal').innerHTML = `<span>Final Dosage:</span> <br> <strong>${ml.toFixed(2)} ml</strong> <br><small>(${totalMg.toFixed(2)} mg total)</small>`;
    resultBox.style.display = 'block';
}

function loadIVDripCalc() {
    toolContent.innerHTML = `
        <div class="health-tool-card">
            <div class="health-input-group">
                <label>Total Fluid Volume (ml)</label>
                <input type="number" id="ivVol" class="health-input" placeholder="e.g. 1000" inputmode="numeric">
            </div>
            <div class="health-input-group">
                <label>Time</label>
                <div class="health-input-row">
                    <input type="number" id="ivTime" class="health-input" placeholder="e.g. 8" inputmode="numeric">
                    <select id="ivTimeUnit" class="health-select">
                        <option value="hrs">Hours</option>
                        <option value="mins">Minutes</option>
                    </select>
                </div>
            </div>
            <div class="health-presets tool-grid-2">
                <button class="health-preset-btn" onclick="document.getElementById('ivTime').value=1; document.getElementById('ivTimeUnit').value='hrs'; calculateIV();">1 hr</button>
                <button class="health-preset-btn" onclick="document.getElementById('ivTime').value=2; document.getElementById('ivTimeUnit').value='hrs'; calculateIV();">2 hr</button>
                <button class="health-preset-btn" onclick="document.getElementById('ivTime').value=6; document.getElementById('ivTimeUnit').value='hrs'; calculateIV();">6 hr</button>
                <button class="health-preset-btn" onclick="document.getElementById('ivTime').value=24; document.getElementById('ivTimeUnit').value='hrs'; calculateIV();">24 hr</button>
            </div>
            <div class="health-input-group">
                <label>Drop Factor (gtt/ml)</label>
                <input type="number" id="ivDrop" class="health-input" placeholder="e.g. 20 (Macrodrip)" inputmode="numeric">
            </div>
            <div id="ivResultBox" class="health-result-box" style="display: none;">
                <div id="ivResultVal" class="health-main-val"></div>
            </div>
        </div>
    `;

    ['ivVol', 'ivTime', 'ivTimeUnit', 'ivDrop'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateIV);
    });
}

function calculateIV() {
    let vol = parseFloat(document.getElementById('ivVol').value);
    let time = parseFloat(document.getElementById('ivTime').value);
    let tu = document.getElementById('ivTimeUnit').value;
    let drops = parseFloat(document.getElementById('ivDrop').value);
    let resultBox = document.getElementById('ivResultBox');

    if (!vol || !time || !drops) {
        resultBox.style.display = 'none';
        return;
    }

    let timeInMins = tu === 'hrs' ? time * 60 : time;
    let rate = (vol * drops) / timeInMins;

    document.getElementById('ivResultVal').innerHTML = `Drip Rate: <strong>${Math.round(rate)}</strong> drops/min`;
    resultBox.style.display = 'block';
}

function loadMedicineReminder() {
    toolContent.innerHTML = `
        <div class="health-tool-card">
            <div id="notifIndicator" class="notif-status"></div>
            
            <div class="health-input-group">
                <label>Medicine Name</label>
                <input type="text" id="medName" class="health-input" placeholder="e.g. Paracetamol">
            </div>
            <div class="health-input-group">
                <label>Interval (hours)</label>
                <input type="number" id="medInterval" class="health-input" placeholder="e.g. 6" inputmode="numeric">
            </div>
            <div class="health-input-group">
                <label>Start Time</label>
                <input type="time" id="medStart" class="health-input">
            </div>
            <button class="health-btn" onclick="generateMedReminder()">Schedule & Generate 💊</button>
            
            <div id="activeRemindersList" class="active-reminders-container"></div>

            <div id="medResultBox" class="health-schedule-box" style="display: none;"></div>
        </div>
    `;
    
    // Default start time to now
    let now = new Date();
    let hrs = now.getHours().toString().padStart(2, '0');
    let mins = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('medStart').value = `${hrs}:${mins}`;

    if (window.NotificationManager) {
        window.NotificationManager.updateUIStatus();
        window.NotificationManager.updateActiveLists();
    }
}

function generateMedReminder() {
    let name = document.getElementById('medName').value || 'Medicine';
    let interval = parseFloat(document.getElementById('medInterval').value);
    let start = document.getElementById('medStart').value;
    let resultBox = document.getElementById('medResultBox');

    if (!interval || !start) {
        showToast('Please enter an interval and start time', 'error');
        return;
    }

    let [h, m] = start.split(':').map(Number);
    let schedule = [];
    
    let count = 24 / interval;
    if (count > 12) count = 12; // max cap
    if (count < 1) count = 1;

    let d = new Date();
    d.setHours(h, m, 0, 0);

    for(let i=0; i<Math.ceil(count); i++) {
        let timeStr = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Schedule in Notification System
        if (window.NotificationManager && i === 0) {
            // Only autoschedule first one for demo, or all? User asked for all schedules.
            // But we don't want to spam if it's 24h. Let's do all.
            const dateStr = d.toISOString().split('T')[0];
            const tsStr = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
            window.NotificationManager.scheduleExact(`Take medicine: ${name}`, 'Dosage time reached', dateStr, tsStr, 'medicine');
        }

        schedule.push(`
            <div class="med-schedule-item">
                <span class="med-time">⏰ ${timeStr}</span>
                <span class="med-name">${name}</span>
            </div>
        `);
        d.setHours(d.getHours() + interval);
    }

    resultBox.innerHTML = `<h4 style="margin-bottom:10px; color:var(--text-color);">Upcoming Doses Created</h4>` + schedule.join('');
    resultBox.style.display = 'block';
    
    if (window.NotificationManager) {
        window.NotificationManager.updateActiveLists();
    }
}
