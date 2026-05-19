const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', 'utf8');

const cssToAdd = `
        /* ===== iOS-Style Grouped Tools List ===== */
        .grouped-tools-list {
            max-width: 680px;
            margin: 0 auto;
            padding: 0 16px 40px;
        }
        .tool-group {
            margin-bottom: 28px;
        }
        .tool-group-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 4px 10px;
            border-bottom: 1px solid rgba(100,116,139,0.15);
            margin-bottom: 6px;
        }
        .tool-group-icon {
            font-size: 1rem;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea22, #764ba222);
            border-radius: 8px;
        }
        .tool-group-name {
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #667eea;
        }
        .tool-group-items {
            background: rgba(255,255,255,0.7);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 16px rgba(31,38,135,0.07);
            border: 1px solid rgba(255,255,255,0.5);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .tool-list-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 16px;
            cursor: pointer;
            transition: background 0.18s ease;
            border-bottom: 1px solid rgba(100,116,139,0.09);
            text-decoration: none;
            color: inherit;
            -webkit-tap-highlight-color: transparent;
        }
        .tool-list-item:last-child { border-bottom: none; }
        .tool-list-item:active, .tool-list-item:hover { background: rgba(102,126,234,0.08); }
        .tool-list-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
            flex-shrink: 0;
            box-shadow: 0 3px 10px rgba(102,126,234,0.3);
        }
        .tool-list-info { flex: 1; min-width: 0; }
        .tool-list-name {
            font-size: 0.97rem;
            font-weight: 600;
            color: #1E293B;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .tool-list-desc {
            font-size: 0.78rem;
            color: #64748B;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .tool-list-chevron { color: #94A3B8; font-size: 0.9rem; flex-shrink: 0; }
        [data-theme="dark"] .tool-group-items { background: rgba(30,41,59,0.7); border-color: rgba(255,255,255,0.07); }
        [data-theme="dark"] .tool-list-name { color: #e1e1e1; }
        [data-theme="dark"] .tool-list-item:hover { background: rgba(102,126,234,0.15); }
        [data-theme="dark"] .tool-group-header { border-color: rgba(255,255,255,0.1); }`;

// Inject CSS right before </style>
const newContent = content.replace('    </style>', cssToAdd + '\n    </style>');
fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', newContent, 'utf8');
console.log('Done! CSS injected.');
