class NavbarController {
    constructor() {
        this.init();
    }

    init() {
        this.cacheElements();
        
        // Pastikan elemen dasar ada
        if (!this.elements.burger || !this.elements.mobileMenu) return;
        
        this.lastScrollY = window.scrollY;
        this.isTicking = false;
        
        this.bindEvents();
        console.log('✅ NavbarController: System Stabilized.');
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
        // 1. Burger & Close Toggle
        this.elements.burger?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileMenu();
        });

        this.elements.menuCloseBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeMobileMenu();
        });

        this.elements.overlay?.addEventListener('click', () => this.closeMobileMenu());

        // 2. Dropdown Logic (Hanya Mobile)
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

        // 3. Smooth Scroll & Navigation
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Jika internal link (pakai #)
                if (href && href.startsWith('#') && href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        this.closeMobileMenu();
                        // Delay dikit biar transisi menu tutup selesai dulu
                        setTimeout(() => {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
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
        const isOpen = this.elements.mobileMenu.classList.toggle('active');
        this.elements.burger.classList.toggle('active');
        this.elements.overlay?.classList.toggle('active');
        this.elements.menuCloseBtn?.classList.toggle('show');
        this.elements.body.classList.toggle('menu-open', isOpen);
    }

    closeMobileMenu() {
        this.elements.mobileMenu.classList.remove('active');
        this.elements.burger?.classList.remove('active');
        this.elements.overlay?.classList.remove('active');
        this.elements.menuCloseBtn?.classList.remove('show');
        this.elements.body.classList.remove('menu-open');
        this.elements.dropdowns.forEach(d => d.classList.remove('active'));
    }

    onScroll() {
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
