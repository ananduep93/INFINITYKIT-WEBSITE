const fs = require('fs');
let content = fs.readFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\app.css', 'utf8');

const drillCSS = `

/* =========================================
   Drill Navigation Transition (Global)
   ========================================= */
@keyframes drillOut {
    0%   { transform: scale(1) translateZ(0); opacity: 1; filter: blur(0px); }
    100% { transform: scale(0.86) translateZ(0); opacity: 0; filter: blur(4px); }
}
@keyframes drillIn {
    0%   { transform: scale(1.12) translateZ(0); opacity: 0; filter: blur(4px); }
    100% { transform: scale(1) translateZ(0); opacity: 1; filter: blur(0px); }
}
body.drilling-out {
    animation: drillOut 0.3s cubic-bezier(0.4,0,1,1) forwards;
    pointer-events: none;
    transform-origin: center center;
}
body.drilling-in {
    animation: drillIn 0.32s cubic-bezier(0,0,0.2,1) forwards;
    transform-origin: center center;
}
`;

fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\app.css', content + drillCSS, 'utf8');
console.log('Done! Drill CSS appended to app.css.');
