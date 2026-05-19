const fs = require('fs');
let content = fs.readFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', 'utf8');

const drillCSS = `
        /* ===== Drill Navigation Transition ===== */
        @keyframes drillOut {
            0%   { transform: scale(1); opacity: 1; }
            100% { transform: scale(0.88); opacity: 0; }
        }
        @keyframes drillIn {
            0%   { transform: scale(1.1); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        body.drilling-out {
            animation: drillOut 0.28s cubic-bezier(0.4,0,1,1) forwards;
            pointer-events: none;
        }
        body.drilling-in {
            animation: drillIn 0.3s cubic-bezier(0,0,0.2,1) forwards;
        }`;

// Inject before </style>
const newContent = content.replace('    </style>', drillCSS + '\n    </style>');
fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\index.html', newContent, 'utf8');
console.log('Done! Drill CSS added to index.html');
