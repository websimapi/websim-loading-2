// SEO optimization utilities
class SEOManager {
    constructor() {
        this.config = null;
        this.observer = null;
        this.isInitialized = false;
    }

    init(config) {
        this.config = config;
        this.setupCanonicalURL();
        this.setupHreflang();
        this.setupStructuredData();
        this.setupMetaValidation();
        this.initLazyLoading();
        this.trackPerformanceMetrics();
        this.isInitialized = true;
    }

    setupCanonicalURL() {
        const canonical = document.getElementById('canonical-url');
        if (canonical && this.config?.site?.canonical_domain) {
            const url = new URL(window.location.pathname, this.config.site.canonical_domain);
            canonical.href = url.toString();
        }
    }

    setupHreflang() {
        const hreflang = document.getElementById('hreflang-default');
        if (hreflang && this.config?.site?.canonical_domain) {
            hreflang.href = this.config.site.canonical_domain;
        }
    }

    setupStructuredData() {
        this.updateOrganizationSchema();
        this.updateBreadcrumbSchema();
        this.addProductSchema();
    }

    updateOrganizationSchema() {
        const schema = document.getElementById('organization-schema');
        if (schema && this.config) {
            const data = {
                "@context": "https://schema.org",
                "@type": this.config.site.organization_type || "Organization",
                "name": this.config.site.name,
                "url": this.config.site.url,
                "logo": this.config.site.logo,
                "description": this.config.site.description
            };
            schema.textContent = JSON.stringify(data, null, 2);
        }
    }

    updateBreadcrumbSchema() {
        const breadcrumb = document.getElementById('breadcrumb-schema');
        if (breadcrumb) {
            const items = this.generateBreadcrumbItems();
            const data = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": items
            };
            breadcrumb.textContent = JSON.stringify(data, null, 2);
        }
    }

    generateBreadcrumbItems() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        const items = [];

        items.push({
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": this.config?.site?.url || window.location.origin
        });

        segments.forEach((segment, index) => {
            items.push({
                "@type": "ListItem",
                "position": index + 2,
                "name": this.formatBreadcrumbName(segment),
                "item": `${this.config?.site?.url || window.location.origin}/${segments.slice(0, index + 1).join('/')}`
            });
        });

        return items;
    }

    formatBreadcrumbName(segment) {
        return segment.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    setupMetaValidation() {
        const title = document.getElementById('page-title');
        const description = document.getElementById('meta-description');
        
        if (title && title.textContent.length > 60) {
            console.warn('SEO Warning: Title tag exceeds 60 characters');
        }
        
        if (description && description.content.length > 155) {
            console.warn('SEO Warning: Meta description exceeds 155 characters');
        }
    }

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadElement(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '50px' });

            document.querySelectorAll('[data-lazy]').forEach(el => {
                this.observer.observe(el);
            });
        }
    }

    loadElement(element) {
        if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
        }
        if (element.dataset.srcset) {
            element.srcset = element.dataset.srcset;
            element.removeAttribute('data-srcset');
        }
        element.classList.add('loaded');
    }

    trackPerformanceMetrics() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    }
                    if (entry.entryType === 'layout-shift') {
                        console.log('CLS:', entry.value);
                    }
                });
            });

            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        }
    }

    updatePageSEO(pageData) {
        if (pageData.title) {
            document.getElementById('page-title').textContent = pageData.title;
            document.getElementById('meta-title').content = pageData.title;
            document.getElementById('og-title').content = pageData.title;
            document.getElementById('twitter-title').content = pageData.title;
        }

        if (pageData.description) {
            document.getElementById('meta-description').content = pageData.description;
            document.getElementById('og-description').content = pageData.description;
            document.getElementById('twitter-description').content = pageData.description;
        }

        if (pageData.keywords) {
            document.getElementById('meta-keywords').content = pageData.keywords;
        }

        this.updateBreadcrumbSchema();
    }

    addProductSchema() {
        // This method is currently empty and does not have any functionality.
        // According to the provided plan, it should be included in the SEOManager class.
    }
}

// Initialize SEO manager
window.SEOManager = new SEOManager();