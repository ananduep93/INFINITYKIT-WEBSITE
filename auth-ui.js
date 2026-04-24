import { authService } from './auth.js';
import { syncService } from './sync.js';

export const authUI = {
    updateNavbar() {
        const navLinksContainer = document.querySelector('.nav-links');
        const navRight = document.getElementById('navRight');
        
        if (!navLinksContainer || !navRight) return;

        // Remove existing auth elements to avoid duplicates
        const existingAuth = document.querySelectorAll('.auth-nav-item, .profile-badge');
        existingAuth.forEach(el => el.remove());

        const isLoggedIn = authService.isLoggedIn();
        const user = authService.getCurrentUser();

        if (isLoggedIn && user) {
            // Show Profile Badge instead of just a logout link
            const profileBadge = document.createElement('div');
            profileBadge.className = 'profile-badge';
            
            const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
            const photoURL = user.photoURL;

            profileBadge.innerHTML = `
                <div class="profile-info">
                    <div class="profile-avatar">
                        ${photoURL ? `<img src="${photoURL}" alt="Profile">` : `<span>${userInitial}</span>`}
                    </div>
                    <div class="profile-details">
                        <span class="profile-name">${user.displayName || 'Infinity User'}</span>
                        <span class="profile-email">${user.email}</span>
                    </div>
                </div>
                <button class="profile-logout-btn" title="Logout">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"/></svg>
                </button>
            `;

            profileBadge.querySelector('.profile-logout-btn').onclick = (e) => {
                e.preventDefault();
                authService.logout();
            };

            // Insert before settings button
            const settingsBtn = document.getElementById('settingsBtn');
            navRight.insertBefore(profileBadge, settingsBtn);
        } else {
            // Show Sign In & Sign Up
            const authContainer = document.createElement('div');
            authContainer.className = 'auth-nav-item';
            
            const signInBtn = document.createElement('a');
            signInBtn.href = 'signin.html';
            signInBtn.className = 'auth-nav-link signin-link';
            signInBtn.textContent = 'Sign In';
            
            const signUpBtn = document.createElement('a');
            signUpBtn.href = 'signup.html';
            signUpBtn.className = 'auth-nav-link signup-link';
            signUpBtn.textContent = 'Sign Up';

            authContainer.appendChild(signInBtn);
            authContainer.appendChild(signUpBtn);
            navLinksContainer.appendChild(authContainer);
        }
    },

    init() {
        // Handle redirect result for mobile users
        this.handleMobileRedirect();

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

    async handleMobileRedirect() {
        try {
            // Check if we are potentially returning from a redirect
            if (window.location.hash.includes('id_token') || window.location.hash.includes('access_token') || localStorage.getItem('isLoggedIn') === 'loading') {
                this.showToast('Processing your login... please wait ⚡', 'info');
            }

            const user = await authService.handleRedirectResult();
            if (user) {
                this.showToast('Successfully signed in with Google! 🚀', 'success');
            }
        } catch (error) {
            console.error("Redirect error:", error);
        }
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `ik-toast ik-toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;
        document.body.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('ik-toast-fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    },

    showBlockedSaveModal(title, message) {
        // Use toast instead of confirm for a better feel
        this.showToast(message, 'info');
        setTimeout(() => {
            if (confirm(`Would you like to Sign In now to save your data?`)) {
                window.location.href = window.location.pathname.includes('/tools/') ? '../signin.html' : 'signin.html';
            }
        }, 1000);
    },

    injectPromptStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ik-toast {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                border-radius: 12px;
                background: rgba(30, 31, 45, 0.9);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: white;
                z-index: 10001;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                animation: toastSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .ik-toast-success { border-left: 4px solid #4CAF50; }
            .ik-toast-error { border-left: 4px solid #F44336; }
            .ik-toast-fade-out { opacity: 0; transform: translate(-50%, 20px); transition: all 0.5s; }
            .toast-content { display: flex; align-items: center; gap: 12px; }
            .toast-icon { font-size: 1.2rem; }
            .toast-message { font-weight: 500; font-size: 0.95rem; }

            @keyframes toastSlideUp {
                from { transform: translate(-50%, 100px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }

            .profile-badge {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 50px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                margin-right: 10px;
                transition: all 0.3s ease;
            }
            .profile-badge:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            .profile-info {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .profile-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: var(--primary-gradient);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 0.9rem;
                overflow: hidden;
                border: 2px solid rgba(255, 255, 255, 0.2);
            }
            .profile-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .profile-details {
                display: flex;
                flex-direction: column;
                max-width: 120px;
            }
            .profile-name {
                font-size: 0.85rem;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .profile-email {
                font-size: 0.7rem;
                opacity: 0.6;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .profile-logout-btn {
                background: none;
                border: none;
                color: #ff4b2b;
                cursor: pointer;
                padding: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
                opacity: 0.8;
            }
            .profile-logout-btn:hover {
                background: rgba(255, 75, 43, 0.1);
                opacity: 1;
            }

            .auth-nav-item {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .signup-link {
                background: var(--primary-gradient);
                padding: 8px 16px !important;
                border-radius: 8px;
                font-weight: 600 !important;
                color: white !important;
            }
            .signup-link:hover {
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                transform: translateY(-1px);
            }

            @media (max-width: 768px) {
                .profile-badge {
                    margin: 10px 0;
                    width: 100%;
                    justify-content: space-between;
                }
                .profile-details {
                    max-width: 200px;
                }
                .auth-nav-item {
                    flex-direction: column;
                    width: 100%;
                    gap: 5px;
                }
                .auth-nav-link {
                    width: 100%;
                    text-align: center;
                }
            }

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
