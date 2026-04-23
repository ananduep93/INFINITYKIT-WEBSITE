import { authService } from './auth.js';
import { syncService } from './sync.js';

export const authUI = {
    updateNavbar() {
        const navLinksContainer = document.querySelector('.nav-links');
        const navRight = document.getElementById('navRight');
        
        if (!navLinksContainer || !navRight) return;

        // Remove existing auth buttons to avoid duplicates
        const existingAuthButtons = navLinksContainer.querySelectorAll('.auth-nav-link');
        existingAuthButtons.forEach(btn => btn.remove());

        const isLoggedIn = authService.isLoggedIn();

        if (isLoggedIn) {
            // Show Logout
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'auth-nav-link logout-link';
            logoutBtn.innerHTML = '<span>Logout</span>';
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                authService.logout();
            };
            navLinksContainer.appendChild(logoutBtn);
        } else {
            // Show Sign In & Sign Up
            const signInBtn = document.createElement('a');
            signInBtn.href = 'signin.html';
            signInBtn.className = 'auth-nav-link';
            signInBtn.textContent = 'Sign In';
            
            const signUpBtn = document.createElement('a');
            signUpBtn.href = 'signup.html';
            signUpBtn.className = 'auth-nav-link';
            signUpBtn.textContent = 'Sign Up';

            navLinksContainer.appendChild(signInBtn);
            navLinksContainer.appendChild(signUpBtn);
        }
    },

    init() {
        // Handle redirect result for mobile users
        authService.handleRedirectResult();

        authService.onAuthChange((user) => {
            this.updateNavbar();
            
            if (user) {
                console.log("User logged in, syncing data...");
                if (window.syncService) {
                    window.syncService.syncCloudToLocal();
                }
                window.dispatchEvent(new CustomEvent('authChanged', { detail: { user } }));
                // Hide any existing prompts
                const prompt = document.getElementById('one-tap-prompt');
                if (prompt) prompt.remove();
            } else {
                // Show Google One Tap style prompt on first visit if not logged in
                setTimeout(() => this.showGoogleOneTapPrompt(), 2000);
            }
        });

        // Listener for blocked saves
        window.addEventListener('showSignInPrompt', (e) => {
            this.showBlockedSaveModal(e.detail.title, e.detail.message);
        });

        // Inject CSS for prompts
        this.injectPromptStyles();
    },

    showGoogleOneTapPrompt() {
        if (sessionStorage.getItem('one-tap-dismissed') || authService.isLoggedIn()) return;

        const prompt = document.createElement('div');
        prompt.id = 'one-tap-prompt';
        prompt.className = 'one-tap-container glass-panel';
        prompt.innerHTML = `
            <div class="one-tap-header">
                <div class="one-tap-logo">⚡</div>
                <div class="one-tap-title">Sign in to Infinity Kit</div>
                <button class="one-tap-close" onclick="this.parentElement.parentElement.remove(); sessionStorage.setItem('one-tap-dismissed', 'true');">&times;</button>
            </div>
            <div class="one-tap-body">
                <p>Sync your tasks and tools across all your devices.</p>
                <button class="google-btn-mini" id="one-tap-google-btn">
                    <svg viewBox="0 0 48 48" width="18" height="18"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path></svg>
                    Continue as Google User
                </button>
            </div>
        `;
        document.body.appendChild(prompt);

        document.getElementById('one-tap-google-btn').onclick = () => {
            authService.loginWithGoogle().then(() => prompt.remove());
        };
    },

    showBlockedSaveModal(title, message) {
        // Simple alert for now, but can be a pretty modal
        if (confirm(`${title}\n\n${message}\n\nWould you like to Sign In now?`)) {
            window.location.href = window.location.pathname.includes('/tools/') ? '../signin.html' : 'signin.html';
        }
    },

    injectPromptStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .one-tap-container {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                padding: 15px;
                z-index: 10000;
                animation: slideInRight 0.5s ease-out;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .one-tap-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 12px;
            }
            .one-tap-logo { font-size: 1.2rem; }
            .one-tap-title { font-weight: 600; font-size: 0.95rem; flex: 1; }
            .one-tap-close {
                background: none;
                border: none;
                color: var(--text-color);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0 5px;
                opacity: 0.6;
            }
            .one-tap-close:hover { opacity: 1; }
            .one-tap-body p {
                font-size: 0.85rem;
                margin-bottom: 15px;
                opacity: 0.8;
            }
            .google-btn-mini {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 10px;
                background: white;
                color: #3c4043;
                border: 1px solid #dadce0;
                border-radius: 4px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.2s;
            }
            .google-btn-mini:hover { background: #f8f9fa; }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
};

// Auto-init if we're in a browser environment
if (typeof window !== 'undefined') {
    authUI.init();
}
