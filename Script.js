class NavbarController {
    constructor() {
        this.init();
    }

    init() {
        this.cacheElements();
        
        // ✅ Validate cached elements
        if (!this.elements.burger) console.error('Burger button not found. Check .burger selector.');
        if (!this.elements.mobileMenu) console.error('Mobile menu not found. Check .mobile-menu selector.');
        if (!this.elements.overlay) console.error('Menu overlay not found. Check .menu-overlay selector.');
        
        this.bindEvents();
        this.initScrollObserver();
        console.log('NavbarController initialized successfully'); // ✅ Debug confirmation
    }

    cacheElements() {
        this.elements = {
            burger: document.querySelector('.burger'),
            mobileMenu: document.querySelector('.mobile-menu'),
            overlay: document.querySelector('.menu-overlay'),
            dropdowns: document.querySelectorAll('.dropdown'),
            scrollLinks: document.querySelectorAll('a[data-scroll]'),
            body: document.body,
            navbarLinks: document.querySelectorAll('.menu-link, .submenu a') // ✅ Cache semua links
        };
    }

bindEvents() {
    // ✅ BURGER SINGLE EVENT HANDLER (handles both click & touch)
    this.elements.burger?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.toggleMobileMenu();
    }, { passive: false });

    // ✅ OVERLAY & OUTSIDE CLICK CLOSE
    this.elements.overlay?.addEventListener('click', this.closeMobileMenu.bind(this));
    
    // Global click listener untuk close outside menu
    document.addEventListener('click', (e) => this.handleOutsideClick(e));

    // Mobile dropdowns
    this.elements.dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        toggle?.addEventListener('click', (e) => this.handleMobileDropdown(e, dropdown));
    });

    // ✅ ALL NAVIGATION LINKS (smooth scroll + auto close)
    this.elements.navbarLinks.forEach(link => {
        link.addEventListener('click', (e) => this.handleNavigationClick(e, link));
    });

    // Keyboard ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeMobileMenu();
    });

    // Resize auto-close
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) this.closeMobileMenu();
    });

    // Touchmove prevention
    this.elements.body.addEventListener('touchmove', (e) => {
        if (this.elements.mobileMenu?.classList.contains('active') && 
            !e.target.closest('.mobile-menu')) {
            e.preventDefault();
        }
    }, { passive: false });
}

/**
 * Handle click outside menu to close
 */
handleOutsideClick(e) {
    const isClickInsideMenu = e.target.closest('.mobile-menu');
    const isBurgerClick = e.target.closest('.burger');
    
    if (this.elements.mobileMenu?.classList.contains('active') && 
        !isClickInsideMenu && !isBurgerClick) {
        this.closeMobileMenu();
    }
}

/**
 * Toggle burger menu ☰ ↔ ❌
 */
toggleMobileMenu() {
    const { burger, mobileMenu, overlay, body } = this.elements;
    
    if (!burger || !mobileMenu || !overlay) return;

    const isActive = mobileMenu.classList.contains('active');

    if (isActive) {
        this.closeMobileMenu();
    } else {
        // ✅ FORCE Z-INDEX & POINTER EVENTS
        burger.style.zIndex = '10000';
        burger.style.pointerEvents = 'auto';
        
        burger.classList.add('active');
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        body.classList.add('menu-open');
    }
}

/**
 * Close mobile menu & reset burger
 */
closeMobileMenu() {
    const { burger, mobileMenu, overlay, body } = this.elements;
    
    burger?.classList.remove('active');
    mobileMenu?.classList.remove('active');
    overlay?.classList.remove('active');
    
    // Reset body
    body.style.overflow = '';
    body.style.position = '';
    body.style.width = '';
    
    // Close all dropdowns
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.classList.remove('active');
    });
}

    /**
     * Mobile dropdown toggle
     */
    handleMobileDropdown(event, dropdown) {
        if (window.innerWidth > 768) return;

        event.preventDefault();
        event.stopPropagation();
        dropdown.classList.toggle('active');
    }

    /**
     * Universal navigation handler (desktop + mobile) - FIXED with validation
     */
    handleNavigationClick(event, link) {
        const targetId = link.getAttribute('data-scroll');
        
        if (targetId && targetId.startsWith('#')) {
            event.preventDefault();
            event.stopPropagation();

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                console.log(`Scrolling to ${targetId}`); // ✅ Debug log
                // Smooth scroll
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update active state
                this.setActiveMenu(link);

                // Auto close mobile menu
                this.closeMobileMenu();

                // Offset adjustment
                setTimeout(() => window.scrollBy(0, -20), 600);
            } else {
                console.warn(`Section not found: ${targetId}. Check if section exists in HTML.`); // ✅ Bug fix: warn missing sections
            }
        }
    }

    /**
     * Set active menu item
     */
    setActiveMenu(activeLink) {
        this.elements.navbarLinks.forEach(item => {
            item.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    /**
     * Scroll-based active menu (Intersection Observer)
     */
    initScrollObserver() {
        const sections = document.querySelectorAll('section[id]');
        if (!sections.length) return;

        const observerOptions = {
            rootMargin: '-20% 0px -80% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    this.updateActiveMenu(currentId);
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    /**
     * Update active menu from scroll
     */
    updateActiveMenu(currentId) {
        this.elements.navbarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-scroll') === `#${currentId}`) {
                link.classList.add('active');
            }
        });
    }
}

// Initialize controller
document.addEventListener('DOMContentLoaded', () => {
    new NavbarController();
});

// ✅ TOUCH OPTIMIZATION
document.addEventListener('touchstart', (e) => {
    // Prevent dropdown interference
    if (e.target.closest('.dropdown-toggle') && window.innerWidth <= 768) {
        e.stopPropagation();
    }
}, { passive: true });