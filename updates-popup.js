import { db, collection, query, orderBy, limit, getDocs } from './firebase-config.js';

async function initUpdatePopup() {
    // Target the navbar logo container
    const navLogo = document.querySelector('.nav-logo');
    if (!navLogo) return;

    // Check if the user has closed the latest update
    const closedUpdateId = localStorage.getItem('infinityKit_closedUpdate');

    try {
        const q = query(collection(db, 'updates'), orderBy('timestamp', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return;

        const updateDoc = querySnapshot.docs[0];
        const updateId = updateDoc.id;

        // If this update was already closed, don't show it
        if (closedUpdateId === updateId) return;

        // Create the badge element
        const badge = document.createElement('div');
        badge.id = 'updatePopupBadge';
        badge.className = 'update-popup-badge';
        badge.innerHTML = `
            <span class="update-popup-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
                What's New
            </span>
            <button class="update-popup-close" id="closeUpdatePopup" title="Dismiss">&times;</button>
        `;

        // Redirect on click (except the close button)
        badge.addEventListener('click', (e) => {
            if (e.target.id === 'closeUpdatePopup') {
                e.stopPropagation();
                badge.style.opacity = '0';
                badge.style.transform = 'translateX(-5px)';
                setTimeout(() => badge.remove(), 300);
                localStorage.setItem('infinityKit_closedUpdate', updateId);
            } else {
                document.querySelector('.blog-section').scrollIntoView({ behavior: 'smooth' });
            }
        });

        // Insert after the logo in the navbar
        navLogo.insertAdjacentElement('afterend', badge);

    } catch (error) {
        console.error("Error fetching latest update:", error);
    }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUpdatePopup);
} else {
    initUpdatePopup();
}

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
            card.innerHTML = `<div class="blog-content" style="padding: 30px;">
                <span class="blog-date" style="color: #0145F2; font-weight: 600; font-size: 0.85rem; margin-bottom: 15px; display: block;">${formattedDate}</span>
                <h4 style="margin-bottom: 15px; font-size: 1.2rem;">Infinity Kit Update</h4>
                <p style="color: var(--text-secondary); line-height: 1.6;">${data.message.substring(0, 120)}...</p>
                <a href="whatsnew.html" class="read-more" style="color: #0145F2; margin-top: 15px; display: inline-block; font-weight: 600; text-decoration: none;">Read Full Log &rarr;</a>
            </div>`;
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<div style="text-align: center; width: 100%; opacity: 0.7;">Failed to load updates.</div>';
    }
}
document.addEventListener('DOMContentLoaded', fetchHomeUpdates);
if (document.readyState === 'complete') fetchHomeUpdates();
