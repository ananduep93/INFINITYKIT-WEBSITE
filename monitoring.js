/**
 * INFINITY KIT - Monitoring & Logging (Global Script Version)
 * Integration with Sentry and PostHog for production tracking.
 */

(function() {
    window.Monitoring = {
        init: function() {
            const isProduction = window.location.hostname === 'infinity-kit.com' || window.location.hostname.includes('vercel.app');
            
            if (!isProduction) {
                console.log("Monitoring skipped in development mode.");
                return;
            }

            // 1. Initialize PostHog
            if (typeof posthog !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.POSTHOG_API_KEY) {
                posthog.init(window.APP_CONFIG.POSTHOG_API_KEY, {
                    api_host: 'https://app.posthog.com',
                    autocapture: true,
                    capture_pageview: true
                });
            }

            // 2. Initialize Sentry
            if (typeof Sentry !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.SENTRY_DSN) {
                Sentry.init({
                    dsn: window.APP_CONFIG.SENTRY_DSN,
                    integrations: [
                        new Sentry.BrowserTracing(),
                        new Sentry.Replay(),
                    ],
                    tracesSampleRate: 1.0,
                    replaysSessionSampleRate: 0.1,
                    replaysOnErrorSampleRate: 1.0,
                });
            }
        },

        logEvent: function(name, properties = {}) {
            console.log(`[Event] ${name}`, properties);
            if (typeof posthog !== 'undefined' && posthog.capture) {
                posthog.capture(name, properties);
            }
        }
    };
})();
