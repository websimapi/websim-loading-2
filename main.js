// Main application initialization
class TemplateApp {
    constructor() {
        this.config = null;
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.loadingProgress = 0;
        this.loadingSteps = [
            'Loading configuration...',
            'Setting up components...',
            'Initializing accessibility...',
            'Optimizing performance...',
            'Ready!'
        ];
    }

    async init() {
        try {
            this.updateLoadingProgress(0, this.loadingSteps[0]);
            
            // Load configuration
            this.config = await TemplateUtils.loadJSON('config.json');
            this.updateLoadingProgress(20, this.loadingSteps[1]);
            
            // Initialize SEO
            if (window.SEOManager) {
                window.SEOManager.init(this.config);
            }
            this.updateLoadingProgress(40, this.loadingSteps[2]);
            
            // Initialize accessibility
            if (window.AccessibilityManager) {
                window.AccessibilityManager.init(this.config);
            }
            this.updateLoadingProgress(60, this.loadingSteps[3]);
            
            // Setup components
            await this.setupComponents();
            this.updateLoadingProgress(80, this.loadingSteps[4]);
            
            // Initialize performance monitoring
            this.initPerformanceMonitoring();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            TemplateUtils.hideLoading();
            
            // Trigger custom event for other scripts
            window.dispatchEvent(new CustomEvent('templateReady', { 
                detail: { config: this.config } 
            }));
            
        } catch (error) {
            this.handleInitError(error);
        }
    }

    updateLoadingProgress(progress, text) {
        this.loadingProgress = progress;
        const progressBar = document.getElementById('progress-bar');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (loadingText && text) {
            loadingText.textContent = text;
        }
    }

    initPerformanceMonitoring() {
        // Enhanced performance monitoring
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.logPerformanceMetric(entry);
                });
            });
            
            try {
                observer.observe({ entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint'] });
            } catch (e) {
                console.warn('Performance observer not fully supported:', e);
            }
        }
    }

    logPerformanceMetric(entry) {
        const metrics = {
            navigation: () => console.log('Navigation timing:', entry),
            resource: () => {
                if (entry.duration > 1000) {
                    console.warn('Slow resource loading:', entry.name, entry.duration + 'ms');
                }
            },
            paint: () => console.log(entry.name + ':', entry.startTime + 'ms'),
            'largest-contentful-paint': () => console.log('LCP:', entry.startTime + 'ms')
        };
        
        const handler = metrics[entry.entryType];
        if (handler) handler();
    }

    async setupComponents() {
        // Update meta tags
        TemplateUtils.updateMetaTags(this.config);
        
        // Update site name in header
        const siteName = document.getElementById('site-name');
        if (siteName) {
            siteName.textContent = this.config.site.name;
        }
        
        // Create navigation
        TemplateUtils.createNavigation(this.config.navigation);
        
        // Create hero section
        TemplateUtils.createHeroSection(this.config.hero);
        
        // Create main content
        TemplateUtils.createContent(this.config.content);
        
        // Create footer
        TemplateUtils.createFooter(this.config.footer);
    }

    setupEventListeners() {
        // Window resize handler
        const handleResize = TemplateUtils.debounce(() => {
            this.handleResize();
        }, 250);
        
        window.addEventListener('resize', handleResize);
        
        // Navigation toggle for mobile
        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', this.toggleMobileNav.bind(this));
        }
        
        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.main-navigation')) {
                this.closeMobileNav();
            }
        });
        
        // Escape key to close mobile nav
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileNav();
            }
        });
        
        // Handle form submissions with error handling
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        // Handle image loading errors
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);
        
        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', this.trackPerformance.bind(this));
        }
    }

    handleInitError(error) {
        this.retryCount++;
        
        if (this.retryCount <= this.maxRetries) {
            console.warn(`Initialization failed, retrying (${this.retryCount}/${this.maxRetries}):`, error);
            setTimeout(() => this.init(), 1000 * this.retryCount);
        } else {
            TemplateUtils.handleErrors(error, 'Initialization');
        }
    }

    handleResize() {
        // Close mobile nav on resize to desktop
        if (window.innerWidth > 768) {
            this.closeMobileNav();
        }
        
        // Trigger custom resize event
        window.dispatchEvent(new CustomEvent('templateResize', {
            detail: { 
                width: window.innerWidth, 
                height: window.innerHeight 
            }
        }));
    }

    toggleMobileNav() {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        
        if (navMenu && navToggle) {
            const isOpen = navMenu.classList.contains('active');
            
            if (isOpen) {
                this.closeMobileNav();
            } else {
                this.openMobileNav();
            }
        }
    }

    openMobileNav() {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        
        if (navMenu && navToggle) {
            navMenu.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
            document.body.classList.add('nav-open');
            
            // Focus first menu item for accessibility
            const firstLink = navMenu.querySelector('.nav-link');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }
        }
    }

    closeMobileNav() {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        
        if (navMenu && navToggle) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
        }
    }

    handleFormSubmit(e) {
        const form = e.target;
        if (!form.matches('form')) return;
        
        // Add loading state to submit button
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent || submitBtn.value;
            submitBtn.textContent = 'Processing...';
            
            // Reset after timeout as fallback
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 10000);
        }
    }

    handleImageError(img) {
        // Provide fallback for broken images
        if (!img.dataset.fallbackApplied) {
            img.dataset.fallbackApplied = 'true';
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f0f0f0"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';
            img.alt = 'Image not available';
        }
    }

    trackPerformance() {
        try {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            console.log('Performance metrics:', {
                loadTime: `${loadTime}ms`,
                domContentLoaded: `${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`,
                firstContentfulPaint: this.getFirstContentfulPaint()
            });
            
            // Send to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: Math.round(loadTime),
                    custom_map: { metric1: 'load_time' }
                });
            }
        } catch (error) {
            console.warn('Performance tracking failed:', error);
        }
    }

    getFirstContentfulPaint() {
        try {
            const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
            return fcpEntry ? `${Math.round(fcpEntry.startTime)}ms` : 'Not available';
        } catch (error) {
            return 'Not available';
        }
    }

    // Public API methods
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.setupComponents();
    }

    getConfig() {
        return this.config;
    }

    refresh() {
        this.isInitialized = false;
        this.retryCount = 0;
        this.init();
    }
}

// Initialize the application
const app = new TemplateApp();

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Make app globally available for debugging and extensions
window.TemplateApp = app;

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    TemplateUtils.handleErrors(e.reason, 'Promise');
});

// Handle global errors
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    TemplateUtils.handleErrors(e.error, 'Global');
});