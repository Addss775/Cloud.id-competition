class NavbarController {
    constructor() {
        this.init();
    }

    init() {
        this.scrollSaver = { enabled: true }; // 🐛 FIX: Scroll position saver untuk cegah jump ke #home
        
        this.cacheElements();
        
        // Pastikan elemen dasar ada
        if (!this.elements.burger || !this.elements.mobileMenu) return;
        
        this.lastScrollY = window.scrollY;
        this.isTicking = false;
        
        this.bindEvents();
        console.log('✅ NavbarController: System Stabilized. Burger menu scroll jump FIXED.');
    }

    cacheElements() {
        this.elements = {
            burger: document.querySelector('.burger'),
            mobileMenu: document.querySelector('.mobile-menu'),
            navbar: document.querySelector('.navbar'),
            overlay: document.querySelector('.menu-overlay'),
            menuCloseBtn: document.querySelector('.menu-close-btn'),
            dropdowns: document.querySelectorAll('.dropdown'),
            body: document.body,
            // Ambil semua link kecuali yang dropdown-toggle biar gak tabrakan logic
            navLinks: document.querySelectorAll('.menu-link:not(.dropdown-toggle), .submenu a, .back-to-top')
        };
    }

    bindEvents() {
        // 1. Burger & Close Toggle 🐛 PROBLEMATIC AREA: Burger click causing scroll jump to #home
        this.elements.burger?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // 🆕 FIX: Extra stop propagation untuk cegah bubble ke parent links
            // console.log('🐛 Burger clicked, scrollY:', window.scrollY); // 🧹 CLEANUP: Debug removed
            this.toggleMobileMenu();
        });

        this.elements.menuCloseBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeMobileMenu();
        });

        this.elements.overlay?.addEventListener('click', () => this.closeMobileMenu());

        // 2. Dropdown Logic (Hanya Mobile) 🐛 POTENTIAL: Dropdown interfering with scroll
        this.elements.dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            toggle?.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault(); // Stop pindah halaman kalau dropdown diklik
                    e.stopPropagation();
                    
                    // Close dropdown lain biar gak tumpang tindih
                    this.elements.dropdowns.forEach(d => {
                        if (d !== dropdown) d.classList.remove('active');
                    });
                    
                    dropdown.classList.toggle('active');
                }
            });
        });

        // 3. Smooth Scroll & Navigation 🐛 PROBLEMATIC AREA: Race condition scroll after menu close causing homepage jump
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Jika internal link (pakai #)
                if (href && href.startsWith('#') && href !== '#') {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const target = document.querySelector(href);
                    if (target) {
                        // 🆕 FIX: Restore scroll before close to prevent jump
                        this.restoreScrollPosition();
                        
                        this.closeMobileMenu();
                        // Delay lebih panjang untuk sync dengan CSS transition
                        setTimeout(() => {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }, 400);
                    }
                } else {
                    // Biarkan link eksternal jalan, tapi tutup menu
                    this.closeMobileMenu();
                }
            });
        });

        // 4. Scroll Header Hide/Show
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        
        // 5. Global Fixes
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) this.closeMobileMenu();
        });
    }

    toggleMobileMenu() {
        // 🐛 FIX: PROBLEMATIC AREA - Menu open causes body position:fixed jump, resetting scrollY to 0 (homepage)
        if (this.scrollSaver.enabled) {
            this.savedScrollY = window.scrollY; // 🆕 Save current scroll pos
            // console.log('🐛 Menu OPEN - Saved scrollY:', this.savedScrollY); // 🧹 CLEANUP: Debug removed
        }
        
        const isOpen = this.elements.mobileMenu.classList.toggle('active');
        this.elements.burger.classList.toggle('active');
        this.elements.overlay?.classList.toggle('active');
        this.elements.menuCloseBtn?.classList.toggle('show');
        this.elements.body.classList.toggle('menu-open', isOpen);
    }

    closeMobileMenu() {
        // 🐛 FIX: Restore scroll pos setelah menu tutup untuk cegah homepage jump
        this.elements.mobileMenu.classList.remove('active');
        this.elements.burger?.classList.remove('active');
        this.elements.overlay?.classList.remove('active');
        this.elements.menuCloseBtn?.classList.remove('show');
        this.elements.body.classList.remove('menu-open');
        this.elements.dropdowns.forEach(d => d.classList.remove('active'));
        
        // 🆕 Restore scroll setelah DOM update
        setTimeout(() => {
            if (this.scrollSaver.enabled && this.savedScrollY !== undefined) {
                window.scrollTo(0, this.savedScrollY);
                // console.log('🐛 Menu CLOSE - Restored scrollY:', this.savedScrollY); // 🧹 CLEANUP: Debug removed
                this.savedScrollY = undefined;
            }
        }, 350); // Sync dengan CSS transition
    }

    restoreScrollPosition() {
        // 🆕 UTILITY: Restore saved scroll jika ada
        if (this.savedScrollY !== undefined) {
            window.scrollTo(0, this.savedScrollY);
        }
    }

    onScroll() {
        // 🐛 POTENTIAL: Scroll listener interfering during menu transitions
        if (this.elements.body.classList.contains('menu-open')) return; // 🆕 Skip saat menu open
        
        if (!this.isTicking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                
                // Navbar Hide/Show Logic
                if (currentScrollY > 100) {
                    if (currentScrollY > this.lastScrollY) {
                        this.elements.navbar.classList.add('hide');
                    } else {
                        this.elements.navbar.classList.remove('hide');
                    }
                } else {
                    this.elements.navbar.classList.remove('hide');
                }

                // Back to Top Logic
                const btt = document.querySelector('.back-to-top');
                if (btt) btt.classList.toggle('show', currentScrollY > 500);

                this.lastScrollY = currentScrollY;
                this.isTicking = false;
            });
            this.isTicking = true;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new NavbarController());
