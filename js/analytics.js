/**
 * Golden Maple Analytics & Tracking
 * Lightweight, privacy-focused tracking for Fathom/Plausible + Custom Events
 */

(function() {
    // 1. Analytics Setup (Lightweight & Privacy-Focused)
    // Placeholder for Fathom/Plausible integration
    // To activate, replace the data-site ID with the production ID
    /*
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-site', 'YOUR_SITE_ID');
    script.src = 'https://cdn.usefathom.com/script.js';
    document.head.appendChild(script);
    */

    // 2. Heatmap & Scroll-Depth Preparation (Lead Form)
    const leadForm = document.getElementById('intake-form');
    if (leadForm) {
        // Track form visibility / high-intent start
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    trackEvent('Lead Form Viewed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(leadForm);

        // Track Wizard Step Progression (for contact.html)
        // Use a slight delay to ensure the function is defined if loaded out of order
        setTimeout(() => {
            if (typeof window.nextStep === 'function') {
                const originalNextStep = window.nextStep;
                window.nextStep = function(current) {
                    trackEvent(`Lead Wizard Step ${current} Complete`);
                    return originalNextStep.apply(this, arguments);
                };
            }
        }, 500);

        // Track Stealth Lead Form (for index.html)
        if (leadForm.name === 'stealth-lead') {
            leadForm.addEventListener('submit', () => {
                trackEvent('Stealth Lead Submitted');
            });
        }
    }

    // 3. Custom Event Triggers ('Pricing Guide' PDF Click/Download)
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        const text = link.innerText.toLowerCase();

        // Detect Pricing Guide PDF clicks
        if (href.endsWith('.pdf') && (text.includes('pricing') || text.includes('guide') || text.includes('calculator'))) {
            trackEvent('PDF Download', {
                label: text.trim(),
                path: href
            });
        }

        // Detect high-intent CTA clicks
        if (link.classList.contains('btn') && (text.includes('quote') || text.includes('calculator'))) {
            trackEvent('CTA Click', {
                label: text.trim()
            });
        }
    });

    /**
     * Utility to track events across different platforms
     * (Fathom, Plausible, or custom logging)
     */
    function trackEvent(name, props = {}) {
        console.log(`[Analytics] Event: ${name}`, props);

        // Fathom
        if (window.fathom) {
            window.fathom.trackGoal('EVENT_ID_MAP', 0); // Need to map names to IDs
        }

        // Plausible
        if (window.plausible) {
            window.plausible(name, { props: props });
        }

        // Google Tag Manager (Backup/Existing)
        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'custom_event',
                'event_category': 'Engagement',
                'event_action': name,
                'event_label': props.label || props.path || ''
            });
        }
    }

    // Export for use in other scripts if needed
    window.gmTrackEvent = trackEvent;

})();
