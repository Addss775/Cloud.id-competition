class NavbarController {
    constructor() {
        this.init();
    }

    init() {
        this.cacheElements();
        
        // ✅ Validate cached elements
        if (!this.elements.burger) console.error('Burger button not found.');
        if (!this.elements.mobileMenu) console.error('Mobile menu not found.');
        
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        this.hideTimeout = null;
        
        this.bindEvents();
        this.bindScrollHideEvents();
        this.initScrollObserver();
        console.log('✅ NavbarController FIXED - Mobile navigation works!');
    }

    cacheElements() {
        this.elements = {
            burger: document.querySelector('.burger'),
            mobileMenu: document.querySelector('.mobile-menu'),
            navbar: document.querySelector('.navbar'),
            overlay: document.querySelector('.menu-overlay'),
            menuCloseBtn: document.querySelector('.menu-close-btn'),
            dropdowns: document.querySelectorAll('.dropdown'),
            scrollLinks: document.querySelectorAll('a[data-scroll]'),
            body: document.body,
            navbarLinks: document.querySelectorAll('.menu-link, .submenu a, .back-to-top')
        };
    }

    bindEvents() {
        // ✅ BURGER TOGGLE
        this.elements.burger?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        // ✅ CLOSE BUTTON
        this.elements.menuCloseBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeMobileMenu();
        });

        // ✅ OVERLAY CLOSE
        this.elements.overlay?.addEventListener('click', () => this.closeMobileMenu());

        // ✅ OUTSIDE CLICK
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // ✅ DROPDOWNS
        this.elements.dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            toggle?.addEventListener('click', (e) => this.handleMobileDropdown(e, dropdown));
        });

        // 🔥 FIX MOBILE NAVIGATION - PENTING!
        this.elements.navbarLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigationClick(e, link));
        });

        // ESC & RESIZE
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMobileMenu();
        });
        
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) this.closeMobileMenu();
        });
    }

    handleOutsideClick(e) {
        const isClickInsideMenu = e.target.closest('.mobile-menu');
        const isBurgerClick = e.target.closest('.burger');
        const isCloseBtnClick = e.target.closest('.menu-close-btn');
        
        if (this.elements.mobileMenu?.classList.contains('active') && 
            !isClickInsideMenu && !isBurgerClick && !isCloseBtnClick) {
            this.closeMobileMenu();
        }
    }

    /** 🔥 FIXED: Navigation yang BENAR! */
    handleNavigationClick(event, link) {
        const href = link.getAttribute('href');
        const isScrollLink = link.hasAttribute('data-scroll') || href?.startsWith('#');
        const isExternal = href && !href.startsWith('#') && href !== '#';

        console.log('🔗 Link clicked:', { href, isScrollLink, isExternal });

        // ✅ HANYA block scroll links INTERNAL
        if (isScrollLink) {
            event.preventDefault();
            event.stopPropagation();
            
            const targetId = href || link.getAttribute('data-scroll');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this.setActiveMenu(link);
                this.closeMobileMenu();
            }
        } 
        // ✅ EXTERNAL LINKS - JALANKAN NORMAL + close menu delayed
        else if (isExternal) {
            // JANGAN preventDefault! Biar href jalan
            console.log('🌐 Going to external:', href);
            
            // Close menu DELAYED biar navigation jalan dulu
            setTimeout(() => {
                this.closeMobileMenu();
            }, 300);
        }
        // ✅ Anchor kosong atau internal non-scroll
        else {
            this.closeMobileMenu();
        }
    }

    toggleMobileMenu() {
        const { burger, mobileMenu, overlay, body, menuCloseBtn } = this.elements;
        
        if (!burger || !mobileMenu) return;

        const isActive = mobileMenu.classList.contains('active');

        if (isActive) {
            this.closeMobileMenu();
        } else {
            // Show elements
            burger.classList.add('active');
            mobileMenu.classList.add('active');
            overlay?.classList.add('active');
            body.classList.add('menu-open');
            
            // Show close button
            menuCloseBtn?.classList.add('show');
        }
    }

    closeMobileMenu() {
        const { burger, mobileMenu, overlay, body, menuCloseBtn } = this.elements;
        
        burger?.classList.remove('active');
        mobileMenu?.classList.remove('active');
        overlay?.classList.remove('active');
        body.classList.remove('menu-open');
        
        // Hide close button
        menuCloseBtn?.classList.remove('show');
        
        // Close dropdowns
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    handleMobileDropdown(event, dropdown) {
        if (window.innerWidth > 768) return;
        event.preventDefault();
        event.stopPropagation();
        dropdown.classList.toggle('active');
    }

    // ========== SCROLL HIDE (tetap sama) ==========
    bindScrollHideEvents() {
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        this.elements.navbar?.addEventListener('mouseenter', this.showNavbar.bind(this));
        this.elements.navbar?.addEventListener('mouseleave', this.handleNavbarMouseLeave.bind(this));
    }

    handleScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateNavbarVisibility();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    updateNavbarVisibility() {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - this.lastScrollY;
        const hideThreshold = 30;

        if (currentScrollY > hideThreshold) {
            if (delta > hideThreshold) {
                this.hideNavbar();
            } else if (delta < -hideThreshold) {
                this.showNavbar();
            }
        }
        this.lastScrollY = currentScrollY;
    }

    showNavbar() {
        this.elements.navbar?.classList.remove('hide');
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
    }

    hideNavbar() {
        this.elements.navbar?.classList.add('hide');
    }

    handleNavbarMouseLeave() {
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
            const currentScrollY = window.scrollY;
            if (currentScrollY - this.lastScrollY > 10) {
                this.hideNavbar();
            }
        }, 500);
    }

    setActiveMenu(activeLink) {
        this.elements.navbarLinks.forEach(item => item.classList.remove('active'));
        activeLink.classList.add('active');
    }

    initScrollObserver() {
        const sections = document.querySelectorAll('section[id]');
        if (!sections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    this.updateActiveMenu(currentId);
                }
            });
        }, {
            rootMargin: '-20% 0px -80% 0px',
            threshold: 0
        });

        sections.forEach(section => observer.observe(section));
    }

    updateActiveMenu(currentId) {
        this.elements.navbarLinks.forEach(link => {
            link.classList.remove('active');
            if ((link.getAttribute('data-scroll') || link.getAttribute('href')) === `#${currentId}`) {
                link.classList.add('active');
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new NavbarController();
});

// Back to top
window.addEventListener('scroll', () => {
    const btn = document.querySelector('.back-to-top');
    if (btn && window.scrollY > 300) {
        btn.classList.add('show');
    } else if (btn) {
        btn.classList.remove('show');
    }
});