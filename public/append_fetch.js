const fs = require('fs');
let js = fs.readFileSync('updates-popup.js', 'utf8');

if(!js.includes('fetchHomeUpdates')) {
js += `
async function fetchHomeUpdates() {
    const container = document.getElementById('homeUpdatesContainer');
    if (!container) return;
    try {
        const q = query(collection(db, 'updates'), orderBy('timestamp', 'desc'), limit(2));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            container.innerHTML = '<div style="text-align: center; width: 100%; opacity: 0.7;">No recent updates.</div>';
            return;
        }
        container.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const date = data.timestamp ? data.timestamp.toDate() : new Date();
            const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.innerHTML = \`<div class="blog-content" style="padding: 30px;">
                <span class="blog-date" style="color: #0145F2; font-weight: 600; font-size: 0.85rem; margin-bottom: 15px; display: block;">\${formattedDate}</span>
                <h4 style="margin-bottom: 15px; font-size: 1.2rem;">Infinity Kit Update</h4>
                <p style="color: var(--text-secondary); line-height: 1.6;">\${data.message.substring(0, 120)}...</p>
                <a href="whatsnew.html" class="read-more" style="color: #0145F2; margin-top: 15px; display: inline-block; font-weight: 600; text-decoration: none;">Read Full Log &rarr;</a>
            </div>\`;
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<div style="text-align: center; width: 100%; opacity: 0.7;">Failed to load updates.</div>';
    }
}
document.addEventListener('DOMContentLoaded', fetchHomeUpdates);
if (document.readyState === 'complete') fetchHomeUpdates();
`;
fs.writeFileSync('updates-popup.js', js);
}
