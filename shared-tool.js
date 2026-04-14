/**
 * Shared logic for independent tool pages in Infinity Kit
 */

// Initialize Theme
(function() {
    try {
        const saved = localStorage.getItem('infinityKitSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.theme) {
                document.documentElement.setAttribute('data-theme', settings.theme);
            }
        }
    } catch (e) {}
})();

// Track tool usage
function trackToolUsage(toolId) {
    try {
        const stats = JSON.parse(localStorage.getItem('infinityKitStats')) || {};
        stats[toolId] = (stats[toolId] || 0) + 1;
        localStorage.setItem('infinityKitStats', JSON.stringify(stats));
    } catch (e) {}
}

// Add to recently used
function addRecentTool(toolId, toolName) {
    try {
        let recent = JSON.parse(localStorage.getItem('recentTools')) || [];
        recent = recent.filter(t => t.id !== toolId);
        recent.unshift({ id: toolId, name: toolName, time: Date.now() });
        localStorage.setItem('recentTools', JSON.stringify(recent.slice(0, 10)));
    } catch (e) {}
}

// Toast Notifications
function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Haptic Feedback
function triggerHaptic(type = 'light') {
    if (!('vibrate' in navigator)) return;
    const durations = { light: 10, medium: 30, strong: 50 };
    navigator.vibrate(durations[type] || 10);
}

// Escape HTML utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Global Nav Toggle
function toggleMenu() {
    const navRight = document.getElementById('navRight');
    if (navRight) {
        navRight.classList.toggle('active');
    }
}

function closeMenu() {
    const navRight = document.getElementById('navRight');
    if (navRight) {
        navRight.classList.remove('active');
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    // Current tool ID can be inferred from filename
    const path = window.location.pathname;
    const toolId = path.split('/').pop().replace('.html', '');
    
    // We can't easily get toolName from filename, but pages can call it manually
    // or we can bake it into the page.
    
    // Update Copyright
    const copyrightText = document.getElementById('copyrightText');
    if (copyrightText) {
        copyrightText.textContent = `\u00A9 ${new Date().getFullYear()} Infinity Kit. All rights reserved.`;
    }
});
