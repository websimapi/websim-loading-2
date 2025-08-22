// Advanced accessibility features
class AccessibilityManager {
    constructor() {
        this.config = null;
        this.focusableElements = [];
        this.announcer = null;
        this.keyboardHandler = new KeyboardNavigationHandler();
    }

    init(config) {
        this.config = config;
        this.announcer = document.getElementById('announcements');
        this.setupFocusManagement();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupHighContrast();
        this.setupReducedMotion();
        this.setupFontScaling();
        this.monitorAccessibility();
    }

    setupFocusManagement() {
        // Enhanced focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Focus trap for modals
        this.setupFocusTraps();
    }

    setupFocusTraps() {
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(e, modal);
                }
                if (e.key === 'Escape') {
                    this.closeModal(modal);
                }
            });
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    setupKeyboardNavigation() {
        this.keyboardHandler.init();
        
        // Skip links enhancement
        const skipLinks = document.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                    this.announce(`Skipped to ${target.getAttribute('aria-label') || targetId}`);
                }
            });
        });
    }

    setupScreenReaderSupport() {
        // Live regions for dynamic content
        this.setupLiveRegions();
        
        // Enhanced ARIA labels
        this.enhanceAriaLabels();
        
        // Progress announcements
        this.setupProgressAnnouncements();
    }

    setupLiveRegions() {
        const liveRegions = document.querySelectorAll('[aria-live]');
        liveRegions.forEach(region => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length) {
                        const newContent = Array.from(mutation.addedNodes)
                            .filter(node => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE)
                            .map(node => node.textContent)
                            .join(' ');
                        
                        if (newContent.trim()) {
                            this.announce(newContent);
                        }
                    }
                });
            });
            
            observer.observe(region, { childList: true, subtree: true });
        });
    }

    enhanceAriaLabels() {
        // Auto-generate ARIA labels for common elements
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (!button.textContent.trim() && button.querySelector('svg, img')) {
                button.setAttribute('aria-label', 'Button');
            }
        });

        const links = document.querySelectorAll('a:not([aria-label]):not([aria-labelledby])');
        links.forEach(link => {
            if (!link.textContent.trim() && link.querySelector('img')) {
                const img = link.querySelector('img');
                if (img.alt) {
                    link.setAttribute('aria-label', img.alt);
                }
            }
        });
    }

    setupProgressAnnouncements() {
        const progressBars = document.querySelectorAll('[role="progressbar"]');
        progressBars.forEach(bar => {
            const observer = new MutationObserver(() => {
                const value = bar.getAttribute('aria-valuenow');
                const max = bar.getAttribute('aria-valuemax');
                if (value && max) {
                    const percentage = Math.round((parseInt(value) / parseInt(max)) * 100);
                    this.announce(`Progress: ${percentage}%`);
                }
            });
            
            observer.observe(bar, { attributes: true, attributeFilter: ['aria-valuenow'] });
        });
    }

    setupHighContrast() {
        if (this.config?.accessibility?.high_contrast_mode) {
            document.body.classList.add('high-contrast');
        }

        // Detect system preference
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }

    setupReducedMotion() {
        if (this.config?.accessibility?.reduced_motion || 
            (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
            document.body.classList.add('reduced-motion');
        }
    }

    setupFontScaling() {
        const scale = this.config?.accessibility?.font_scaling || 1.0;
        if (scale !== 1.0) {
            document.documentElement.style.fontSize = `${scale}rem`;
        }
    }

    announce(message, priority = 'polite') {
        if (this.announcer) {
            this.announcer.setAttribute('aria-live', priority);
            this.announcer.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                this.announcer.textContent = '';
            }, 1000);
        }
    }

    monitorAccessibility() {
        // Check for missing alt texts
        const images = document.querySelectorAll('img:not([alt])');
        if (images.length) {
            console.warn(`Accessibility: ${images.length} images missing alt text`);
        }

        // Check for missing form labels
        const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        inputs.forEach(input => {
            if (!input.labels || input.labels.length === 0) {
                console.warn('Accessibility: Input missing label', input);
            }
        });

        // Check color contrast (simplified)
        this.checkColorContrast();
    }

    checkColorContrast() {
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                // Basic contrast check would go here
                // This is a simplified placeholder
            }
        });
    }
}

class KeyboardNavigationHandler {
    constructor() {
        this.shortcuts = new Map();
    }

    init() {
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        this.setupShortcuts();
    }

    setupShortcuts() {
        // Common keyboard shortcuts
        this.shortcuts.set('Alt+1', () => this.focusElement('#main-content'));
        this.shortcuts.set('Alt+2', () => this.focusElement('.main-navigation'));
        this.shortcuts.set('Alt+3', () => this.focusElement('#content-section'));
        this.shortcuts.set('Alt+4', () => this.focusElement('.site-footer'));
    }

    handleKeydown(e) {
        const key = this.getKeyCombo(e);
        if (this.shortcuts.has(key)) {
            e.preventDefault();
            this.shortcuts.get(key)();
        }
    }

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        if (e.metaKey) parts.push('Meta');
        parts.push(e.key);
        return parts.join('+');
    }

    focusElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

window.AccessibilityManager = new AccessibilityManager();