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
                window.location.href = 'whatsnew.html';
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
