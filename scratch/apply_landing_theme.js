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

    /* Navbar Overrides */
    .navbar {
      background: rgba(255, 255, 255, 0.8) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      border-bottom: 1px solid rgba(100, 116, 139, 0.15) !important;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02) !important;
      height: 70px !important;
    }

    .navbar-logo {
      color: #0145F2 !important;
      font-weight: 800 !important;
      font-size: 1.4rem !important;
      text-shadow: none !important;
    }

    .navbar-logo-icon {
      background: linear-gradient(135deg, #0145F2 0%, #667eea 100%) !important;
      color: #ffffff !important;
    }

    .navbar-links a {
      color: #1E293B !important;
      font-weight: 600 !important;
      opacity: 0.8 !important;
    }

    .navbar-links a:hover {
      color: #0145F2 !important;
      background: rgba(1, 69, 242, 0.05) !important;
      opacity: 1 !important;
    }

    .navbar-cta {
      background: #0145F2 !important;
      color: #ffffff !important;
      opacity: 1 !important;
    }

    .navbar-cta:hover {
      background: #013bc7 !important;
    }

    .navbar-mobile-toggle span {
      background: #1E293B !important;
    }

    /* Breadcrumb Overrides */
    .breadcrumb {
      background: #F8FAFC !important;
      border-bottom: 1px solid rgba(100, 116, 139, 0.12) !important;
    }

    .breadcrumb-inner a {
      color: #0145F2 !important;
    }

    /* Hero Overrides */
    .hero {
      background: linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 100%) !important;
      color: #1E293B !important;
    }

    .hero::before {
      background:
        radial-gradient(ellipse 70% 60% at 50% 0%, rgba(1, 69, 242, 0.08) 0%, transparent 70%),
        radial-gradient(ellipse 50% 50% at 80% 80%, rgba(102, 126, 234, 0.05) 0%, transparent 60%) !important;
    }

    .hero h1 {
      color: #0F172A !important;
    }

    .hero-subtitle {
      color: #475569 !important;
    }

    .hero-badge {
      background: rgba(1, 69, 242, 0.08) !important;
      border: 1px solid rgba(1, 69, 242, 0.18) !important;
      color: #0145F2 !important;
    }

    .gradient-text {
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

    .btn-secondary {
      background: rgba(255, 255, 255, 0.8) !important;
      color: #1E293B !important;
      border: 1px solid rgba(100, 116, 139, 0.2) !important;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 1) !important;
    }

    /* Glassmorphic Panel Overrides for Cards */
    .why-card, .tool-card, .tip-card, .faq-item, .success-card, .success-card-inner, .testimonial-card, .feature-card, .stat-card {
      background: rgba(255, 255, 255, 0.6) !important;
      backdrop-filter: blur(15px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(15px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 8px 32px rgba(31, 38, 135, 0.06) !important;
      border-radius: 20px !important;
      color: #1E293B !important;
    }

    .why-card:hover, .tool-card:hover, .tip-card:hover, .testimonial-card:hover, .feature-card:hover {
      transform: translateY(-4px) !important;
      box-shadow: 0 12px 40px rgba(31, 38, 135, 0.1) !important;
      border-color: rgba(1, 69, 242, 0.2) !important;
    }

    /* Text elements inside cards */
    .why-card h3, .tool-card h3, .tip-title, .testimonial-name, .feature-card h3, .stat-number {
      color: #0F172A !important;
    }

    .why-card p, .tool-card p, .tip-text, .testimonial-text, .testimonial-role, .feature-card p, .stat-label {
      color: #475569 !important;
    }

    .tip-card::before {
      background: rgba(1, 69, 242, 0.05) !important;
    }

    .tip-number {
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
    .comparison-table {
      background: rgba(255, 255, 255, 0.6) !important;
      backdrop-filter: blur(15px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 8px 32px rgba(31, 38, 135, 0.06) !important;
      border-radius: 20px !important;
      overflow: hidden !important;
    }

    .comparison-table thead tr {
      background: linear-gradient(135deg, #0145F2 0%, #667eea 100%) !important;
    }

    .comparison-table thead th {
      color: #ffffff !important;
    }

    .comparison-table tbody tr {
      border-bottom: 1px solid rgba(100, 116, 139, 0.1) !important;
    }

    .comparison-table tbody td {
      color: #475569 !important;
    }

    .comparison-table tbody td:first-child {
      color: #0F172A !important;
    }

    .comparison-table .col-ik {
      background: rgba(1, 69, 242, 0.03) !important;
    }

    /* FAQ accordion styling overrides */
    .faq-item {
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
    }

    .faq-item:hover {
      border-color: rgba(1, 69, 242, 0.25) !important;
    }

    .faq-question-text {
      color: #0F172A !important;
    }

    .faq-chevron {
      background: rgba(1, 69, 242, 0.05) !important;
      color: #0145F2 !important;
    }

    .faq-answer {
      color: #475569 !important;
      border-top: 1px solid rgba(100, 116, 139, 0.08) !important;
    }

    /* Footer styling matching restored index.html footer */
    .footer {
      background: #0F172A !important;
      color: rgba(255, 255, 255, 0.7) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    .footer a {
      color: rgba(255, 255, 255, 0.7) !important;
    }

    .footer a:hover {
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

    [data-theme="dark"] .navbar {
      background: rgba(15, 23, 42, 0.8) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    }

    [data-theme="dark"] .navbar-links a {
      color: #E2E8F0 !important;
    }

    [data-theme="dark"] .navbar-links a:hover {
      background: rgba(255, 255, 255, 0.05) !important;
    }

    [data-theme="dark"] .navbar-mobile-toggle span {
      background: #E2E8F0 !important;
    }

    [data-theme="dark"] .breadcrumb {
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

    [data-theme="dark"] .hero-subtitle {
      color: #94A3B8 !important;
    }

    [data-theme="dark"] .btn-secondary {
      background: rgba(30, 41, 59, 0.8) !important;
      color: #E2E8F0 !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    [data-theme="dark"] .why-card, [data-theme="dark"] .tool-card, [data-theme="dark"] .tip-card, [data-theme="dark"] .faq-item, [data-theme="dark"] .success-card, [data-theme="dark"] .success-card-inner, [data-theme="dark"] .testimonial-card, [data-theme="dark"] .feature-card, [data-theme="dark"] .stat-card {
      background: rgba(30, 41, 59, 0.6) !important;
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
      color: #E2E8F0 !important;
    }

    [data-theme="dark"] .why-card h3, [data-theme="dark"] .tool-card h3, [data-theme="dark"] .tip-title, [data-theme="dark"] .testimonial-name, [data-theme="dark"] .feature-card h3, [data-theme="dark"] .stat-number {
      color: #F1F5F9 !important;
    }

    [data-theme="dark"] .why-card p, [data-theme="dark"] .tool-card p, [data-theme="dark"] .tip-text, [data-theme="dark"] .testimonial-text, [data-theme="dark"] .testimonial-role, [data-theme="dark"] .feature-card p, [data-theme="dark"] .stat-label {
      color: #94A3B8 !important;
    }

    [data-theme="dark"] .comparison-table {
      background: rgba(30, 41, 59, 0.6) !important;
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
    }

    [data-theme="dark"] .comparison-table tbody td {
      color: #94A3B8 !important;
    }

    [data-theme="dark"] .comparison-table tbody td:first-child {
      color: #F1F5F9 !important;
    }

    [data-theme="dark"] .comparison-table .col-ik {
      background: rgba(255, 255, 255, 0.01) !important;
    }

    [data-theme="dark"] .faq-question-text {
      color: #F1F5F9 !important;
    }

    [data-theme="dark"] .faq-answer {
      color: #94A3B8 !important;
      border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
    }
`;

files.forEach(file => {
  const filePath = path.join(landingDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Inject the light theme CSS overrides right before </style>
  if (content.includes('</style>') && !content.includes('INFINITYKIT PREMIUM LIGHT UI OVERRIDES')) {
    content = content.replace('</style>', `${cssOverrides}\n  </style>`);
  }

  // 2. Update the navbar logo markup
  const oldLogoRegex = /<a href="https:\/\/infinitykit\.online" class="(navbar-logo|navbar-brand|nav-logo)"[^>]*>[\s\S]*?<\/a>/i;
  const newLogoMarkup = `<a href="https://infinitykit.online" class="navbar-logo" aria-label="InfinityKit Home">
      <div class="navbar-logo-icon">⚡</div>
      INFINITY KIT
    </a>`;

  if (content.match(oldLogoRegex)) {
    content = content.replace(oldLogoRegex, newLogoMarkup);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully themed & aligned: ${file}`);
});
