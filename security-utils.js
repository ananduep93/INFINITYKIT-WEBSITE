/**
 * INFINITY KIT - Security Utilities (Global Script Version)
 * Handles input sanitization, generic error handling, and security monitoring.
 */

(function() {
    // Create a global SecurityUtils object
    window.SecurityUtils = {
        /**
         * Sanitize user input to prevent XSS
         */
        sanitize(text) {
            if (typeof text !== 'string') return '';
            // If DOMPurify is loaded via script tag
            if (window.DOMPurify) {
                return window.DOMPurify.sanitize(text.trim());
            }
            return text.trim(); // Fallback if not loaded
        },

        /**
         * Generic error handler for production
         */
        handleError(error, context = 'General') {
            console.error(`[${context}] Error:`, error);
            const message = "An unexpected error occurred. Please try again later.";
            if (window.Sentry) {
                window.Sentry.captureException(error);
            }
            return message;
        },

        /**
         * Simple Rate Limiting for UI Actions
         */
        rateLimit(key, maxRequests = 5, windowMs = 60000) {
            const now = Date.now();
            const logs = JSON.parse(localStorage.getItem('security_logs') || '{}');
            if (!logs[key]) logs[key] = [];
            logs[key] = logs[key].filter(timestamp => now - timestamp < windowMs);
            if (logs[key].length >= maxRequests) return false;
            logs[key].push(now);
            localStorage.setItem('security_logs', JSON.stringify(logs));
            return true;
        }
    };

    // Global Error Catcher
    window.onerror = function(message, source, lineno, colno, error) {
        if (window.APP_CONFIG && window.APP_CONFIG.ENV === 'production') {
            if (window.showToast) window.showToast("System encountered an issue. Our team is notified.", "error");
            return true;
        }
        return false;
    };

    window.onunhandledrejection = function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        if (window.APP_CONFIG && window.APP_CONFIG.ENV === 'production') return true;
    };
})();
