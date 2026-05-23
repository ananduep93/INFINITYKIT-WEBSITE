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
async function trackToolUsage(toolId) {
    try {
        for (let i = 0; i < 10; i++) {
            if (window.syncService) break;
            await new Promise(r => setTimeout(r, 200));
        }

        // Add to unified Firestore history (Collection-based)
        if (window.syncService) {
            await window.syncService.addToHistory(toolId);
            
            // Also update usage stats (counts)
            let stats = await window.syncService.getData('infinityKitStats') || {};
            stats[toolId] = (stats[toolId] || 0) + 1;
            await window.syncService.saveData('infinityKitStats', stats);
        } else {
            // Fallback to local storage
            let stats = JSON.parse(localStorage.getItem('infinityKitStats')) || {};
            stats[toolId] = (stats[toolId] || 0) + 1;
            localStorage.setItem('infinityKitStats', JSON.stringify(stats));
        }
    } catch (e) {
        console.error("Error tracking tool usage:", e);
    }
}

// Add to recently used
async function addRecentTool(toolId, toolName) {
    try {
        for (let i = 0; i < 10; i++) {
            if (window.syncService) break;
            await new Promise(r => setTimeout(r, 200));
        }

        // Add to unified Firestore history (Collection-based)
        if (window.syncService) {
            await window.syncService.addToHistory(toolId);
        }

        // Maintain local cache for UI responsiveness
        let recent = JSON.parse(localStorage.getItem('recentTools')) || [];
        recent = recent.filter(t => (typeof t === 'string' ? t : t.id) !== toolId);
        recent.unshift({ id: toolId, name: toolName, time: Date.now() });
        recent = recent.slice(0, 10);
        localStorage.setItem('recentTools', JSON.stringify(recent));

    } catch (e) {
        console.error("Error adding recent tool:", e);
    }
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

    // Load Auth & Sync Entry Point (Module)
    const isToolPage = window.location.pathname.includes('/tools/');
    const base = isToolPage ? '../' : '';

    const authScript = document.createElement('script');
    authScript.type = 'module';
    authScript.src = base + 'auth-ui.js';
    document.head.appendChild(authScript);
});

// Modern Content Section Logic (Reveal on Scroll & Accordion)
document.addEventListener('DOMContentLoaded', () => {
    // 1. FAQ Accordion Logic
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close other items
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            
            if (!isActive) {
                item.classList.add('active');
                if (typeof triggerHaptic === 'function') triggerHaptic('light');
            }
        });
    });

    // 2. Scroll Reveal Animation Logic
    const revealCards = document.querySelectorAll('.info-card');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                revealObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealCards.forEach(card => {
        revealObserver.observe(card);
    });
});
