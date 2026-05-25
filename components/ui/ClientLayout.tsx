'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Zap, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ArrowRight, 
  Github, 
  Search, 
  Sparkles, 
  Bell, 
  ChevronRight,
  ChevronDown,
  Home,
  LayoutDashboard,
  Star,
  Clock,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Scan,
  PenTool,
  Code,
  ClipboardList,
  Activity,
  Settings,
  Folder,
  FolderOpen,
  Check,
  ShieldAlert,
  Share2
} from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../../hooks/useAuth';
import { ThreeBackground } from './ThreeBackground';
import PageProgressBar from './PageProgressBar';
import { tools, mapCategoryToPath } from '../../config/tools';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Expandable folder states for ALL 9 categories
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'pdf-tools': true,
    'image-tools': false,
    'ai-writing-tools': false,
    'developer-tools': false,
    'video-tools': false,
    'audio-tools': false,
    'ocr-tools': false,
    'seo-tools': false,
    'social-media-tools': false,
    'automation-tools': false,
    'utility-tools': false
  });

  // GDPR Consent & PWA states
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');

  // Command Palette states
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('infinitykit_cookie_consent');
      if (consent === 'true') setCookieConsent(true);
      else if (consent === 'false') setCookieConsent(false);
    }
  }, []);

  // Global fetch interceptor to inject API Keys securely
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).__fetchIntercepted) {
      (window as any).__fetchIntercepted = true;
      const originalFetch = window.fetch;
      window.fetch = function (input, init) {
        if (typeof input === 'string' && input.includes('/api/ai')) {
          const userKey = localStorage.getItem('infinitykit_gemini_key');
          const openaiKey = localStorage.getItem('infinitykit_openai_key');
          
          if (userKey || openaiKey) {
            init = init || {};
            init.headers = init.headers || {};
            
            if (init.headers instanceof Headers) {
              if (userKey) init.headers.set('x-gemini-key', userKey);
              if (openaiKey) init.headers.set('x-openai-key', openaiKey);
            } else if (Array.isArray(init.headers)) {
              if (userKey) {
                const hasKey = init.headers.some(([k]) => k.toLowerCase() === 'x-gemini-key');
                if (!hasKey) init.headers.push(['x-gemini-key', userKey]);
              }
              if (openaiKey) {
                const hasKey = init.headers.some(([k]) => k.toLowerCase() === 'x-openai-key');
                if (!hasKey) init.headers.push(['x-openai-key', openaiKey]);
              }
            } else {
              if (userKey) init.headers['x-gemini-key'] = userKey;
              if (openaiKey) init.headers['x-openai-key'] = openaiKey;
            }
          }
        }
        return originalFetch.call(this, input, init);
      };
    }
  }, []);

  // PWA Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
          .then((reg) => console.log('Service Worker synced successfully:', reg.scope))
          .catch((err) => console.error('Service Worker registration failed:', err));
      }
      if ('Notification' in window) {
        setNotificationStatus(Notification.permission);
      }
    }
  }, []);

  // Keyboard Shortcuts Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowPalette(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out? Your active cloud sync session will end.')) {
      await logout();
      router.push('/');
    }
  };

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderKey]: !prev[folderKey]
    }));
  };

  const filteredPaletteTools = useMemo(() => {
    if (paletteSearch.trim() === '') {
      return tools.slice(0, 8);
    }
    return tools.filter(t => 
      t.name.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(paletteSearch.toLowerCase()))
    );
  }, [paletteSearch]);

  // Sidebar Folder Mappings - Normal, Understandable Names (All chevrons and children included)
  const categoriesList = [
    { id: 'pdf-tools', name: 'PDF Documents', icon: <FileText size={16} />, folderKey: 'pdf-tools', children: [
      { name: 'Merge PDF files', path: '/pdf/mergepdf' },
      { name: 'Split PDF pages', path: '/pdf/splitpdf' },
      { name: 'Reduce PDF size', path: '/pdf/compresspdf' },
      { name: 'Rotate PDF pages', path: '/pdf/rotatepdf' },
      { name: 'Password Lock PDF', path: '/pdf/protectpdf' },
      { name: 'Unlock PDF file', path: '/pdf/unlockpdf' },
      { name: 'Export PDF to Images', path: '/pdf/pdftoimage' },
      { name: 'Convert Images to PDF', path: '/pdf/imagetopdf' },
      { name: 'Add PDF Watermark', path: '/pdf/watermarkpdf' },
      { name: 'AI PDF Summarizer', path: '/pdf/ai-summarize-pdf' },
      { name: 'AI Chat with PDF', path: '/pdf/ai-chat-pdf' }
    ]},
    { id: 'image-tools', name: 'Photos & Images', icon: <ImageIcon size={16} />, folderKey: 'image-tools', children: [
      { name: 'Remove Background', path: '/image/bg-remover' },
      { name: 'Blur Background', path: '/image/blur-background' },
      { name: 'Shrink Photo file', path: '/image/image-compressor' },
      { name: 'Resize Dimensions', path: '/image/image-resizer' },
      { name: 'Read Photo Details', path: '/image/imageinfo' },
      { name: 'AI Image Generator', path: '/image/image-generator' },
      { name: 'EXIF Metadata Stripper', path: '/image/metadata-stripper' },
      { name: 'Color Palette Extractor', path: '/image/color-palette' }
    ]},
    { id: 'ai-writing-tools', name: 'AI Writing Assistant', icon: <PenTool size={16} />, folderKey: 'ai-writing-tools', children: [
      { name: 'AI Essay Writer', path: '/ai-writing/essay-writer' },
      { name: 'AI Text Humanizer', path: '/ai-writing/ai-humanizer' },
      { name: 'AI Blog Planner', path: '/ai-writing/blog-generator' },
      { name: 'AI Article Planner', path: '/ai-writing/article-writer' },
      { name: 'AI FAQ Generator', path: '/ai-writing/faq-generator' },
      { name: 'AI Grammar Checker', path: '/ai-writing/grammar-fixer' },
      { name: 'AI Paragraph Paraphrase', path: '/ai-writing/ai-rewriter' },
      { name: 'AI Chatbot Assistant', path: '/ai-writing/chatbot' },
      { name: 'AI Smart Text Improver', path: '/ai-writing/text-improver' },
      { name: 'AI Smart Text Summarizer', path: '/ai-writing/summarizer' },
      { name: 'AI Prompts for Men', path: '/ai-writing/men-prompts' },
      { name: 'AI Prompts for Women', path: '/ai-writing/women-prompts' },
      { name: 'Refine Prompts Assistant', path: '/ai-writing/smartsuggestions' }
    ]},
    { id: 'developer-tools', name: 'Code & Dev Tools', icon: <Code size={16} />, folderKey: 'developer-tools', children: [
      { name: 'Format JSON code', path: '/developer-tools/json-code' },
      { name: 'JSON to TypeScript class', path: '/developer-tools/json-to-ts' },
      { name: 'Optimize SVG vector', path: '/developer-tools/svg-optimizer' },
      { name: 'Structured SEO Schema Maker', path: '/developer-tools/schema-generator' },
      { name: 'URL Link Encoder', path: '/developer-tools/urlencoder' },
      { name: 'Extract Links from Text', path: '/developer-tools/urlextractor' },
      { name: 'Columns Data Summarizer', path: '/developer-tools/categorysummary' },
      { name: 'E-Signatures Pad', path: '/developer-tools/e-signature' },
      { name: 'Secured Vault Note', path: '/developer-tools/encrypted-note' },
      { name: 'CSV Spreadsheet Viewer', path: '/developer-tools/csvviewer' },
      { name: 'Frosty Glass CSS Maker', path: '/developer-tools/glass-gen' },
      { name: 'Interactive Graph Maker', path: '/developer-tools/graphmaker' },
      { name: 'Average & Mean Calculator', path: '/developer-tools/averagecalculator' },
      { name: 'Sort Numbers in Order', path: '/developer-tools/numbersorter' }
    ]},
    { id: 'video-tools', name: 'Video Tools', icon: <Video size={16} />, folderKey: 'video-tools', children: [
      { name: 'Convert Video to GIF', path: '/video/video-to-gif' },
      { name: 'Create Video Subtitles', path: '/video/subtitles-generator' },
      { name: 'Audio Speech to Text', path: '/video/video-transcription' }
    ]},
    { id: 'audio-tools', name: 'Audio & Music', icon: <Music size={16} />, folderKey: 'audio-tools', children: [
      { name: 'Extract Video Audio', path: '/audio/extract-audio' },
      { name: 'Convert Text to Voice', path: '/audio/texttospeech' },
      { name: 'Focus Noise Soundscape', path: '/audio/focus-soundscape' }
    ]},
    { id: 'ocr-tools', name: 'Text Scanner (OCR)', icon: <Scan size={16} />, folderKey: 'ocr-tools', children: [
      { name: 'Scan Image to Text', path: '/ocr/ocrimage' }
    ]},
    { id: 'seo-tools', name: 'SEO & Marketing', icon: <Search size={16} />, folderKey: 'seo-tools', children: [
      { name: 'Audits Landing Meta Tags', path: '/seo/metatagviewer' },
      { name: 'Sitemap Schema Builder', path: '/seo/schema-generator' }
    ]},
    { id: 'social-media-tools', name: 'Social Media & Sharing', icon: <Share2 size={16} />, folderKey: 'social-media-tools', children: [
      { name: 'Direct P2P File Transfer', path: '/social/p2p-share' },
      { name: 'Link-In-Bio Page Builder', path: '/social/link-bio' }
    ]},
    { id: 'automation-tools', name: 'Schedules & Automation', icon: <Activity size={16} />, folderKey: 'automation-tools', children: [
      { name: 'Batch File Renamer', path: '/automation/bulk-renamer' },
      { name: 'Daily Schedule Planner', path: '/automation/dailyplanner' },
      { name: 'Calendar Event Scheduler', path: '/automation/calendarviewer' },
      { name: 'Alarm & Reminder Alerts', path: '/automation/reminderalert' }
    ]},
    { id: 'utility-tools', name: 'Everyday Tools', icon: <ClipboardList size={16} />, folderKey: 'utility-tools', children: [
      { name: 'Body Weight Analyzer (BMI)', path: '/utility/bmicalculator' },
      { name: 'Medicine Dose Calculator', path: '/utility/drugdosage' },
      { name: 'IV Fluid Drip Rate', path: '/utility/ivdripcalc' },
      { name: 'Daily Doses Reminder Alarm', path: '/utility/medicinereminder' },
      { name: 'Pomodoro Study Timer', path: '/utility/timer' },
      { name: 'Crypto Password Maker', path: '/utility/passwordgen' },
      { name: 'Scan-to-Open QR Maker', path: '/utility/qrcode-gen' },
      { name: 'Measurement Units Converter', path: '/utility/unitconverter' },
      { name: 'Percentage Discount Calc', path: '/utility/percentagecalc' },
      { name: 'Days Counter between Dates', path: '/utility/daysbetween' },
      { name: 'Self-Destruct Notes', path: '/utility/note-shredder' },
      { name: 'Breaches Leak Scanner', path: '/utility/password-leak' },
      { name: 'Key Strength Entropy', path: '/utility/passwordstrength' },
      { name: 'Parabola Math Solver', path: '/utility/equationsolver' },
      { name: 'Daily To-Do Checklist', path: '/utility/todolist' },
      { name: 'Quick Notebook Vault', path: '/utility/notes' },
      { name: 'Outflow Purchases Recorder', path: '/utility/expenseadd' },
      { name: 'Savings Limits Planner', path: '/utility/budgettracker' },
      { name: 'Spending Visual Graphs', path: '/utility/expenseanalytics' },
      { name: 'Printable Balance Statements', path: '/utility/dailymonthlyreport' },
      { name: 'Where Do I Spend Most?', path: '/utility/topspendinginsights' },
      { name: 'Erase Ledger History', path: '/utility/resetexpenses' },
      { name: 'View Expense Records', path: '/utility/expenselist' },
      { name: 'Search & Filter Expenses', path: '/utility/searchexpenses' },
      { name: 'Sales Discount Calculator', path: '/utility/discountcalc' },
      { name: 'LCM & HCF Finder', path: '/utility/lcmhcf' },
      { name: 'Convert Text Cases', path: '/utility/caseconverter' },
      { name: 'Word & Character Counter', path: '/utility/wordcounter' },
      { name: 'Generate Fibonacci Range', path: '/utility/fibonacci' },
      { name: 'Factorial Calculator', path: '/utility/factorial' },
      { name: 'Prime Number Checker', path: '/utility/primenumber' },
      { name: 'Palindrome Checker', path: '/utility/palindrome' },
      { name: 'Flip Text Backward', path: '/utility/textreverse' },
      { name: 'Yes or No Decision Oracle', path: '/utility/yesnogerator' },
      { name: 'Triangle Validity Inspector', path: '/utility/trianglechecker' },
      { name: 'Remove Duplicate Words', path: '/utility/removeduplicates' },
      { name: 'Creative Username Generator', path: '/utility/usernamegen' },
      { name: 'Internet Speed Test', path: '/utility/speed-test' },
      { name: 'Morse Code Converter', path: '/utility/morse-flash' },
      { name: 'Distance Calc Coordinates', path: '/utility/distancecalc' },
      { name: 'Class Grade Estimator', path: '/utility/examcalc' },
      { name: 'Spin-the-Wheel Picker', path: '/utility/spinwheel' },
      { name: 'Compare Choices Matrix', path: '/utility/choicecomparator' },
      { name: 'Pick Random Winners', path: '/utility/randomnamepicker' },
      { name: 'Encrypted Password Keeper', path: '/utility/passwordsaver' },
      { name: 'Interactive Survey Builder', path: '/utility/surveybuilder' },
      { name: 'My Surveys Dashboard', path: '/utility/mysurveys' },
      { name: 'Survey Submissions Analyst', path: '/utility/responseviewer' },
      { name: 'Fill Survey Form', path: '/utility/publicsurvey' }
    ]}
  ];

  return (
    <>
      <PageProgressBar />
      <ThreeBackground />

      <div style={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
        
        {/* ====================================================
            DESKTOP LEFT SIDEBAR
            ==================================================== */}
        <aside
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: sidebarExpanded ? '280px' : '76px',
            background: theme === 'dark' ? 'rgba(10, 12, 18, 0.85)' : 'rgba(255, 255, 255, 0.88)',
            borderRight: '1px solid var(--glass-border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 14px',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
          className="desktop-sidebar-aside"
        >
          {/* Logo Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarExpanded ? 'space-between' : 'center', marginBottom: '30px', padding: '0 8px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: 'var(--primary-gradient)',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 161, 155, 0.2)'
              }}>
                <Zap size={16} color="white" fill="white" />
              </div>
              {sidebarExpanded && (
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  color: 'var(--text-color)',
                  letterSpacing: '-0.5px'
                }}>
                  INFINITYKIT
                </span>
              )}
            </Link>

            {sidebarExpanded && (
              <button 
                onClick={() => setSidebarExpanded(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', borderRadius: '6px'
                }}
                className="sidebar-collapse-btn"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {!sidebarExpanded && (
            <button 
              onClick={() => setSidebarExpanded(true)}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                cursor: 'pointer',
                color: 'var(--text-color)',
                padding: '8px',
                borderRadius: '8px',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px'
              }}
              title="Expand Sidebar"
            >
              <Menu size={16} />
            </button>
          )}

          {/* Quick Spotlight Search Palette Toggle */}
          <button
            onClick={() => setShowPalette(true)}
            style={{
              width: '100%',
              padding: sidebarExpanded ? '10px 14px' : '10px 0',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(0,0,0,0.02)',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              textAlign: sidebarExpanded ? 'left' : 'center',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarExpanded ? 'space-between' : 'center',
              marginBottom: '20px',
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
            title="Search Workspace (Ctrl+K)"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={14} color="var(--primary-color)" />
              {sidebarExpanded && <span>Search (Ctrl+K)</span>}
            </div>
            {sidebarExpanded && (
              <span style={{ fontSize: '0.65rem', background: 'var(--glass-border)', padding: '2px 6px', borderRadius: '4px' }}>⌘K</span>
            )}
          </button>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            
            {sidebarExpanded && (
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.8px', textTransform: 'uppercase', padding: '10px 8px 4px' }}>
                General
              </span>
            )}

            <Link href="/" className={`sidebar-nav-link ${pathname === '/' ? 'active' : ''}`} style={sidebarLinkStyle(pathname === '/')}>
              <Home size={16} />
              {sidebarExpanded && <span>Home Workspace</span>}
            </Link>

            <Link href="/dashboard" className={`sidebar-nav-link ${pathname.startsWith('/dashboard') ? 'active' : ''}`} style={sidebarLinkStyle(pathname.startsWith('/dashboard'))}>
              <LayoutDashboard size={16} />
              {sidebarExpanded && <span>User Dashboard</span>}
            </Link>

            <Link href="/tools" className={`sidebar-nav-link ${pathname === '/tools' ? 'active' : ''}`} style={sidebarLinkStyle(pathname === '/tools')}>
              <Activity size={16} />
              {sidebarExpanded && <span>Productivity Catalog</span>}
            </Link>

            {sidebarExpanded && (
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.8px', textTransform: 'uppercase', padding: '15px 8px 4px' }}>
                Tool Folders
              </span>
            )}

            {/* Folder categories section - ALL chevrons and dropdown tools included */}
            {categoriesList.map((folder) => {
              const isFolderOpen = expandedFolders[folder.folderKey];
              const categoryPath = mapCategoryToPath(folder.id);
              const isActiveRoute = pathname.startsWith(`/${categoryPath}`);

              if (sidebarExpanded) {
                return (
                  <div key={folder.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    <button
                      onClick={() => toggleFolder(folder.folderKey)}
                      style={{
                        ...sidebarLinkStyle(isActiveRoute),
                        background: 'none',
                        border: 'none',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isFolderOpen ? <FolderOpen size={16} color="var(--primary-color)" /> : <Folder size={16} />}
                        <span>{folder.name}</span>
                      </div>
                      <ChevronDown size={14} style={{ transform: isFolderOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                    </button>

                    {/* Children elements list */}
                    {isFolderOpen && (
                      <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '28px', borderLeft: '1px solid var(--glass-border)', marginLeft: '16px', marginTop: '2px', gap: '2px' }}>
                        {folder.children.map((child, cIdx) => {
                          const isChildActive = pathname === child.path;
                          return (
                            <Link 
                              key={cIdx} 
                              href={child.path}
                              style={{
                                color: isChildActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                fontWeight: isChildActive ? 600 : 500,
                                display: 'block',
                                transition: 'color 0.2s'
                              }}
                              onMouseEnter={(e) => { if (!isChildActive) e.currentTarget.style.color = 'var(--text-color)'; }}
                              onMouseLeave={(e) => { if (!isChildActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Simple folder icon item (collapsed sidebar)
              return (
                <Link
                  key={folder.id}
                  href={`/${categoryPath}`}
                  className={`sidebar-nav-link ${isActiveRoute ? 'active' : ''}`}
                  style={sidebarLinkStyle(isActiveRoute)}
                  title={folder.name}
                >
                  {folder.icon}
                  {sidebarExpanded && <span>{folder.name}</span>}
                </Link>
              );
            })}

          </nav>

          {/* Sidebar Footer Controls */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link 
              href="/dashboard?tab=profile" 
              className={`sidebar-nav-link ${pathname.includes('profile') ? 'active' : ''}`}
              style={sidebarLinkStyle(pathname.includes('profile'))}
              title="Settings"
            >
              <Settings size={16} />
              {sidebarExpanded && <span>Workspace Settings</span>}
            </Link>

            <button
              onClick={toggleTheme}
              style={{
                ...sidebarLinkStyle(false),
                background: 'none', border: 'none', cursor: 'pointer', width: '100%'
              }}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {sidebarExpanded && <span>{theme === 'dark' ? 'Light Workspace' : 'Dark Workspace'}</span>}
            </button>

            {isLoggedIn && (
              <button
                onClick={handleLogout}
                style={{
                  ...sidebarLinkStyle(false),
                  background: 'none', border: 'none', cursor: 'pointer', width: '100%', color: 'var(--error-color)'
                }}
                title="Sign Out"
              >
                <LogOut size={16} />
                {sidebarExpanded && <span>Logout</span>}
              </button>
            )}
          </div>
        </aside>

        {/* ====================================================
            MOBILE HEADER NAVBAR
            ==================================================== */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: theme === 'dark' ? 'rgba(10, 12, 18, 0.8)' : 'rgba(255, 255, 255, 0.85)',
            borderBottom: '1px solid var(--glass-border)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 1000,
            display: 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px'
          }}
          className="mobile-header-navbar"
        >
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'var(--primary-gradient)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Zap size={14} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1rem', fontWeight: 900, color: 'var(--text-color)' }}>
              INFINITYKIT
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowPalette(true)}
              style={{
                background: 'none', border: 'none', color: 'var(--text-color)', padding: '6px'
              }}
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: 'none', border: 'none', color: 'var(--text-color)', padding: '6px'
              }}
            >
              <Menu size={18} />
            </button>
          </div>
        </header>

        {/* ====================================================
            MOBILE SLIDE-OUT DRAWER PANEL
            ==================================================== */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              zIndex: 1100,
              display: 'flex',
              justifyContent: 'flex-end',
              animation: 'drawer-fade 0.25s ease'
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              style={{
                width: '300px',
                height: '100%',
                background: theme === 'dark' ? 'rgba(10,12,18,0.96)' : 'rgba(255,255,255,0.96)',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                animation: 'drawer-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-color)' }}>Workspace Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-color)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Drawer Navigation links */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link href="/" className="sidebar-nav-link" style={sidebarLinkStyle(pathname === '/')} onClick={() => setMobileMenuOpen(false)}>
                  <Home size={16} /> <span>Home Workspace</span>
                </Link>
                <Link href="/dashboard" className="sidebar-nav-link" style={sidebarLinkStyle(pathname.startsWith('/dashboard'))} onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard size={16} /> <span>User Dashboard</span>
                </Link>
                <Link href="/tools" className="sidebar-nav-link" style={sidebarLinkStyle(pathname === '/tools')} onClick={() => setMobileMenuOpen(false)}>
                  <Activity size={16} /> <span>Productivity Catalog</span>
                </Link>

                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', margin: '15px 0 5px' }}>Folders</span>
                {categoriesList.map((folder) => {
                  const isFolderOpen = expandedFolders[folder.folderKey];
                  const cleanPath = mapCategoryToPath(folder.id);
                  const isActiveRoute = pathname.startsWith(`/${cleanPath}`);
                  return (
                    <div key={folder.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        onClick={() => toggleFolder(folder.folderKey)}
                        style={{
                          ...sidebarLinkStyle(isActiveRoute),
                          background: 'none',
                          border: 'none',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {isFolderOpen ? <FolderOpen size={16} color="var(--primary-color)" /> : <Folder size={16} />}
                          <span>{folder.name}</span>
                        </div>
                        <ChevronDown size={14} style={{ transform: isFolderOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                      </button>

                      {isFolderOpen && (
                        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '28px', borderLeft: '1px solid var(--glass-border)', marginLeft: '16px', marginTop: '2px', gap: '2px' }}>
                          {folder.children.map((child, cIdx) => {
                            const isChildActive = pathname === child.path;
                            return (
                              <Link 
                                key={cIdx} 
                                href={child.path}
                                style={{
                                  color: isChildActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                                  textDecoration: 'none',
                                  fontSize: '0.8rem',
                                  padding: '6px 8px',
                                  borderRadius: '6px',
                                  fontWeight: isChildActive ? 600 : 500,
                                  display: 'block',
                                  transition: 'color 0.2s'
                                }}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {child.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile Drawer Footer */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                  style={{ ...sidebarLinkStyle(false), background: 'none', border: 'none', width: '100%' }}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{theme === 'dark' ? 'Light Workspace' : 'Dark Workspace'}</span>
                </button>

                <Link 
                  href="/dashboard?tab=profile" 
                  style={sidebarLinkStyle(false)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings size={16} /> <span>Settings</span>
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* ====================================================
            MOBILE BOTTOM NAVIGATION BAR
            ==================================================== */}
        <nav
          style={{
            position: 'fixed',
            left: '12px',
            right: '12px',
            bottom: '12px',
            height: '60px',
            background: theme === 'dark' ? 'rgba(12, 14, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            zIndex: 999,
            display: 'none',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0 10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
          className="mobile-bottom-bar"
        >
          <Link href="/" style={{ ...mobileBottomIconStyle(pathname === '/'), textDecoration: 'none' }}>
            <Home size={20} />
            <span style={{ fontSize: '0.62rem', fontWeight: 600, marginTop: '2px' }}>Home</span>
          </Link>
          <Link href="/dashboard" style={{ ...mobileBottomIconStyle(pathname.startsWith('/dashboard')), textDecoration: 'none' }}>
            <LayoutDashboard size={20} />
            <span style={{ fontSize: '0.62rem', fontWeight: 600, marginTop: '2px' }}>Workspace</span>
          </Link>
          <button onClick={() => setShowPalette(true)} style={mobileBottomIconStyle(showPalette)}>
            <Search size={20} color="var(--primary-color)" />
            <span style={{ fontSize: '0.62rem', fontWeight: 600, marginTop: '2px' }}>Search</span>
          </button>
          <Link href="/tools" style={{ ...mobileBottomIconStyle(pathname === '/tools'), textDecoration: 'none' }}>
            <Activity size={20} />
            <span style={{ fontSize: '0.62rem', fontWeight: 600, marginTop: '2px' }}>All Tools</span>
          </Link>
        </nav>

        {/* ====================================================
            MAIN VIEWPORT CONTENT WRAPPER
            ==================================================== */}
        <div
          style={{
            flex: 1,
            paddingLeft: sidebarExpanded ? '280px' : '76px',
            transition: 'padding-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            overflowX: 'hidden'
          }}
          className="main-workspace-content-wrapper"
        >
          <main style={{ flex: 1, padding: '40px', overflowX: 'hidden', width: '100%' }}>
            {children}
          </main>

          {/* ====================================================
              RESTORED GORGEOUS DYNAMIC MULTI-COLUMN FOOTER
              ==================================================== */}
          <footer
            style={{
              background: theme === 'dark' ? '#07090C' : '#FAFBFD',
              color: 'var(--text-color)',
              padding: '80px 40px 40px',
              borderTop: '1px solid var(--glass-border)',
              fontSize: '0.9rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Radial background glowing highlight */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '500px',
              height: '100px',
              background: 'radial-gradient(circle, rgba(0, 161, 155, 0.04), transparent 70%)',
              zIndex: 0,
              pointerEvents: 'none'
            }} />

            <div
              style={{
                maxWidth: '1100px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '50px',
                marginBottom: '60px',
                position: 'relative',
                zIndex: 1
              }}
            >
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.25rem', fontWeight: 900, marginBottom: '15px', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={18} color="var(--primary-color)" fill="var(--primary-color)" />
                  INFINITYKIT
                </h3>
                <p style={{ lineHeight: 1.6, opacity: 0.7, fontSize: '0.85rem' }}>
                  An elegant utility suite engineered completely client-side for total privacy and lightning speed. Open, secure, and tracker-free.
                </p>
                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                  <a href="https://github.com/ananduep93/Infinity_Kit" aria-label="GitHub Repository" style={{ color: 'var(--text-secondary)' }}><Github size={18} /></a>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', color: 'var(--primary-color)' }}>Navigation</h4>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}>Home</Link>
                  <Link href="/tools" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}>All Utilities</Link>
                  <Link href="/blog" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}>Resource Blog</Link>
                </nav>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', color: 'var(--primary-color)' }}>Legal & Security</h4>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link href="/privacy-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Privacy Policy</Link>
                  <Link href="/terms-conditions" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Terms & Conditions</Link>
                  <Link href="/cookie-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Cookie Policy</Link>
                  <Link href="/disclaimer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>Disclaimer</Link>
                </nav>
              </div>

              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', color: 'var(--primary-color)' }}>Direct Contact</h4>
                <p style={{ opacity: 0.7, fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '12px' }}>
                  For support, integration inquiries, or suggestion tickets:
                </p>
                <a 
                  href="mailto:infinitykit24@gmail.com" 
                  style={{ 
                    color: 'var(--text-color)', 
                    textDecoration: 'none', 
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  infinitykit24@gmail.com
                  <ArrowRight size={14} color="var(--primary-color)" />
                </a>
              </div>
            </div>

            <div
              style={{
                maxWidth: '1100px',
                margin: '0 auto',
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '25px',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                position: 'relative',
                zIndex: 1
              }}
            >
              &copy; 2026 InfinityKit. Zero-server computations. Absolute browser privacy.
            </div>
          </footer>
        </div>

      </div>

      {/* ====================================================
          SPOTLIGHT COMMAND PALETTE & DIALOG
          ==================================================== */}
      {showPalette && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 5, 8, 0.75)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          zIndex: 1500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '100px 20px'
        }}
        onClick={() => setShowPalette(false)}
        >
          <div 
            style={{
              maxWidth: '650px',
              width: '100%',
              background: theme === 'dark' ? 'rgba(10, 14, 20, 0.95)' : 'rgba(255, 255, 255, 0.97)',
              border: '1px solid var(--glass-border)',
              borderRadius: '24px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.5), 0 0 0 1px rgba(0, 161, 155, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'palette-zoom 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 24px', borderBottom: '1px solid var(--glass-border)' }}>
              <Search size={20} color="var(--primary-color)" />
              <input
                type="text"
                placeholder="Search tools, AI solvers, calculators, converters..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-color)',
                  outline: 'none',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '1.05rem',
                  fontWeight: 500
                }}
              />
              <span style={{ fontSize: '0.72rem', background: 'var(--glass-border)', padding: '4px 8px', borderRadius: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>ESC</span>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '12px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', padding: '8px 12px' }}>
                {paletteSearch.trim() === '' ? '⚡ FEATURED DYNAMIC TOOLS' : `🔎 SEARCH RESULTS (${filteredPaletteTools.length})`}
              </div>

              {filteredPaletteTools.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredPaletteTools.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setShowPalette(false);
                        router.push(`/${mapCategoryToPath(t.category)}/${t.id}`);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: 'none',
                        background: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                      className="palette-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-color)' }}>{t.name}</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>{t.description || 'Intelligent, ultra-private client calculations.'}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="palette-arrow" style={{ color: 'var(--primary-color)', opacity: 0, transform: 'translateX(-5px)', transition: 'all 0.2s' }} />
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Sparkles size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '0.82rem' }}>We couldn't find matches for &ldquo;{paletteSearch}&rdquo;.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          GDPR COOKIE CONSENT BANNER
          ==================================================== */}
      {cookieConsent === null && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            maxWidth: '380px',
            background: 'var(--glass-bg)',
            border: '1px solid rgba(0, 161, 155, 0.2)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            borderRadius: '20px',
            padding: '24px',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            animation: 'gdpr-slide 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="gdpr-cookie-banner"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--primary-color)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-color)' }}>Workspace Settings Preference</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            We implement cookies consent packets and browser storage fallbacks to persist theme layouts, user bookmarks history, and offline workspace variables.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                localStorage.setItem('infinitykit_cookie_consent', 'true');
                setCookieConsent(true);
              }}
              className="btn"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', borderRadius: '8px' }}
            >
              Accept All
            </button>
            <button
              onClick={() => {
                localStorage.setItem('infinitykit_cookie_consent', 'false');
                setCookieConsent(false);
              }}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
            >
              Preferences
            </button>
          </div>
        </div>
      )}

      {/* Global CSS overrides inside safe HTML style tags preventing styled-jsx panic checks */}
      <style dangerouslySetInnerHTML={{ __html: `
        .desktop-sidebar-aside {
          display: flex !important;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .desktop-sidebar-aside {
            display: none !important;
          }
          .mobile-header-navbar {
            display: flex !important;
          }
          .mobile-bottom-bar {
            display: flex !important;
          }
          .main-workspace-content-wrapper {
            padding-left: 0 !important;
            padding-top: 64px !important;
            padding-bottom: 72px !important;
          }
          .main-workspace-content-wrapper main {
            padding: 20px 14px !important;
          }
          .gdpr-cookie-banner {
            left: 12px !important;
            right: 12px !important;
            bottom: 84px !important;
            max-width: none !important;
          }
        }

        @keyframes drawer-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes drawer-slide {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes gdpr-slide {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes palette-zoom {
          from { transform: scale(0.97); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .palette-item:hover {
          background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'} !important;
        }

        .palette-item:hover .palette-arrow {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }

        .sidebar-nav-link:hover {
          background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'} !important;
        }
      `}} />
    </>
  );
}

function sidebarLinkStyle(isActive: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '10px',
    color: isActive ? 'var(--primary-color)' : 'var(--text-color)',
    background: isActive ? 'rgba(0, 161, 155, 0.08)' : 'transparent',
    border: 'none',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.88rem',
    textDecoration: 'none',
    textAlign: 'left',
    transition: 'all 0.25s ease-in-out',
    cursor: 'pointer'
  };
}

function mobileBottomIconStyle(isActive: boolean): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px'
  };
}
