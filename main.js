console.log('Infinity Kit Version 15.0 Loaded - Cache Busted');

// Folders with Tools Data
const baseFolders = [
    {
        id: 'favorites',
        name: '⭐ Favorites',
        icon: '⭐',
        emoji: '⭐',
        tools: [],
        isFavorites: true
    },
    {
        id: 'daily-essentials',
        name: 'Daily Essentials',
        icon: '🏠',
        emoji: '🏠',
        tools: ['calculator', 'todolist', 'notes', 'timer']
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
    }
];

// Dynamic folders array (will be updated with favorites)
let folders = [];

function getFavoriteFolderIds() {
    const favoriteIds = Array.isArray(appSettings?.favorites) ? appSettings.favorites : [];
    return favoriteIds.filter(id => baseFolders.some(folder => folder.id === id && !folder.isFavorites));
}

// Update folders with favorite-folder tools
function updateFolders() {
    folders = JSON.parse(JSON.stringify(baseFolders));
    
    // Build Favorites folder from tools inside favorite folders
    const favFolder = folders.find(f => f.isFavorites);
    if (favFolder) {
        const favoriteToolIds = [];
        const seen = new Set();
        const favoriteFolderIds = getFavoriteFolderIds();

        favoriteFolderIds.forEach(folderId => {
            const sourceFolder = baseFolders.find(folder => folder.id === folderId && !folder.isFavorites);
            if (!sourceFolder || !Array.isArray(sourceFolder.tools)) return;

            sourceFolder.tools.forEach(toolId => {
                if (!seen.has(toolId)) {
                    seen.add(toolId);
                    favoriteToolIds.push(toolId);
                }
            });
        });

        favFolder.tools = favoriteToolIds;
    }
}

// Tools Data
const tools = [
    {
        id: 'calculator',
        name: 'Calculator',
        icon: '🧮',
        description: 'Simple Calculator'
    },
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
const toast = document.getElementById('toast');
const backButton = document.getElementById('backButton');
const backButtonContainer = document.getElementById('backButtonContainer');
const currentFolderTitle = document.getElementById('currentFolderTitle');
const searchResults = document.getElementById('searchResults');
const searchResultsList = document.getElementById('searchResultsList');
const noResults = document.getElementById('noResults');
const recentSearches = document.getElementById('recentSearches');
const installAppBtn = document.getElementById('installAppBtn');

// App State
let calcDisplay = '';
let currentFolder = null;
let recentSearchesList = JSON.parse(localStorage.getItem('recentSearches')) || [];
let deferredInstallPrompt = null;
let isPwaInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    applySettings();
    updateFolders();
    renderFolders();
    setupEventListeners();
    setupPwaInstall();
    registerServiceWorker();
});

function setupPwaInstall() {
    updateInstallButtonState();
    if (installAppBtn) {
        installAppBtn.addEventListener('click', handleInstallApp);
    }

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        updateInstallButtonState();
    });

    window.addEventListener('appinstalled', () => {
        isPwaInstalled = true;
        deferredInstallPrompt = null;
        updateInstallButtonState();
        showToast('Infinity Kit installed successfully', 'success');
    });

    if (window.matchMedia) {
        const standaloneMedia = window.matchMedia('(display-mode: standalone)');
        const onStandaloneChange = (event) => {
            isPwaInstalled = event.matches;
            updateInstallButtonState();
        };

        if (typeof standaloneMedia.addEventListener === 'function') {
            standaloneMedia.addEventListener('change', onStandaloneChange);
        } else if (typeof standaloneMedia.addListener === 'function') {
            standaloneMedia.addListener(onStandaloneChange);
        }
    }
}

function updateInstallButtonState() {
    if (!installAppBtn) {
        return;
    }

    installAppBtn.classList.remove('is-installed');
    installAppBtn.disabled = false;
    installAppBtn.textContent = '\uD83D\uDCF2 Install App';
    installAppBtn.title = '';

    if (isPwaInstalled) {
        installAppBtn.disabled = true;
        installAppBtn.classList.add('is-installed');
        installAppBtn.textContent = 'Installed \u2705';
        return;
    }

    if (!deferredInstallPrompt) {
        installAppBtn.disabled = true;
        installAppBtn.title = 'Install will be available once your browser allows it.';
    }
}

async function handleInstallApp() {
    if (isPwaInstalled) {
        showToast('Infinity Kit is already installed', 'info');
        return;
    }

    if (!deferredInstallPrompt) {
        showToast('Install prompt is not available yet on this browser', 'info');
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
    }

    updateInstallButtonState();
}

function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch((error) => {
            console.error('Service worker registration failed:', error);
        });
    });
}

// Render folder cards
function renderFolders() {
    foldersGrid.innerHTML = '';

    folders.forEach(folder => {
        const card = document.createElement('div');
        card.className = 'folder-card';
        const toolCount = Array.isArray(folder.tools) ? folder.tools.length : 0;
        const isFavoriteFolder = !folder.isFavorites && getFavoriteFolderIds().includes(folder.id);
        if (isFavoriteFolder) {
            card.classList.add('favorite-folder');
        }
        card.innerHTML = `
            ${isFavoriteFolder ? '<div class="folder-favorite-badge">⭐</div>' : ''}
            <div class="folder-icon">${folder.emoji}</div>
            <div class="folder-name">${folder.name}</div>
            <div class="folder-count">${toolCount} tools</div>
        `;

        let longPressTimer = null;
        let longPressTriggered = false;
        const LONG_PRESS_MS = 600;

        const startLongPress = () => {
            if (folder.isFavorites) return;
            longPressTriggered = false;
            card.classList.add('long-pressing');
            clearTimeout(longPressTimer);
            longPressTimer = setTimeout(() => {
                longPressTriggered = true;
                card.classList.remove('long-pressing');
                toggleFavoriteFolder(folder.id);
            }, LONG_PRESS_MS);
        };

        const cancelLongPress = () => {
            card.classList.remove('long-pressing');
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        };

        card.addEventListener('mousedown', startLongPress);
        card.addEventListener('touchstart', startLongPress, { passive: true });
        card.addEventListener('mouseup', cancelLongPress);
        card.addEventListener('mouseleave', cancelLongPress);
        card.addEventListener('touchend', cancelLongPress);
        card.addEventListener('touchcancel', cancelLongPress);
        card.addEventListener('click', () => {
            if (longPressTriggered) {
                longPressTriggered = false;
                return;
            }
            openFolder(folder);
        });

        foldersGrid.appendChild(card);
    });
}

// Open folder
function openFolder(folder) {
    currentFolder = folder;
    foldersGrid.style.display = 'none';
    backButtonContainer.style.display = 'flex';
    searchResults.style.display = 'none';
    searchBar.value = '';
    
    currentFolderTitle.textContent = `${folder.emoji} ${folder.name}`;
    renderToolsInFolder(folder);
    
    toolsGrid.style.display = 'grid';
}

// Render tools in a folder
function renderToolsInFolder(folder) {
    toolsGrid.innerHTML = '';
    
    const folderTools = Array.isArray(folder.tools) ? folder.tools : [];
    folderTools.forEach(toolId => {
        const tool = tools.find(t => t.id === toolId);
        if (!tool) return;

        const card = document.createElement('div');
        card.className = 'tool-card';
        if (tool.comingSoon) {
            card.style.opacity = '0.6';
            card.style.cursor = 'not-allowed';
        }
        
        card.innerHTML = `
            <div class="tool-card-header">
                <div class="tool-icon">${tool.icon}</div>
            </div>
            <div class="tool-name">${tool.name}</div>
            ${tool.comingSoon ? '<div style="font-size: 0.8rem; margin-top: 5px; color: #999;">Coming Soon</div>' : ''}
        `;
        
        if (!tool.comingSoon) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => openTool(tool.id, tool.name, tool.icon));
        }
        toolsGrid.appendChild(card);
    });
}

// Back to folders
function backToFolders() {
    toolsGrid.style.display = 'none';
    backButtonContainer.style.display = 'none';
    foldersGrid.style.display = 'grid';
    currentFolder = null;
    searchBar.value = '';
    searchResults.style.display = 'none';
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

    backButton.addEventListener('click', backToFolders);
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
function addToRecentSearches(search) {
    // Remove if already exists
    recentSearchesList = recentSearchesList.filter(item => item !== search);
    
    // Add to beginning
    recentSearchesList.unshift(search);
    
    // Keep only last 10
    recentSearchesList = recentSearchesList.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearchesList));
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
function openTool(toolId, toolName, toolIcon) {
    const loadingOverlay = document.getElementById('toolLoadingOverlay');
    if(loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            doOpenTool(toolId, toolName, toolIcon);
        }, 400); // 400ms soft loading animation effect
    } else {
        doOpenTool(toolId, toolName, toolIcon);
    }
}

function doOpenTool(toolId, toolName, toolIcon) {
    if (typeof cleanupExpenseToolSync === 'function') {
        cleanupExpenseToolSync();
    }
    toolTitle.textContent = `${toolIcon} ${toolName}`;
    toolContent.innerHTML = '';
    
    // Track tool usage
    trackToolUsage(toolId);

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
    }

    // Track recent tool usage
    addRecentTool(toolId, toolName);
    
    modal.style.display = 'block';
}

// Close tool
function closeTool() {
    if (typeof cleanupExpenseToolSync === 'function') {
        cleanupExpenseToolSync();
    }
    modal.style.display = 'none';
    calcDisplay = '';
}

// Show toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
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
function loadToDoList() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    
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

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (!text) {
        showToast('Please enter a task', 'error');
        return;
    }

    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.push({ text, completed: false });
    localStorage.setItem('todos', JSON.stringify(todos));
    loadToDoList(); // Refresh
    showToast('Task added!', 'success');
}

function toggleTodo(index) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos[index].completed = !todos[index].completed;
    localStorage.setItem('todos', JSON.stringify(todos));
    loadToDoList();
}

function deleteTodo(index) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.splice(index, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
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
            <div class="form-group" style="display: flex; gap: 10px;">
                <input type="number" id="ucInput1" oninput="ucConvert('1')" style="flex: 2; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;" placeholder="Value">
                <select id="ucUnit1" onchange="ucConvert('1')" style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;"></select>
            </div>
            <div style="text-align: center; margin: 10px 0; font-size: 1.5rem; color: #667eea; font-weight: bold;">⇅</div>
            <div class="form-group" style="display: flex; gap: 10px;">
                <input type="number" id="ucInput2" oninput="ucConvert('2')" style="flex: 2; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;" placeholder="Value">
                <select id="ucUnit2" onchange="ucConvert('2')" style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;"></select>
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
            
            <div class="btn-group">
                <button onclick="copyPassword()">Copy</button>
                <button onclick="savePwd()" class="btn-secondary">Save This Password</button>
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

function savePwd() {
    const pwd = window.currentPassword;
    if (!pwd) {
        showToast('Generate a password first', 'error');
        return;
    }

    const appName = prompt('Enter application/service name:');
    if (!appName) return;

    const passwords = JSON.parse(localStorage.getItem('savedPasswords')) || [];
    passwords.push({ appName, password: pwd, date: new Date().toLocaleString() });
    localStorage.setItem('savedPasswords', JSON.stringify(passwords));
    showToast('Password saved!', 'success');
}

// ==================== PASSWORD SAVER ====================
function loadPasswordSaver() {
    const passwords = JSON.parse(localStorage.getItem('savedPasswords')) || [];

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

function saveSinglePassword() {
    const appName = document.getElementById('appName').value.trim();
    const password = document.getElementById('appPassword').value;

    if (!appName || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }

    const passwords = JSON.parse(localStorage.getItem('savedPasswords')) || [];
    passwords.push({ appName, password, date: new Date().toLocaleString() });
    localStorage.setItem('savedPasswords', JSON.stringify(passwords));
    
    document.getElementById('appName').value = '';
    document.getElementById('appPassword').value = '';
    loadPasswordSaver();
    showToast('Password saved!', 'success');
}

function copyPasswordItem(index) {
    const passwords = JSON.parse(localStorage.getItem('savedPasswords')) || [];
    navigator.clipboard.writeText(passwords[index].password);
    showToast('Password copied!', 'success');
}

function deletePasswordItem(index) {
    if (!confirm('Are you sure you want to delete this password?')) return;

    const passwords = JSON.parse(localStorage.getItem('savedPasswords')) || [];
    passwords.splice(index, 1);
    localStorage.setItem('savedPasswords', JSON.stringify(passwords));
    loadPasswordSaver();
    showToast('Password deleted!', 'success');
}

// ==================== DECISION MAKER ====================
// ==================== QUICK NOTES ====================
function loadQuickNotes() {
    const notes = JSON.parse(localStorage.getItem('quickNotes')) || [];

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

function saveNote() {
    const input = document.getElementById('noteInput');
    const content = input.value.trim();

    if (!content) {
        showToast('Please write something', 'error');
        return;
    }

    const title = content.substring(0, 50);
    const notes = JSON.parse(localStorage.getItem('quickNotes')) || [];
    notes.push({ title, content, date: new Date().toLocaleString() });
    localStorage.setItem('quickNotes', JSON.stringify(notes));

    input.value = '';
    loadQuickNotes();
    showToast('Note saved!', 'success');
}

function deleteNote(index) {
    if (!confirm('Are you sure?')) return;

    const notes = JSON.parse(localStorage.getItem('quickNotes')) || [];
    notes.splice(index, 1);
    localStorage.setItem('quickNotes', JSON.stringify(notes));
    loadQuickNotes();
    showToast('Note deleted!', 'success');
}

// ==================== TIMER & STOPWATCH ====================
function loadTimer() {
    let html = `
        <div class="tool-form">
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
                <div style="display: flex; gap: 10px;">
                    <button onclick="startTimer()">Start</button>
                    <button class="btn-secondary" onclick="stopTimer()">Stop</button>
                    <button class="btn-secondary" onclick="resetTimer()">Reset</button>
                </div>
            </div>

            <hr style="margin: 20px 0; border: none; border-top: 2px solid #e0e0e0;">

            <div>
                <h3>⏱️ Stopwatch Mode</h3>
                <div style="font-size: 2rem; text-align: center; font-weight: bold; margin: 20px 0; font-family: monospace;">
                    <span id="stopwatchDisplay">00:00:00</span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="startStopwatch()">Start</button>
                    <button class="btn-secondary" onclick="stopStopwatch()">Stop</button>
                    <button class="btn-secondary" onclick="resetStopwatch()">Reset</button>
                </div>
            </div>
        </div>
    `;
    toolContent.innerHTML = html;

    window.timerInterval = null;
    window.stopwatchInterval = null;
    window.stopwatchTime = 0;
}

function startTimer() {
    if (window.timerInterval) return;

    let minutes = parseInt(document.getElementById('timerMin').value) || 0;
    let seconds = parseInt(document.getElementById('timerSec').value) || 0;

    if (minutes === 0 && seconds === 0) {
        showToast('Set a time first', 'error');
        return;
    }

    window.timerInterval = setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(window.timerInterval);
                showToast('Time\'s up!', 'success');
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }

        document.getElementById('timerMin').value = minutes;
        document.getElementById('timerSec').value = seconds;
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

    window.stopwatchInterval = setInterval(() => {
        window.stopwatchTime++;
        updateStopwatchDisplay();
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

// Helper: Create drag-drop file upload area
function createFileUploadArea(acceptTypes, maxFiles = 1, helpText = '') {
    return `
        <div class="pdf-upload-area" ondrop="handlePDFDrop(event)" ondragover="event.preventDefault()" ondragleave="event.target.classList.remove('drag-active')" ondragenter="event.target.classList.add('drag-active')">
            <div class="pdf-upload-content">
                <div class="pdf-upload-icon">📁</div>
                <div class="pdf-upload-text">
                    <h3>Drag & drop your files here</h3>
                    <p>or click to browse</p>
                    ${helpText ? `<small>${helpText}</small>` : ''}
                </div>
            </div>
            <input type="file" id="pdfFileInput" accept="${acceptTypes}" multiple="${maxFiles > 1}" style="display: none;">
        </div>
        <div id="filePreview" class="file-preview"></div>
    `;
}

// Drag drop handler
function handlePDFDrop(event) {
    event.preventDefault();
    event.target.classList.remove('drag-active');
    
    const files = event.dataTransfer.files;
    const input = document.getElementById('pdfFileInput');
    
    if (input) {
        input.files = files;
        showFilePreview(files);
    }
}

// Show file preview
function showFilePreview(files) {
    const preview = document.getElementById('filePreview');
    if (!preview) return;
    
    preview.innerHTML = '<div class="file-items">';
    
    for (let file of files) {
        preview.innerHTML += `
            <div class="file-item">
                <div class="file-icon">📄</div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
            </div>
        `;
    }
    
    preview.innerHTML += '</div>';
}

// Progress indicator
function showProgress(message, progress = 0) {
    return `
        <div class="pdf-progress">
            <div class="progress-message">${message}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-percent">${progress}%</div>
        </div>
    `;
}

// PDF Editor
// ==================== PDF TOOLS ====================
let pdfState = {
    currentFiles: [],
    currentImages: [],
    converterFile: null,
};

// Set up PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Ensure libraries are available
const PDFLibModule = window.PDFLib || {};
const jsPDFLib = window.jspdf || {};

// ========== IMAGE TO PDF ==========
function loadImageToPDF() {
    let html = `
        <div class="tool-form">
            <h3>🖼️ Image to PDF</h3>
            <div class="pdf-upload-area" ondrop="handleImageDrop(event)" ondragover="event.preventDefault()" ondragleave="event.preventDefault()">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">🖼️</div>
                    <h3>Upload Images</h3>
                    <p>Drag & drop or click to select multiple images</p>
                </div>
                <input type="file" id="imageFileInput" accept=".jpg,.jpeg,.png,.gif,.bmp" multiple style="display: none;">
            </div>
            <div id="imagePreviewContainer" style="margin-top: 15px;"></div>
            <div class="form-group" style="margin-top: 15px;">
                <label>Page Size:</label>
                <select id="pageSize">
                    <option value="a4">A4 (210 x 297mm)</option>
                    <option value="letter">Letter (8.5 x 11in)</option>
                    <option value="a3">A3 (297 x 420mm)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Fit to Page:</label>
                <select id="fitMode">
                    <option value="contain">Fit (Maintain Aspect)</option>
                    <option value="cover">Fill Page</option>
                    <option value="original">Original Size</option>
                </select>
            </div>
            <button id="convertBtn" onclick="convertImagesToPDF()" style="width: 100%; margin-top: 15px; display: none;">⬇️ Convert to PDF</button>
        </div>
    `;
    toolContent.innerHTML = html;
    setupImageToPDFUpload();
}

function setupImageToPDFUpload() {
    const uploadArea = document.querySelector('.pdf-upload-area');
    const fileInput = document.getElementById('imageFileInput');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            handleImageSelect(e.target.files);
        });
    }
}

function handleImageDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    handleImageSelect(files);
}

async function handleImageSelect(files) {
    pdfState.currentImages = [];
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = '<h4>Selected Images:</h4><div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px;">';
    
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            pdfState.currentImages.push({ name: file.name, data: e.target.result });
            container.innerHTML += `<img src="${e.target.result}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; border: 2px solid #ddd;">`;
        };
        reader.readAsDataURL(file);
    }
    
    container.innerHTML += '</div>';
    document.getElementById('convertBtn').style.display = 'block';
}

async function convertImagesToPDF() {
    if (pdfState.currentImages.length === 0) {
        showToast('No images selected', 'error');
        return;
    }
    
    try {
        showProgress('Converting images to PDF...', 30);
        const { jsPDF } = window.jspdf;
        const pageSize = document.getElementById('pageSize').value;
        const fitMode = document.getElementById('fitMode').value;
        
        let pageWidth = 210, pageHeight = 297; // A4 default
        if (pageSize === 'letter') { pageWidth = 215.9; pageHeight = 279.4; }
        else if (pageSize === 'a3') { pageWidth = 297; pageHeight = 420; }
        
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: [pageWidth, pageHeight] });
        
        for (let i = 0; i < pdfState.currentImages.length; i++) {
            const img = new Image();
            img.src = pdfState.currentImages[i].data;
            
            await new Promise(resolve => {
                img.onload = () => {
                    const MAX_WIDTH = pageWidth - 10;
                    const MAX_HEIGHT = pageHeight - 10;
                    let width = MAX_WIDTH, height = (img.height * MAX_WIDTH) / img.width;
                    
                    if (height > MAX_HEIGHT) {
                        height = MAX_HEIGHT;
                        width = (img.width * MAX_HEIGHT) / img.height;
                    }
                    
                    const x = (pageWidth - width) / 2;
                    const y = (pageHeight - height) / 2;
                    
                    pdf.addImage(pdfState.currentImages[i].data, 'JPEG', x, y, width, height);
                    if (i < pdfState.currentImages.length - 1) pdf.addPage();
                    
                    showProgress(`Converting images to PDF...`, 30 + (60 * (i + 1) / pdfState.currentImages.length));
                    resolve();
                };
            });
        }
        
        showProgress('Finalizing PDF...', 95);
        pdf.save('images-to-pdf.pdf');
        showToast('✓ PDF created successfully', 'success');
    } catch (e) {
        showToast('Error converting images: ' + e.message, 'error');
    }
}

// ========== PDF TO IMAGE ==========
function loadPDFToImage() {
    let html = `
        <div class="tool-form">
            <h3>📸 PDF to Image</h3>
            <div class="pdf-upload-area" ondrop="handlePDFDrop(event, 'toimage')" ondragover="event.preventDefault()" ondragleave="event.preventDefault()">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📁</div>
                    <h3>Upload PDF to Convert</h3>
                    <p>Drag & drop or click to select</p>
                </div>
                <input type="file" id="pdfToImageInput" accept=".pdf" style="display: none;">
            </div>
            <div class="form-group" style="margin-top: 15px;">
                <label>Output Format:</label>
                <select id="imageFormat">
                    <option value="jpg">JPG (Smaller)</option>
                    <option value="png">PNG (Better Quality)</option>
                </select>
            </div>
            <div class="form-group">
                <label>DPI (Quality):</label>
                <select id="imageDPI">
                    <option value="72">72 DPI (Web)</option>
                    <option value="150" selected>150 DPI (Standard)</option>
                    <option value="300">300 DPI (High Quality)</option>
                </select>
            </div>
            <div id="conversionResult" style="margin-top: 15px;"></div>
            <button id="startConversionBtn" onclick="startPDFToImageConversion()" style="width: 100%; margin-top: 15px; display: none;">🔄 Convert to Images</button>
        </div>
    `;
    toolContent.innerHTML = html;
    setupPDFToImageUpload();
}

function setupPDFToImageUpload() {
    const fileInput = document.getElementById('pdfToImageInput');
    const uploadArea = document.querySelector('.pdf-upload-area');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                pdfState.converterFile = file;
                document.getElementById('startConversionBtn').style.display = 'block';
            }
        });
    }
}

function handlePDFDrop(e, mode) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        if (mode === 'toimage') {
            pdfState.converterFile = files[0];
            document.getElementById('startConversionBtn').style.display = 'block';
        } else if (mode === 'rotate') {
            document.getElementById('rotateFileInput').files = files;
            const event = new Event('change', { bubbles: true });
            document.getElementById('rotateFileInput').dispatchEvent(event);
        }
    }
}

async function startPDFToImageConversion() {
    if (!pdfState.converterFile) {
        showToast('No PDF selected', 'error');
        return;
    }
    
    try {
        showProgress('Loading PDF...', 20);
        const arrayBuffer = await pdfState.converterFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const format = document.getElementById('imageFormat').value;
        const dpi = parseInt(document.getElementById('imageDPI').value);
        const scale = dpi / 72;
        
        const resultDiv = document.getElementById('conversionResult');
        resultDiv.innerHTML = '<h4>Converting pages...</h4><div id="imagesList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px;"></div>';
        
        const imagesList = document.getElementById('imagesList');
        
        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 20); pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({ canvasContext: context, viewport }).promise;
            
            const imgData = canvas.toDataURL(`image/${format}`, 0.95);
            const img = document.createElement('img');
            img.src = imgData;
            img.style.cssText = 'width: 100%; border-radius: 4px; border: 1px solid #ddd; cursor: pointer;';
            img.onclick = () => downloadImage(imgData, `page-${pageNum}.${format}`);
            imagesList.appendChild(img);
            
            showProgress(`Converting page ${pageNum}/${Math.min(pdf.numPages, 20)}`, 20 + (70 * pageNum / Math.min(pdf.numPages, 20)));
        }
        
        showToast('✓ PDF converted! Click images to download', 'success');
    } catch (e) {
        showToast('Error converting PDF: ' + e.message, 'error');
    }
}

function downloadImage(imgData, filename) {
    const a = document.createElement('a');
    a.href = imgData;
    a.download = filename;
    a.click();
}

// ========== MERGE PDF ==========
function loadMergePDF() {
    let html = `
        <div class="tool-form">
            <h3>📎 Merge PDF</h3>
            <div class="pdf-upload-area" ondrop="handleMergeDrop(event)" ondragover="event.preventDefault()" ondragleave="event.preventDefault()">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📁</div>
                    <h3>Upload Multiple PDFs</h3>
                    <p>Select 2 or more PDFs to merge</p>
                </div>
                <input type="file" id="mergeFileInput" accept=".pdf" multiple style="display: none;">
            </div>
            <div id="mergeFilesList" style="margin-top: 15px;"></div>
            <button id="mergeBtn" onclick="performMergePDF()" style="width: 100%; margin-top: 15px; display: none;">📎 Merge PDFs</button>
        </div>
    `;
    toolContent.innerHTML = html;
    setupMergePDFUpload();
}

function setupMergePDFUpload() {
    const uploadArea = document.querySelector('.pdf-upload-area');
    const fileInput = document.getElementById('mergeFileInput');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            handleMergeSelect(e.target.files);
        });
    }
}

function handleMergeDrop(e) {
    e.preventDefault();
    handleMergeSelect(e.dataTransfer.files);
}

function handleMergeSelect(files) {
    if (files.length < 2) {
        showToast('Please select at least 2 PDFs', 'error');
        return;
    }
    
    pdfState.currentFiles = Array.from(files);
    const filesList = document.getElementById('mergeFilesList');
    filesList.innerHTML = '<h4>Files to Merge:</h4><ol>';
    
    for (let i = 0; i < pdfState.currentFiles.length; i++) {
        filesList.innerHTML += `<li style="margin: 8px 0;">${pdfState.currentFiles[i].name}</li>`;
    }
    filesList.innerHTML += '</ol>';
    document.getElementById('mergeBtn').style.display = 'block';
}

async function performMergePDF() {
    if (pdfState.currentFiles.length < 2) {
        showToast('Need at least 2 PDFs to merge', 'error');
        return;
    }
    
    if (!window.PDFLib) {
        showToast('PDF library not loaded yet, please try again', 'error');
        return;
    }
    
    try {
        showProgress('Merging PDFs...', 20);
        const mergedPdf = await window.PDFLib.PDFDocument.create();
        
        for (let i = 0; i < pdfState.currentFiles.length; i++) {
            const arrayBuffer = await pdfState.currentFiles[i].arrayBuffer();
            const pdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
            showProgress(`Merging PDFs...`, 20 + (70 * (i + 1) / pdfState.currentFiles.length));
        }
        
        showProgress('Finalizing...', 95);
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged.pdf';
        a.click();
        URL.revokeObjectURL(url);
        showToast('✓ PDFs merged successfully', 'success');
    } catch (e) {
        showToast('Error merging PDFs: ' + e.message, 'error');
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
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="padding: 15px; background: #f5f7fa; border-radius: 6px;">
                        <div style="font-size: 0.85rem; color: #666;">Total Marks</div>
                        <div id="totalMarks" style="font-size: 1.5rem; font-weight: bold; color: #667eea; margin-top: 5px;">0</div>
                    </div>
                    <div style="padding: 15px; background: #f5f7fa; border-radius: 6px;">
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
        <div style="padding: 12px; background: white; border-radius: 6px; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; align-items: end;">
                <input type="text" placeholder="Subject ${i+1}" value="" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="number" class="exam-mark" placeholder="Obtained" value="0" min="0" oninput="updateMarks()" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="number" class="exam-outof" placeholder="Out Of" value="100" min="1" oninput="updateMarks()" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
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
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 15px;">
                <button onclick="convertCase('upper')" style="padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">UPPER</button>
                <button onclick="convertCase('lower')" style="padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">lower</button>
                <button onclick="convertCase('capitalize')" style="padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Capitalize</button>
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
let appSettings = {
    theme: 'light',
    fontSize: 'medium',
    cardSize: 'normal',
    animationsEnabled: true,
    favorites: [],
    recentTools: [],
    usageStats: {}
};

function loadSettings() {
    const saved = localStorage.getItem('infinityKitSettings');
    if (saved) {
        try {
            appSettings = JSON.parse(saved);
        } catch (e) {
            console.log('Error loading settings, using defaults');
        }
    }

    if (!Array.isArray(appSettings.favorites)) {
        appSettings.favorites = [];
    }

    // Keep only valid folder ids as favorites (no tools, no Favorites folder itself)
    const validFavoriteFolderIds = new Set(
        baseFolders.filter(folder => !folder.isFavorites).map(folder => folder.id)
    );
    appSettings.favorites = appSettings.favorites.filter(id => validFavoriteFolderIds.has(id));

    if (!Array.isArray(appSettings.recentTools)) {
        appSettings.recentTools = [];
    }
    if (!appSettings.usageStats || typeof appSettings.usageStats !== 'object') {
        appSettings.usageStats = {};
    }

    updateSettingsUI();
}

function saveSettings() {
    localStorage.setItem('infinityKitSettings', JSON.stringify(appSettings));
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



function addFavorite(folderId) {
    if (!getFavoriteFolderIds().includes(folderId)) {
        appSettings.favorites.push(folderId);
        saveSettings();
        updateFolders();
        renderFolders();
        showToast('Folder added to favorites', 'success');
    }
}

function removeFavorite(folderId) {
    appSettings.favorites = getFavoriteFolderIds().filter(id => id !== folderId);
    saveSettings();
    updateFolders();
    renderFolders();
    showToast('Folder removed from favorites', 'success');
}

function clearAllFavorites() {
    if (getFavoriteFolderIds().length === 0) {
        showToast('No favorites to clear', 'info');
        return;
    }
    if (confirm('Are you sure you want to clear all favorites?')) {
        appSettings.favorites = [];
        saveSettings();
        updateFolders();
        renderFolders();
        showToast('All favorite folders cleared', 'success');
    }
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

// Toggle folder as favorite (triggered by long-press on folder cards)
function toggleFavoriteFolder(folderId) {
    const folder = baseFolders.find(f => f.id === folderId && !f.isFavorites);
    if (!folder) return;

    const favoriteFolderIds = getFavoriteFolderIds();
    const isAlreadyFavorite = favoriteFolderIds.includes(folderId);

    if (isAlreadyFavorite) {
        appSettings.favorites = favoriteFolderIds.filter(id => id !== folderId);
        showToast(`Removed ${folder.name} from favorites`, 'success');
    } else {
        appSettings.favorites = [...favoriteFolderIds, folderId];
        showToast(`Added ${folder.name} to favorites`, 'success');
    }

    saveSettings();
    updateFolders();
    renderFolders();
    updateFavoritesList();

    // Keep currently open folder in sync
    if (currentFolder) {
        const updatedFolder = folders.find(f => f.id === currentFolder.id);
        if (updatedFolder) {
            currentFolder = updatedFolder;
            renderToolsInFolder(currentFolder);
            backButtonContainer.style.display = 'flex';
        }
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
        const div = document.createElement('div');
        
        if (result.type === 'tool') {
            div.className = 'search-result-item';
            div.innerHTML = `<span>${item.icon} ${item.name}</span>`;
            div.onclick = () => {
                openTool(item.id, item.name, item.icon);
                searchResults.style.display = 'none';
                addToRecentSearches(item.name);
            };
        } else {
            div.className = 'search-result-item';
            div.innerHTML = `<span>${item.emoji} ${item.name} (Folder)</span>`;
            div.onclick = () => {
                openFolder(item);
                searchResults.style.display = 'none';
                addToRecentSearches(item.name);
            };
        }
        
        searchResultsList.appendChild(div);
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
function loadRotatePDF() {
    let html = `
        <div class="tool-form">
            <h3>🔄 Rotate PDF</h3>
            <div class="pdf-upload-area" ondrop="handlePDFDrop(event, 'rotate')" ondragover="event.preventDefault()" ondragleave="event.preventDefault()">
                <div class="pdf-upload-content">
                    <div class="pdf-upload-icon">📁</div>
                    <h3>Upload PDF to Rotate</h3>
                    <p>Drag & drop or click to select</p>
                </div>
                <input type="file" id="rotateFileInput" accept=".pdf" style="display: none;">
            </div>
            <div class="form-group" style="margin-top: 15px;">
                <label>Page Selection:</label>
                <select id="pageSelection">
                    <option value="all">All Pages</option>
                    <option value="odd">Odd Pages Only</option>
                    <option value="even">Even Pages Only</option>
                </select>
            </div>
            <div class="form-group">
                <label>Rotation:</label>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="performRotatePDF(90)" style="flex: 1; min-width: 100px;">↶ 90° Left</button>
                    <button onclick="performRotatePDF(270)" style="flex: 1; min-width: 100px;">↷ 90° Right</button>
                    <button onclick="performRotatePDF(180)" style="flex: 1; min-width: 100px;">↻ 180°</button>
                </div>
            </div>
            <button style="width: 100%; margin-top: 15px; display: none;" id="rotateBtn">🔄 Rotate PDF</button>
        </div>
    `;
    toolContent.innerHTML = html;
    setupRotatePDFUpload();
}

function setupRotatePDFUpload() {
    const fileInput = document.getElementById('rotateFileInput');
    const uploadArea = document.querySelector('.pdf-upload-area');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                pdfState.rotateFile = file;
                document.getElementById('rotateBtn').style.display = 'block';
            }
        });
    }
}

async function performRotatePDF(angle) {
    if (!pdfState.rotateFile) {
        showToast('No PDF selected', 'error');
        return;
    }
    
    if (!window.PDFLib) {
        showToast('PDF library not loaded yet, please try again', 'error');
        return;
    }
    
    try {
        showProgress('Loading PDF...', 20);
        const arrayBuffer = await pdfState.rotateFile.arrayBuffer();
        const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
        const pageSelection = document.getElementById('pageSelection').value;
        
        const pages = pdfDoc.getPages();
        let rotatedCount = 0;
        
        pages.forEach((page, i) => {
            let shouldRotate = false;
            if (pageSelection === 'all') shouldRotate = true;
            else if (pageSelection === 'odd' && (i + 1) % 2 === 1) shouldRotate = true;
            else if (pageSelection === 'even' && (i + 1) % 2 === 0) shouldRotate = true;
            
            if (shouldRotate) {
                page.setRotation(window.PDFLib.degrees(angle + (page.getRotation().angle || 0)));
                rotatedCount++;
            }
        });
        
        showProgress('Finalizing...', 80);
        const rotatedBytes = await pdfDoc.save();
        downloadFile(rotatedBytes, 'rotated.pdf');
        showToast(`✓ Rotated ${rotatedCount} pages successfully`, 'success');
    } catch (e) {
        showToast('Error rotating PDF: ' + e.message, 'error');
    }
}

// ========== HELPER FUNCTIONS ==========
function togglePasswordVisibility(id) {
    const input = document.getElementById(id);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

function downloadFile(data, filename) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function showProgress(message, percent) {
    showToast(`${message} ${percent}%`, 'info');
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
            <canvas id="graphCanvas" style="width: 100%; border: 1px solid #ddd; border-radius: 8px;"></canvas>
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
    canvas.width = 400;
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
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
                    <div style="color: #666; margin-bottom: 5px;">Average</div>
                    <div id="avgResult" style="font-size: 1.5rem; font-weight: bold; color: #667eea;">-</div>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
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
            <div id="csvTable" style="overflow-x: auto; background: white; border-radius: 8px;"></div>
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
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div class="form-group">
                    <label>Number 1</label>
                    <input type="number" id="lcmNum1" placeholder="Enter number" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                <div class="form-group">
                    <label>Number 2</label>
                    <input type="number" id="lcmNum2" placeholder="Enter number" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
            </div>
            <button onclick="calculateLCMHCF()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Calculate</button>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
                    <div style="color: #666; margin-bottom: 5px;">LCM</div>
                    <div id="lcmResult" style="font-size: 1.5rem; font-weight: bold; color: #667eea;">-</div>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
                    <div style="color: #666; margin-bottom: 5px;">HCF (GCD)</div>
                    <div id="hcfResult" style="font-size: 1.5rem; font-weight: bold; color: #764ba2;">-</div>
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
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div class="form-group">
                    <label>Side A</label>
                    <input type="number" id="triangleA" placeholder="Side A" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                <div class="form-group">
                    <label>Side B</label>
                    <input type="number" id="triangleB" placeholder="Side B" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                <div class="form-group">
                    <label>Side C</label>
                    <input type="number" id="triangleC" placeholder="Side C" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
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
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div>
                    <div style="margin-bottom: 8px; font-weight: bold;">Point 1 (x1, y1)</div>
                    <input type="number" id="dist_x1" placeholder="x1" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 8px;">
                    <input type="number" id="dist_y1" placeholder="y1" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                <div>
                    <div style="margin-bottom: 8px; font-weight: bold;">Point 2 (x2, y2)</div>
                    <input type="number" id="dist_x2" placeholder="x2" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 8px;">
                    <input type="number" id="dist_y2" placeholder="y2" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
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
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div class="form-group">
                    <label>Coefficient a</label>
                    <input type="number" id="equationA" placeholder="Enter a" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                <div class="form-group">
                    <label>Coefficient b</label>
                    <input type="number" id="equationB" placeholder="Enter b" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
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
            <canvas id="wheelCanvas" style="width: 100%; max-width: 400px; height: 400px; border: 2px solid #667eea; border-radius: 8px; margin: 20px auto; display: block;"></canvas>
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
    const ctx = canvas.getContext('2d');
    const radius = canvas.width / 2 - 5;
    const options = window.wheelOptions;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(radius + 5, radius + 5);
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
    
    ctx.translate(-radius - 5, -radius - 5);
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
            <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
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
    calendar += '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center;">';
    
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        calendar += `<div style="font-weight: bold; padding: 8px; background: #667eea; color: white; border-radius: 4px;">${day}</div>`;
    });
    
    for (let i = 0; i < firstDay; i++) {
        calendar += '<div></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
        calendar += `<div style="padding: 10px; background: ${isToday ? '#ffc107' : '#f5f7fa'}; border-radius: 4px; font-weight: ${isToday ? 'bold' : 'normal'};">${day}</div>`;
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
            <h3>⏰ Reminder Alert</h3>
            <div class="form-group">
                <label>Reminder text</label>
                <input type="text" id="reminderText" placeholder="What to remind you about..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; margin-bottom: 10px;">
            </div>
            <div class="form-group">
                <label>Minutes until reminder</label>
                <input type="number" id="reminderTime" min="1" max="1440" value="5" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
            </div>
            <button onclick="setReminder()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: bold; margin-bottom: 15px;">Set Reminder</button>
            <div id="reminderStatus" style="padding: 15px; background: white; border-radius: 8px; text-align: center; color: #667eea; font-weight: bold;"></div>
        </div>
    `;
    toolContent.innerHTML = html;
}

function setReminder() {
    const text = document.getElementById('reminderText').value;
    const minutes = parseInt(document.getElementById('reminderTime').value);
    
    if (!text || isNaN(minutes)) {
        showToast('⚠️ Fill all fields', 'error');
        return;
    }
    
    const ms = minutes * 60 * 1000;
    setTimeout(() => {
        alert(`⏰ REMINDER: ${text}`);
        showToast(`⏰ Reminder: ${text}`, 'success');
    }, ms);
    
    document.getElementById('reminderStatus').textContent = `✓ Reminder set for ${minutes} minute${minutes > 1 ? 's' : ''}!`;
    showToast(`✓ Reminder set!`, 'success');
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
            
            <div id="graphContainer" style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: none;">
                <canvas id="graphCanvas" style="max-width: 100%;"></canvas>
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
    newCanvas.style.maxWidth = '100%';
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
