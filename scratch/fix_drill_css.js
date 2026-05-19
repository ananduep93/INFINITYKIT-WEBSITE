const fs = require('fs');
let content = fs.readFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\app.css', 'utf8');

// Replace the old drill CSS block with an optimised one
const oldDrill = `/* =========================================
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
}`;

const newDrill = `/* =========================================
   Drill Navigation Transition (GPU-optimised)
   Only uses transform + opacity — composited on GPU, zero-lag.
   No filter:blur which is expensive on mobile.
   ========================================= */
@keyframes drillOut {
    0%   { transform: scale(1)    translateZ(0); opacity: 1; }
    100% { transform: scale(0.88) translateZ(0); opacity: 0; }
}
@keyframes drillIn {
    0%   { transform: scale(1.08) translateZ(0); opacity: 0; }
    100% { transform: scale(1)    translateZ(0); opacity: 1; }
}
body.drilling-out {
    animation: drillOut 0.3s cubic-bezier(0.4, 0, 1, 1) both;
    pointer-events: none;
    transform-origin: center center;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}
body.drilling-in {
    animation: drillIn 0.3s cubic-bezier(0, 0, 0.2, 1) both;
    transform-origin: center center;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}`;

if (content.includes(oldDrill.substring(0, 60))) {
    const newContent = content.replace(oldDrill, newDrill);
    fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\app.css', newContent, 'utf8');
    console.log('Done! Drill CSS optimised in app.css');
} else {
    // Try a looser match - just replace the @keyframes + body blocks near end
    const idx = content.lastIndexOf('@keyframes drillOut');
    if (idx !== -1) {
        const newContent = content.substring(0, idx) + newDrill + '\n';
        fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\app.css', newContent, 'utf8');
        console.log('Done! Replaced drill CSS via index match.');
    } else {
        console.log('ERROR: Could not find drill CSS to replace. Appending instead.');
        fs.writeFileSync('c:\\Users\\anand\\OneDrive\\Documents\\INFINITY KIT\\app.css', content + '\n' + newDrill + '\n', 'utf8');
    }
}
