/**
 * Premium Cookie Management System
 * Infinity Kit - Privacy-First & Legal Compliance
 */

(function() {
    'use strict';

    const COOKIE_SETTINGS_KEY = 'infinity_kit_cookie_consent';
    const POLICY_LINKS = {
        privacy: 'privacy-policy.html',
        cookies: 'cookie-policy.html'
    };

    const categories = [
        {
            id: 'essential',
            name: 'Essential Cookies',
            description: 'These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences or logging in.',
            required: true
        },
        {
            id: 'analytics',
            name: 'Analytics Cookies',
            description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular.',
            required: false
        },
        {
            id: 'marketing',
            name: 'Marketing Cookies',
            description: 'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.',
            required: false
        },
        {
            id: 'preferences',
            name: 'Preference Cookies',
            description: 'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.',
            required: false
        }
    ];

    class CookieManager {
        constructor() {
            this.consent = this.loadConsent();
            this.init();
        }

        loadConsent() {
            const saved = localStorage.getItem(COOKIE_SETTINGS_KEY);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    return null;
                }
            }
            return null;
        }

        saveConsent(consentObj) {
            const consent = {
                ...consentObj,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(COOKIE_SETTINGS_KEY, JSON.stringify(consent));
            this.consent = consent;
            this.applyConsent();
            this.hideBanner();
            this.hideModal();
        }

        init() {
            if (!this.consent) {
                // Wait for DOM to ensure body is available
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => this.showBanner());
                } else {
                    this.showBanner();
                }
            } else {
                this.applyConsent();
            }

            // Create Modal on demand
            this.createModal();
            this.setupFooterLink();
        }

        applyConsent() {
            if (!this.consent) return;

            // Trigger events for other scripts to know consent changed
            window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: this.consent }));

            // Handle script tags with custom data-cookie-category
            const scripts = document.querySelectorAll('script[type="text/plain"][data-cookie-category]');
            scripts.forEach(script => {
                const category = script.getAttribute('data-cookie-category');
                if (this.consent[category]) {
                    this.executeScript(script);
                }
            });

            // Special handling for GTM if needed
            if (this.consent.analytics && window.gtag) {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted'
                });
            }
            
            if (this.consent.marketing && window.gtag) {
                gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted'
                });
            }
        }

        executeScript(oldScript) {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => {
                if (attr.name !== 'type') {
                    newScript.setAttribute(attr.name, attr.value);
                }
            });
            newScript.innerHTML = oldScript.innerHTML;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        }

        showBanner() {
            if (document.getElementById('cookie-consent-banner')) return;

            const banner = document.createElement('div');
            banner.id = 'cookie-consent-banner';
            banner.innerHTML = `
                <div class="cookie-content">
                    <h3><span style="font-size: 1.4em;">🍪</span> We value your privacy</h3>
                    <p>We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. <a href="${POLICY_LINKS.cookies}">Read our Cookie Policy</a></p>
                </div>
                <div class="cookie-actions">
                    <button class="cookie-btn cookie-btn-secondary" id="cookie-settings-btn">Customize Settings</button>
                    <button class="cookie-btn cookie-btn-secondary" id="cookie-reject-btn">Reject All</button>
                    <button class="cookie-btn cookie-btn-primary" id="cookie-accept-all-btn">Accept All</button>
                </div>
            `;
            document.body.appendChild(banner);

            // Animate in
            setTimeout(() => banner.classList.add('show'), 100);

            // Listeners
            document.getElementById('cookie-accept-all-btn').onclick = () => {
                this.saveConsent({ essential: true, analytics: true, marketing: true, preferences: true });
            };

            document.getElementById('cookie-reject-btn').onclick = () => {
                this.saveConsent({ essential: true, analytics: false, marketing: false, preferences: false });
            };

            document.getElementById('cookie-settings-btn').onclick = () => {
                this.showModal();
            };
        }

        hideBanner() {
            const banner = document.getElementById('cookie-consent-banner');
            if (banner) {
                banner.classList.remove('show');
                setTimeout(() => banner.remove(), 600);
            }
        }

        createModal() {
            if (document.getElementById('cookie-settings-modal')) return;

            const modal = document.createElement('div');
            modal.id = 'cookie-settings-modal';
            
            let categoriesHtml = categories.map(cat => `
                <div class="cookie-category">
                    <div class="category-header">
                        <span class="category-title">${cat.name}</span>
                        <label class="switch">
                            <input type="checkbox" id="cookie-cat-${cat.id}" ${cat.required ? 'checked disabled' : ''} ${this.consent && this.consent[cat.id] ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <p class="category-description">${cat.description}</p>
                </div>
            `).join('');

            modal.innerHTML = `
                <div class="cookie-modal-container">
                    <div class="cookie-modal-header">
                        <h2>Cookie Settings</h2>
                        <button class="cookie-modal-close">&times;</button>
                    </div>
                    <div class="cookie-modal-body">
                        <p style="margin-bottom: 20px; font-size: 0.9rem; color: var(--cookie-text-secondary);">Customize your preferences for how we use cookies on this site. You can change these settings at any time.</p>
                        ${categoriesHtml}
                    </div>
                    <div class="cookie-modal-footer">
                        <button class="cookie-btn cookie-btn-secondary" id="cookie-modal-save-current">Save My Choices</button>
                        <button class="cookie-btn cookie-btn-primary" id="cookie-modal-accept-all">Accept All</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Listeners
            modal.querySelector('.cookie-modal-close').onclick = () => this.hideModal();
            modal.onclick = (e) => { if (e.target === modal) this.hideModal(); };

            document.getElementById('cookie-modal-accept-all').onclick = () => {
                this.saveConsent({ essential: true, analytics: true, marketing: true, preferences: true });
            };

            document.getElementById('cookie-modal-save-current').onclick = () => {
                const newConsent = {};
                categories.forEach(cat => {
                    newConsent[cat.id] = document.getElementById(`cookie-cat-${cat.id}`).checked;
                });
                this.saveConsent(newConsent);
            };
        }

        showModal() {
            const modal = document.getElementById('cookie-settings-modal');
            if (modal) {
                // Sync checkboxes with current consent
                if (this.consent) {
                    categories.forEach(cat => {
                        const cb = document.getElementById(`cookie-cat-${cat.id}`);
                        if (cb && !cat.required) {
                            cb.checked = this.consent[cat.id];
                        }
                    });
                }
                modal.style.display = 'flex';
                setTimeout(() => modal.classList.add('show'), 10);
            }
        }

        hideModal() {
            const modal = document.getElementById('cookie-settings-modal');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.style.display = 'none', 300);
            }
        }

        setupFooterLink() {
            // Check if footer exists and add link
            const footerLinks = document.querySelector('.footer-links');
            if (footerLinks) {
                const cookieLink = document.createElement('a');
                cookieLink.href = '#';
                cookieLink.innerText = 'Cookie Settings';
                cookieLink.onclick = (e) => {
                    e.preventDefault();
                    this.showModal();
                };
                footerLinks.appendChild(cookieLink);
            }
        }
    }

    // Initialize the manager
    window.InfinityCookieManager = new CookieManager();

})();
