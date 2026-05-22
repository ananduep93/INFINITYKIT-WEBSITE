const fs = require('fs');
const path = require('path');

const landingDir = path.join(__dirname, '..', 'landing');
const files = fs.readdirSync(landingDir).filter(f => f.endsWith('.html'));

const cssOverrides = `
    /* ============ INFINITYKIT PREMIUM LIGHT UI OVERRIDES ============ */
    :root {
      --primary: #0145F2 !important;
      --primary-dark: #0134C0 !important;
      --secondary: #667eea !important;
      --accent: #764ba2 !important;
      --hero-bg: #F8FAFC !important;
      --hero-bg-mid: #EEF2F6 !important;
      --white: rgba(255, 255, 255, 0.6) !important;
      --gray-50: #F8FAFC !important;
      --gray-100: #F1F5F9 !important;
      --gray-200: rgba(100, 116, 139, 0.12) !important;
      --gray-800: #1E293B !important;
      --gray-900: #0F172A !important;
    }

    body {
      background: #F8FAFC !important;
      color: #1E293B !important;
    }

    /* ============ UNIFIED NAVBAR STYLES ============ */
    .navbar-unified {
      display: block !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 70px !important;
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      border-bottom: 1px solid rgba(100, 116, 139, 0.15) !important;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02) !important;
      z-index: 10000 !important;
      box-sizing: border-box !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }

    .navbar-inner-unified {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      max-width: 1200px !important;
      height: 100% !important;
      margin: 0 auto !important;
      padding: 0 24px !important;
      box-sizing: border-box !important;
    }

    .navbar-logo-unified {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      text-decoration: none !important;
      color: #0145F2 !important;
      background: transparent !important;
      padding: 0 !important;
      border: none !important;
    }

    .navbar-logo-icon-unified {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 32px !important;
      height: 32px !important;
      background: linear-gradient(135deg, #0145F2 0%, #667eea 100%) !important;
      color: #ffffff !important;
      border-radius: 8px !important;
      font-size: 1.1rem !important;
      font-weight: bold !important;
      box-shadow: 0 4px 10px rgba(1, 69, 242, 0.2) !important;
    }

    .navbar-logo-text-unified {
      font-size: 1.3rem !important;
      font-weight: 800 !important;
      letter-spacing: -0.5px !important;
      color: #0145F2 !important;
      text-transform: uppercase !important;
    }

    .navbar-links-unified {
      display: flex !important;
      align-items: center !important;
      gap: 24px !important;
    }

    .navbar-links-unified a {
      font-size: 0.95rem !important;
      font-weight: 600 !important;
      color: #1E293B !important; /* Extremely high contrast dark gray */
      text-decoration: none !important;
      transition: all 0.2s ease !important;
      padding: 6px 12px !important;
      border-radius: 6px !important;
      background: transparent !important;
    }

    .navbar-links-unified a:hover {
      color: #0145F2 !important;
      background: rgba(1, 69, 242, 0.05) !important;
    }

    .navbar-cta-unified {
      background: #0145F2 !important;
      color: #ffffff !important;
      padding: 10px 20px !important;
      border-radius: 8px !important;
      font-weight: 700 !important;
      box-shadow: 0 4px 12px rgba(1, 69, 242, 0.2) !important;
      transition: all 0.2s ease !important;
      text-decoration: none !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .navbar-cta-unified:hover {
      background: #013bc7 !important;
      color: #ffffff !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 16px rgba(1, 69, 242, 0.3) !important;
    }

    .navbar-mobile-toggle-unified {
      display: none !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      width: 24px !important;
      height: 18px !important;
      background: transparent !important;
      border: none !important;
      cursor: pointer !important;
      padding: 0 !important;
    }

    .navbar-mobile-toggle-unified span {
      display: block !important;
      width: 100% !important;
      height: 2px !important;
      background: #1E293B !important;
      border-radius: 2px !important;
      transition: all 0.2s ease !important;
    }

    /* Responsive Styles */
    @media (max-width: 768px) {
      .navbar-mobile-toggle-unified {
        display: flex !important;
      }
      .navbar-links-unified {
        display: none !important;
        position: absolute !important;
        top: 70px !important;
        left: 0 !important;
        width: 100% !important;
        background: #ffffff !important;
        flex-direction: column !important;
        padding: 20px !important;
        gap: 16px !important;
        border-bottom: 1px solid rgba(100, 116, 139, 0.15) !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
        box-sizing: border-box !important;
      }
      .navbar-links-unified.active {
        display: flex !important;
      }
      .navbar-links-unified a {
        width: 100% !important;
        text-align: center !important;
      }
      .navbar-cta-unified {
        width: 100% !important;
        box-sizing: border-box !important;
      }
    }

    /* Dark theme overrides for unified navbar */
    [data-theme="dark"] .navbar-unified {
      background: rgba(15, 23, 42, 0.95) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    }

    [data-theme="dark"] .navbar-links-unified a {
      color: #E2E8F0 !important;
    }

    [data-theme="dark"] .navbar-links-unified a:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      color: #ffffff !important;
    }

    [data-theme="dark"] .navbar-mobile-toggle-unified span {
      background: #E2E8F0 !important;
    }

    @media (max-width: 768px) {
      [data-theme="dark"] .navbar-links-unified {
        background: #0F172A !important;
      }
    }

    /* Breadcrumb Overrides */
    .breadcrumb, .breadcrumb-bar {
      background: #F8FAFC !important;
      border-bottom: 1px solid rgba(100, 116, 139, 0.12) !important;
      margin-top: 70px !important; /* Account for the fixed navbar */
    }

    .breadcrumb-inner a, .breadcrumb-bar a {
      color: #0145F2 !important;
    }

    /* Hero Overrides */
    .hero {
      background: linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 100%) !important;
      color: #1E293B !important;
      padding-top: 40px !important; /* Extra breathing space */
    }

    /* If page doesn't have a breadcrumb bar, make sure hero gets the margin top */
    .hero:first-of-type {
      margin-top: 70px !important;
    }

    .hero::before {
      background:
        radial-gradient(ellipse 70% 60% at 50% 0%, rgba(1, 69, 242, 0.08) 0%, transparent 70%),
        radial-gradient(ellipse 50% 50% at 80% 80%, rgba(102, 126, 234, 0.05) 0%, transparent 60%) !important;
    }

    .hero h1 {
      color: #0F172A !important;
    }

    .hero-subtitle, .hero-sub {
      color: #475569 !important;
    }

    .hero-badge, .hero-eyebrow {
      background: rgba(1, 69, 242, 0.08) !important;
      border: 1px solid rgba(1, 69, 242, 0.18) !important;
      color: #0145F2 !important;
    }

    .gradient-text, .highlight {
      background: linear-gradient(135deg, #0145F2 0%, #667eea 100%) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
    }

    .btn-primary {
      background: #0145F2 !important;
      color: #ffffff !important;
      box-shadow: 0 4px 14px rgba(1, 69, 242, 0.3) !important;
    }

    .btn-primary:hover {
      background: #013bc7 !important;
    }

    .btn-secondary, .btn-outline {
      background: rgba(255, 255, 255, 0.8) !important;
      color: #1E293B !important;
      border: 1px solid rgba(100, 116, 139, 0.2) !important;
    }

    .btn-secondary:hover, .btn-outline:hover {
      background: rgba(255, 255, 255, 1) !important;
    }

    /* Glassmorphic Panel Overrides for Cards */
    .why-card, .tool-card, .tip-card, .faq-item, .success-card, .success-card-inner, .testimonial-card, .feature-card, .stat-card, .complaint-card, .qc-card, .beyond-card, .step-card {
      background: rgba(255, 255, 255, 0.6) !important;
      backdrop-filter: blur(15px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(15px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 8px 32px rgba(31, 38, 135, 0.06) !important;
      border-radius: 20px !important;
      color: #1E293B !important;
    }

    .why-card:hover, .tool-card:hover, .tip-card:hover, .testimonial-card:hover, .feature-card:hover, .complaint-card:hover, .qc-card:hover, .beyond-card:hover, .step-card:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0 12px 40px rgba(31, 38, 135, 0.1) !important;
      border-color: rgba(1, 69, 242, 0.2) !important;
    }

    /* Text elements inside cards */
    .why-card h3, .tool-card h3, .tip-title, .testimonial-name, .feature-card h3, .stat-number, .complaint-title, .qc-label, .beyond-name, .step-title, .tool-card-name {
      color: #0F172A !important;
    }

    .why-card p, .tool-card p, .tip-text, .testimonial-text, .testimonial-role, .feature-card p, .stat-label, .complaint-text, .beyond-desc, .step-desc, .tool-card-desc {
      color: #475569 !important;
    }

    .tip-card::before {
      background: rgba(1, 69, 242, 0.05) !important;
    }

    .tip-number, .step-number {
      background: rgba(1, 69, 242, 0.08) !important;
      border: 1px solid rgba(1, 69, 242, 0.18) !important;
      color: #0145F2 !important;
    }

    .tip-tool-link {
      color: #0145F2 !important;
      border-color: rgba(1, 69, 242, 0.18) !important;
    }

    .tip-tool-link:hover {
      background: rgba(1, 69, 242, 0.05) !important;
    }

    /* Comparison Table Styling */
    .comparison-table, .comp-table {
      background: rgba(255, 255, 255, 0.6) !important;
      backdrop-filter: blur(15px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 8px 32px rgba(31, 38, 135, 0.06) !important;
      border-radius: 20px !important;
      overflow: hidden !important;
      border-collapse: separate !important;
    }

    .comparison-table thead tr, .comp-table thead tr {
      background: linear-gradient(135deg, #0145F2 0%, #667eea 100%) !important;
    }

    .comparison-table thead th, .comp-table thead th {
      color: #ffffff !important;
      font-weight: 700 !important;
    }

    .comparison-table tbody tr, .comp-table tbody tr {
      border-bottom: 1px solid rgba(100, 116, 139, 0.1) !important;
    }

    .comparison-table tbody td, .comp-table tbody td {
      color: #475569 !important;
    }

    .comparison-table tbody td:first-child, .comp-table tbody td:first-child {
      color: #0F172A !important;
    }

    .comparison-table .col-ik, .comp-table .th-ik {
      background: rgba(1, 69, 242, 0.03) !important;
    }

    /* FAQ accordion styling overrides */
    .faq-item {
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }

    .faq-item:hover {
      border-color: rgba(1, 69, 242, 0.25) !important;
    }

    .faq-question-text, .faq-question, .faq-q {
      color: #0F172A !important;
      font-weight: 600 !important;
    }

    .faq-chevron, .faq-icon {
      background: rgba(1, 69, 242, 0.05) !important;
      color: #0145F2 !important;
    }

    .faq-answer, .faq-a {
      color: #475569 !important;
      border-top: 1px solid rgba(100, 116, 139, 0.08) !important;
    }

    /* Footer styling matching restored index.html footer */
    .footer, footer {
      background: #0F172A !important;
      color: rgba(255, 255, 255, 0.7) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    .footer a, footer a {
      color: rgba(255, 255, 255, 0.7) !important;
    }

    .footer a:hover, footer a:hover {
      color: #ffffff !important;
    }

    /* Dark Mode variables and support overrides */
    [data-theme="dark"] {
      --hero-bg: #0F172A !important;
      --hero-bg-mid: #1E293B !important;
      --white: rgba(30, 41, 59, 0.6) !important;
      --gray-50: #0F172A !important;
      --gray-800: #E2E8F0 !important;
      --gray-900: #F1F5F9 !important;
    }

    [data-theme="dark"] body {
      background: #0F172A !important;
      color: #E2E8F0 !important;
    }

    [data-theme="dark"] .breadcrumb, [data-theme="dark"] .breadcrumb-bar {
      background: #0F172A !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    }

    [data-theme="dark"] .hero {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%) !important;
      color: #E2E8F0 !important;
    }

    [data-theme="dark"] .hero h1 {
      color: #F1F5F9 !important;
    }

    [data-theme="dark"] .hero-subtitle, [data-theme="dark"] .hero-sub {
      color: #94A3B8 !important;
    }

    [data-theme="dark"] .btn-secondary, [data-theme="dark"] .btn-outline {
      background: rgba(30, 41, 59, 0.8) !important;
      color: #E2E8F0 !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    [data-theme="dark"] .why-card, [data-theme="dark"] .tool-card, [data-theme="dark"] .tip-card, [data-theme="dark"] .faq-item, [data-theme="dark"] .success-card, [data-theme="dark"] .success-card-inner, [data-theme="dark"] .testimonial-card, [data-theme="dark"] .feature-card, [data-theme="dark"] .stat-card, [data-theme="dark"] .complaint-card, [data-theme="dark"] .qc-card, [data-theme="dark"] .beyond-card, [data-theme="dark"] .step-card {
      background: rgba(30, 41, 59, 0.6) !important;
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
      color: #E2E8F0 !important;
    }

    [data-theme="dark"] .why-card h3, [data-theme="dark"] .tool-card h3, [data-theme="dark"] .tip-title, [data-theme="dark"] .testimonial-name, [data-theme="dark"] .feature-card h3, [data-theme="dark"] .stat-number, [data-theme="dark"] .complaint-title, [data-theme="dark"] .qc-label, [data-theme="dark"] .beyond-name, [data-theme="dark"] .step-title, [data-theme="dark"] .tool-card-name {
      color: #F1F5F9 !important;
    }

    [data-theme="dark"] .why-card p, [data-theme="dark"] .tool-card p, [data-theme="dark"] .tip-text, [data-theme="dark"] .testimonial-text, [data-theme="dark"] .testimonial-role, [data-theme="dark"] .feature-card p, [data-theme="dark"] .stat-label, [data-theme="dark"] .complaint-text, [data-theme="dark"] .beyond-desc, [data-theme="dark"] .step-desc, [data-theme="dark"] .tool-card-desc {
      color: #94A3B8 !important;
    }

    [data-theme="dark"] .comparison-table, [data-theme="dark"] .comp-table {
      background: rgba(30, 41, 59, 0.6) !important;
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
    }

    [data-theme="dark"] .comparison-table tbody td, [data-theme="dark"] .comp-table tbody td {
      color: #94A3B8 !important;
    }

    [data-theme="dark"] .comparison-table tbody td:first-child, [data-theme="dark"] .comp-table tbody td:first-child {
      color: #F1F5F9 !important;
    }

    [data-theme="dark"] .comparison-table .col-ik, [data-theme="dark"] .comp-table .th-ik {
      background: rgba(255, 255, 255, 0.01) !important;
    }

    [data-theme="dark"] .faq-question-text, [data-theme="dark"] .faq-question, [data-theme="dark"] .faq-q {
      color: #F1F5F9 !important;
    }

    [data-theme="dark"] .faq-answer, [data-theme="dark"] .faq-a {
      color: #94A3B8 !important;
      border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
    }
`;

files.forEach(file => {
  const filePath = path.join(landingDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Determine CTA text and URL
  let ctaText = 'All 80+ Tools →';
  let ctaUrl = 'https://infinitykit.online';

  if (file === 'privacy-focused-pdf-tools.html' || file === 'smallpdf-alternative.html') {
    ctaText = '🔒 Free PDF Tools';
    ctaUrl = 'https://infinitykit.online/folder/pdf-toolkit';
  }

  // 1. Unified CSS block insertion / replacement
  const oldOverridesRegex = /\/\* ============ INFINITYKIT PREMIUM LIGHT UI OVERRIDES ============ \*\/[\s\S]*?(?=\s*<\/style>)/i;
  
  if (content.match(oldOverridesRegex)) {
    content = content.replace(oldOverridesRegex, cssOverrides.trim());
  } else if (content.includes('</style>')) {
    content = content.replace('</style>', `${cssOverrides}\n  </style>`);
  }

  // 2. Build the unified HTML navbar markup
  const unifiedNavbarMarkup = `<nav class="navbar-unified" role="navigation" aria-label="Main navigation">
    <div class="navbar-inner-unified">
      <a href="https://infinitykit.online" class="navbar-logo-unified" aria-label="InfinityKit Home">
        <span class="navbar-logo-icon-unified">⚡</span>
        <span class="navbar-logo-text-unified">INFINITY KIT</span>
      </a>
      <div class="navbar-links-unified">
        <a href="https://infinitykit.online/folder/pdf-toolkit">PDF Tools</a>
        <a href="https://infinitykit.online/folder/utilities">Utilities</a>
        <a href="https://infinitykit.online/folder/student-tools">Student Tools</a>
        <a href="https://infinitykit.online/folder/text-tools">Text Tools</a>
        <a href="${ctaUrl}" class="navbar-cta-unified">${ctaText}</a>
      </div>
      <button class="navbar-mobile-toggle-unified" aria-label="Toggle menu" onclick="this.closest('.navbar-unified').querySelector('.navbar-links-unified').classList.toggle('active')">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>`;

  // 3. Match and replace the existing navbar block completely
  // Match <nav class="navbar"...>...</nav> or <nav class="navbar-unified"...>...</nav>
  const navbarRegex = /<nav class="(navbar|navbar-unified)"[\s\S]*?<\/nav>/i;
  if (content.match(navbarRegex)) {
    content = content.replace(navbarRegex, unifiedNavbarMarkup);
  } else {
    // If not matched (highly unlikely), inject at the beginning of <body>
    content = content.replace(/<body>/i, `<body>\n  ${unifiedNavbarMarkup}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully applied unified layout: ${file}`);
});
