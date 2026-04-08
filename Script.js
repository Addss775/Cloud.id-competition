class NavbarController {
    constructor() {
        this.scrollSaver = { enabled: true };
        this.savedScrollY = 0;
        this.lastScrollY = 0;
        this.isTicking = false;
        
        this.init();
    }

    init() {
        this.cacheElements();
        
        if (!this.elements.burger || !this.elements.mobileMenu) {
            console.warn('❌ NavbarController: Required elements missing');
            return;
        }

        this.bindEvents();
        console.log('✅ NavbarController: Initialized - Mobile + Desktop Ready');
    }

    cacheElements() {
        this.elements = {
            // Core elements
            burger: document.querySelector('.burger'),
            mobileMenu: document.querySelector('.mobile-menu'),
            navbar: document.querySelector('.navbar'),
            overlay: document.querySelector('.mobile-overlay'), // ✅ Fixed class name
            menuCloseBtn: document.querySelector('.menu-close-btn'),
            
            // Dropdowns - separate mobile/desktop
            mobileDropdowns: document.querySelectorAll('.mobile-menu .dropdown'),
            desktopDropdowns: document.querySelectorAll('.desktop-menu .dropdown'),
            allDropdowns: document.querySelectorAll('.dropdown'),
            
            // Navigation links
            navLinks: document.querySelectorAll('.menu-link:not(.dropdown-toggle), .submenu a'),
            
            // Body & utilities
            body: document.body
        };
    }

    bindEvents() {
        // 1. MOBILE MENU TOGGLE
        this.elements.burger?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        this.elements.menuCloseBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeMobileMenu();
        });

        this.elements.overlay?.addEventListener('click', () => this.closeMobileMenu());

        // 2. MOBILE DROPDOWN - CLICK TO TOGGLE
        this.elements.mobileDropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleMobileDropdown(dropdown);
                });
            }
        });

        // 3. DESKTOP DROPDOWN - HOVER TO TOGGLE
        this.elements.desktopDropdowns.forEach(dropdown => {
            dropdown.addEventListener('mouseenter', () => {
                if (window.innerWidth > 1024) {
                    dropdown.classList.add('active');
                }
            });
            
            dropdown.addEventListener('mouseleave', () => {
                if (window.innerWidth > 1024) {
                    dropdown.classList.remove('active');
                }
            });
        });

        // 4. NAVIGATION LINKS - SMOOTH SCROLL
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e, link));
        });

        // 5. SCROLL & RESIZE EVENTS
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', () => this.onResize(), { passive: true });

        // 6. ESCAPE KEY CLOSE
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const isOpening = !this.elements.mobileMenu.classList.contains('active');
        
        // Save scroll position
        if (isOpening && this.scrollSaver.enabled) {
            this.savedScrollY = window.scrollY;
        }

        // Toggle all classes
        this.elements.mobileMenu.classList.toggle('active');
        this.elements.burger.classList.toggle('active');
        this.elements.overlay?.classList.toggle('active');
        this.elements.menuCloseBtn?.classList.toggle('show');
        this.elements.body.classList.toggle('menu-open');
    }

    closeMobileMenu() {
        // Close menu
        this.elements.mobileMenu.classList.remove('active');
        this.elements.burger?.classList.remove('active');
        this.elements.overlay?.classList.remove('active');
        this.elements.menuCloseBtn?.classList.remove('show');
        this.elements.body.classList.remove('menu-open');
        
        // Close all dropdowns
        this.elements.allDropdowns.forEach(dropdown => dropdown.classList.remove('active'));

        // Restore scroll
        if (this.scrollSaver.enabled && this.savedScrollY > 0) {
            setTimeout(() => {
                window.scrollTo(0, this.savedScrollY);
                this.savedScrollY = 0;
            }, 350);
        }
    }

    toggleMobileDropdown(targetDropdown) {
        // Close other mobile dropdowns
        this.elements.mobileDropdowns.forEach(dropdown => {
            if (dropdown !== targetDropdown) {
                dropdown.classList.remove('active');
            }
        });

        // Toggle target
        targetDropdown.classList.toggle('active');
    }

    handleNavClick(e, link) {
        const href = link.getAttribute('href');
        
        // Internal anchor links (#section)
        if (href?.startsWith('#') && href !== '#') {
            e.preventDefault();
            e.stopPropagation();

            const target = document.querySelector(href);
            if (target) {
                this.closeMobileMenu();
                
                // Smooth scroll after animation
                setTimeout(() => {
                    target.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 450); // Sinkron dengan submenu expand
            }
        } else {
            // External links
            this.closeMobileMenu();
        }
    }

    onScroll() {
        if (this.elements.body.classList.contains('menu-open')) return;

        if (!this.isTicking) {
            window.requestAnimationFrame(() => {
                this.handleScroll();
                this.isTicking = false;
            });
            this.isTicking = true;
        }
    }

    handleScroll() {
        const currentScrollY = window.scrollY;

        // Navbar hide/show logic
        if (currentScrollY > 100) {
            this.elements.navbar.classList.toggle(
                'hide', 
                currentScrollY > this.lastScrollY && !this.elements.body.classList.contains('menu-open')
            );
        } else {
            this.elements.navbar.classList.remove('hide');
        }

        // Back to top (if exists)
        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            backToTop.classList.toggle('show', currentScrollY > 500);
        }

        this.lastScrollY = currentScrollY;
    }

    onResize() {
        // Auto close mobile menu on desktop
        if (window.innerWidth > 1024) {
            this.closeMobileMenu();
        }
        
        // Rebind desktop hover if resized
        this.elements.desktopDropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    // Public API
    openMobileMenu() {
        this.toggleMobileMenu();
    }

    closeAll() {
        this.closeMobileMenu();
    }

    destroy() {
        // Cleanup
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener('keydown', this.keydownHandler);
        console.log('🧹 NavbarController: Destroyed');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.navbarController = new NavbarController();
    
    // Global access
    window.openMobileMenu = () => window.navbarController?.openMobileMenu();
    window.closeMobileMenu = () => window.navbarController?.closeAll();
});

// Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarController;
}