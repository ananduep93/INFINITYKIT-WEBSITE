const fs = require('fs');
let css = fs.readFileSync('app.css', 'utf8');

// Replace Apple Blue with Mint
css = css.replace(/#007AFF/g, '#00A19B');
css = css.replace(/#0056b3/g, '#008782');
css = css.replace(/rgba\(0,\s*122,\s*255,/g, 'rgba(0, 161, 155,');
css = css.replace(/rgba\(0,\s*86,\s*179,/g, 'rgba(0, 135, 130,');

// Replace Light Gray/White with Ice Latte
css = css.replace(/--bg-gradient:\s*#FAFAFC;/g, '--bg-gradient: #E4DDD3;');
css = css.replace(/--bg-gradient:\s*#FFFFFF;/g, '--bg-gradient: #E4DDD3;');

// Reduce spacing everywhere
css = css.replace(/padding:\s*30px/g, 'padding: 20px');
css = css.replace(/padding:\s*60px/g, 'padding: 40px');
css = css.replace(/margin-bottom:\s*40px/g, 'margin-bottom: 25px');
css = css.replace(/margin-bottom:\s*25px/g, 'margin-bottom: 15px');
css = css.replace(/gap:\s*50px/g, 'gap: 30px');

fs.writeFileSync('app.css', css);
