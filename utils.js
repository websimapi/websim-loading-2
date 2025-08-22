// Utility functions for template system
class TemplateUtils {
    static async loadJSON(url) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, { 
                signal: controller.signal,
                cache: 'no-cache'
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Failed to load JSON from ${url}:`, error);
            return this.getDefaultConfig();
        }
    }

    static getDefaultConfig() {
        return {
            site: {
                name: "Default Site",
                title: "Default Title",
                description: "Default description",
                keywords: "default, template",
                author: "Unknown",
                url: window.location.origin,
                language: "en",
                theme_color: "#000000",
                background_color: "#ffffff"
            },
            navigation: [],
            hero: {
                heading: "Welcome",
                description: "Default description",
                actions: []
            },
            content: { sections: [] },
            footer: {
                text: "© 2024 All rights reserved.",
                links: []
            }
        };
    }

    static updateMetaTags(config) {
        const metaTags = [
            { id: 'page-title', content: config.site.title, isTitle: true },
            { id: 'meta-title', attr: 'content', content: config.site.title },
            { id: 'meta-description', attr: 'content', content: config.site.description },
            { id: 'meta-keywords', attr: 'content', content: config.site.keywords },
            { id: 'meta-author', attr: 'content', content: config.site.author },
            { id: 'og-url', attr: 'content', content: config.site.url },
            { id: 'og-title', attr: 'content', content: config.site.title },
            { id: 'og-description', attr: 'content', content: config.site.description },
            { id: 'og-image', attr: 'content', content: config.social?.og_image || '/images/default-og.jpg' },
            { id: 'og-site-name', attr: 'content', content: config.site.name },
            { id: 'twitter-url', attr: 'content', content: config.site.url },
            { id: 'twitter-title', attr: 'content', content: config.site.title },
            { id: 'twitter-description', attr: 'content', content: config.site.description },
            { id: 'twitter-image', attr: 'content', content: config.social?.og_image || '/images/default-og.jpg' },
            { id: 'twitter-creator', attr: 'content', content: config.social?.twitter_creator || '' },
            { id: 'theme-color', attr: 'content', content: config.site.theme_color },
            { id: 'tile-color', attr: 'content', content: config.site.theme_color },
            { id: 'app-title', attr: 'content', content: config.site.name }
        ];

        metaTags.forEach(tag => {
            const element = document.getElementById(tag.id);
            if (element) {
                if (tag.isTitle) {
                    element.textContent = tag.content;
                } else {
                    element.setAttribute(tag.attr, tag.content);
                }
            }
        });

        // Enhanced SEO meta tags
        const additionalTags = [
            { id: 'app-name', attr: 'content', content: config.site.name },
            { id: 'ms-tooltip', attr: 'content', content: config.site.description },
            { id: 'ms-starturl', attr: 'content', content: '/' },
            { id: 'ms-navbutton', attr: 'content', content: config.site.theme_color }
        ];

        additionalTags.forEach(tag => {
            const element = document.getElementById(tag.id);
            if (element) {
                element.setAttribute(tag.attr, tag.content);
            }
        });

        // Update RSS feed if available
        const rssFeed = document.getElementById('rss-feed');
        if (rssFeed && config.site.rss_feed) {
            rssFeed.href = config.site.rss_feed;
        }

        // Update structured data
        const structuredData = document.getElementById('structured-data');
        if (structuredData) {
            structuredData.textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": config.site.title,
                "description": config.site.description,
                "url": config.site.url
            });
        }
    }

    static createNavigation(navItems) {
        const navMenu = document.getElementById('nav-menu');
        if (!navMenu || !navItems) return;

        navMenu.innerHTML = navItems.map(item => `
            <li class="nav-item">
                <a href="${item.url}" class="nav-link ${item.active ? 'active' : ''}" 
                   ${item.url.startsWith('#') ? 'data-scroll' : ''}>
                    ${item.label}
                </a>
            </li>
        `).join('');
    }

    static createHeroSection(heroConfig) {
        const heading = document.getElementById('main-heading');
        const description = document.getElementById('main-description');
        const actions = document.getElementById('hero-actions');

        if (heading) heading.textContent = heroConfig.heading;
        if (description) description.textContent = heroConfig.description;
        
        if (actions && heroConfig.actions) {
            actions.innerHTML = heroConfig.actions.map(action => `
                <a href="${action.url}" class="btn btn-${action.type}" 
                   ${action.url.startsWith('#') ? 'data-scroll' : ''}>
                    ${action.label}
                </a>
            `).join('');
        }
    }

    static createContent(contentConfig) {
        const contentGrid = document.getElementById('content-grid');
        if (!contentGrid || !contentConfig?.sections) return;

        contentGrid.innerHTML = contentConfig.sections.map(section => `
            <div class="content-card">
                <div class="content-icon">${section.icon || '📄'}</div>
                <h3 class="content-title">${section.title}</h3>
                <p class="content-description">${section.description}</p>
            </div>
        `).join('');
    }

    static createFooter(footerConfig) {
        const footerText = document.getElementById('footer-text');
        const footerMenu = document.getElementById('footer-menu');

        if (footerText) footerText.textContent = footerConfig.text;
        
        if (footerMenu && footerConfig.links) {
            footerMenu.innerHTML = footerConfig.links.map(link => `
                <li class="footer-item">
                    <a href="${link.url}" class="footer-link">${link.label}</a>
                </li>
            `).join('');
        }
    }

    static handleErrors(error, context = 'Application') {
        console.error(`${context} error:`, error);
        
        const errorBoundary = document.getElementById('error-boundary');
        const errorMessage = document.getElementById('error-message');
        const loadingOverlay = document.getElementById('loading-overlay');
        
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        
        if (errorBoundary && errorMessage) {
            errorMessage.textContent = `${context} error: ${error.message || 'Unknown error occurred'}`;
            errorBoundary.style.display = 'flex';
        }
    }

    static showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
    }

    static hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }

    static initializeAccessibility() {
        // Focus management
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById('main-content');
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        }

        // Mobile navigation
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navMenu.classList.toggle('active');
                document.body.classList.toggle('nav-open');
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('[data-scroll]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static detectFeatures() {
        const features = {
            webp: this.supportsWebP(),
            avif: this.supportsAVIF(),
            intersection: 'IntersectionObserver' in window,
            serviceWorker: 'serviceWorker' in navigator,
            localStorage: this.supportsLocalStorage(),
            sessionStorage: this.supportsSessionStorage(),
            fetch: 'fetch' in window,
            promise: 'Promise' in window,
            customElements: 'customElements' in window
        };
        
        window.features = { ...window.features, ...features };
        return features;
    }

    static supportsWebP() {
        return window.features?.webp || false;
    }

    static supportsAVIF() {
        return window.features?.avif || false;
    }

    static supportsLocalStorage() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    static supportsSessionStorage() {
        try {
            const test = '__test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    static optimizeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            let src = img.dataset.src;
            
            // Use WebP/AVIF if supported
            if (this.supportsAVIF() && src.includes('.jpg') || src.includes('.png')) {
                src = src.replace(/\.(jpg|png)$/i, '.avif');
            } else if (this.supportsWebP() && src.includes('.jpg') || src.includes('.png')) {
                src = src.replace(/\.(jpg|png)$/i, '.webp');
            }
            
            img.src = src;
        });
    }

    static createResponsiveImage(src, alt, sizes = '100vw') {
        const img = document.createElement('img');
        img.alt = alt;
        img.loading = 'lazy';
        img.sizes = sizes;
        
        // Generate srcset for different resolutions
        const breakpoints = [480, 768, 1024, 1200];
        const srcset = breakpoints.map(width => {
            const extension = src.split('.').pop();
            const baseName = src.replace(`.${extension}`, '');
            return `${baseName}-${width}w.${extension} ${width}w`;
        }).join(', ');
        
        img.srcset = srcset;
        img.src = src; // fallback
        
        return img;
    }
}

// Make TemplateUtils globally available
window.TemplateUtils = TemplateUtils;