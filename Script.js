class NavbarController {
    constructor() {
        this.scrollSaver = { enabled: true };
        this.savedScrollY = 0;
        this.lastScrollY = 0;
        this.isTicking = false;
        this.isToggling = false; // Sistem pengunci (Anti-Ghost Click)
        
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
            burger: document.querySelector('.burger'),
            mobileMenu: document.querySelector('.mobile-menu'),
            navbar: document.querySelector('.navbar'),
            overlay: document.querySelector('.mobile-overlay'),
            menuCloseBtn: document.querySelector('.menu-close-btn'),
            
            mobileDropdowns: document.querySelectorAll('.mobile-menu .dropdown'),
            desktopDropdowns: document.querySelectorAll('.desktop-menu .dropdown'),
            allDropdowns: document.querySelectorAll('.dropdown'),
            
            navLinks: document.querySelectorAll('.menu-link:not(.dropdown-toggle), .submenu a'),
           
            body: document.body
        };
    }

    bindEvents() {
        const toggleMenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMobileMenu();
        };

        if (this.elements.burger) {
            this.elements.burger.addEventListener('click', toggleMenu);
        }

        const closeMenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeMobileMenu();
        };

        if (this.elements.menuCloseBtn) {
            this.elements.menuCloseBtn.addEventListener('click', closeMenu);
        }

        if (this.elements.overlay) {
            this.elements.overlay.addEventListener('click', () => this.closeMobileMenu());
        }

        Array.from(this.elements.mobileDropdowns).forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleMobileDropdown(dropdown);
                });
            }
        });

        // Desktop dropdown: pastikan selalu toggle submenu pada click juga (bukan hanya hover)
        Array.from(this.elements.desktopDropdowns).forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (!toggle) return;
            toggle.addEventListener('click', (e) => {
                // untuk desktop, klik harus memunculkan submenu
                e.preventDefault();
                e.stopPropagation();
                Array.from(this.elements.desktopDropdowns).forEach(d => d !== dropdown && d.classList.remove('active'));
                dropdown.classList.toggle('active');
            });
        });


        // Desktop dropdown harus click saja (nonaktifkan hover intent)
        // (hover handler masih ada di CSS, tapi JS tidak menambah/menghapus class active via mouse)

        // Jangan tangkap click pada toggle dropdown (supaya menu bisa muncul)

        Array.from(this.elements.navLinks).forEach(link => {
            // Jika ini adalah toggle dropdown (menu link yang membuka submenu), jangan ditangani sebagai navigasi.
            const parentDropdown = link.closest('.dropdown');
            const isDropdownToggle = !!link.classList.contains('dropdown-toggle') || (parentDropdown && link === parentDropdown.querySelector('.dropdown-toggle'));
            if (isDropdownToggle) return;

            // Jika link adalah item di dalam submenu, biarkan handler default/anchor berjalan.
            if (link.closest('.submenu')) return;


            link.addEventListener('click', (e) => this.handleNavClick(e, link));
        });


        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', () => this.onResize(), { passive: true });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
                Array.from(this.elements.desktopDropdowns).forEach(dropdown => dropdown.classList.remove('active'));
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                Array.from(this.elements.desktopDropdowns).forEach(dropdown => dropdown.classList.remove('active'));
            }
        });
    }

    toggleMobileMenu() {
        // Cegah eksekusi ganda jika tombol sedang ditekan
        if (this.isToggling) return;
        this.isToggling = true;
        setTimeout(() => { this.isToggling = false; }, 350);

        const isOpening = !this.elements.mobileMenu.classList.contains('active');
        
        if (isOpening && this.scrollSaver.enabled) {
            this.savedScrollY = window.scrollY;
        }
        
        this.elements.mobileMenu.classList.toggle('active');
        if (this.elements.burger) this.elements.burger.classList.toggle('active');
        if (this.elements.overlay) this.elements.overlay.classList.toggle('active');
        if (this.elements.menuCloseBtn) this.elements.menuCloseBtn.classList.toggle('show');
        this.elements.body.classList.toggle('menu-open');
    }

    closeMobileMenu() {
        this.elements.mobileMenu.classList.remove('active');
        if (this.elements.burger) this.elements.burger.classList.remove('active');
        if (this.elements.overlay) this.elements.overlay.classList.remove('active');
        if (this.elements.menuCloseBtn) this.elements.menuCloseBtn.classList.remove('show');
        this.elements.body.classList.remove('menu-open');
        
        Array.from(this.elements.allDropdowns).forEach(dropdown => dropdown.classList.remove('active'));

        if (this.scrollSaver.enabled && this.savedScrollY > 0) {
            setTimeout(() => {
                window.scrollTo(0, this.savedScrollY);
                this.savedScrollY = 0;
            }, 350);
        }
    }

    toggleMobileDropdown(targetDropdown) {
        Array.from(this.elements.mobileDropdowns).forEach(dropdown => {
            if (dropdown !== targetDropdown) {
                dropdown.classList.remove('active');
            }
        });

        targetDropdown.classList.toggle('active');
    }

    handleNavClick(e, link) {
        const href = link.getAttribute('href');
      
        if (href && href.startsWith('#') && href !== '#') {
            e.preventDefault();
            e.stopPropagation();

            const target = document.querySelector(href);
            if (target) {
                this.closeMobileMenu();
                
                setTimeout(() => {
                    target.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 450);
            }
        } else {
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

        if (currentScrollY > 100) {
            this.elements.navbar.classList.toggle(
                'hide', 
                currentScrollY > this.lastScrollY && !this.elements.body.classList.contains('menu-open')
            );
        } else {
            this.elements.navbar.classList.remove('hide');
        }

        const backToTop = document.querySelector('.back-to-top');
        if (backToTop) {
            backToTop.classList.toggle('show', currentScrollY > 500);
        }

        // Efek Parallax untuk Hero & Destinasi
        const homeAnimate = document.querySelector('.home-animate');
        if (homeAnimate) {
            homeAnimate.style.setProperty('--scroll-offset', `${currentScrollY * 0.35}px`);
        }

        const destinasiAnimate = document.querySelector('.destinasi-animate');
        if (destinasiAnimate) {
            const rect = destinasiAnimate.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const offset = (window.innerHeight - rect.top) * 0.25;
                destinasiAnimate.style.setProperty('--scroll-offset', `${offset}px`);
            }
        }

        this.lastScrollY = currentScrollY;
    }

    onResize() {
        if (window.innerWidth > 1024) {
            this.closeMobileMenu();
        }
        
        Array.from(this.elements.desktopDropdowns).forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    openMobileMenu() {
        this.toggleMobileMenu();
    }

    closeAll() {
        this.closeMobileMenu();
    }

    destroy() {
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onResize);
        document.removeEventListener('keydown', this.keydownHandler);
        console.log('🧹 NavbarController: Destroyed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.navbarController = new NavbarController();
    
    window.openMobileMenu = () => { if (window.navbarController) window.navbarController.openMobileMenu(); };
    window.closeMobileMenu = () => { if (window.navbarController) window.navbarController.closeAll(); };
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarController;
}

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

class ImageCarousel {
    constructor(config = {}) {
        this.config = {
            containerId: config.containerId || 'carousel',
            dotsId: config.dotsId || 'carouselDots',
            slideClass: config.slideClass || 'carousel-slide',
            dotClass: config.dotClass || 'dot',
            autoPlayDelay: config.autoPlayDelay || 5000,
            threshold: config.threshold || 100,
            ...config
        };

        this.carousel = document.getElementById(this.config.containerId);
        this.dotsContainer = document.getElementById(this.config.dotsId);
        this.slides = this.carousel ? this.carousel.querySelectorAll(`.${this.config.slideClass}`) : [];
        
        this.currentIndex = 0;
        this.isDragging = false;
        this.startPos = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.animationID = 0;
        this.autoPlayInterval = null;

        if (!this.carousel || !this.dotsContainer || this.slides.length === 0) {
            console.warn(`❌ ImageCarousel ${this.config.containerId}: Elements missing`);
            return;
        }

        console.log(`📸 ${this.config.containerId}: ${this.slides.length} slides ready`);
        this.init();
    }

    init() {
        this.bindEvents();
        this.createDots();
        this.startAutoPlay();
    }

    bindEvents() {
        this.carousel.addEventListener('mousedown', this.dragStart.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.dragEnd.bind(this));
        this.carousel.addEventListener('touchstart', this.dragStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.drag.bind(this), { passive: false });
        document.addEventListener('touchend', this.dragEnd.bind(this));
        
        window.addEventListener('resize', this.onResize.bind(this));
    }

    createDots() {
        this.dotsContainer.innerHTML = '';
        
        Array.from(this.slides).forEach((slide, index) => {
            if (slide.querySelector('img') || slide.children.length > 0) {
                const dot = document.createElement('div');
                dot.className = this.config.dotClass;
                if (index === 0) dot.classList.add('active');
                dot.dataset.slide = index;
                dot.addEventListener('click', () => this.goTo(index));
                this.dotsContainer.appendChild(dot);
            }
        });
        
        this.dots = this.dotsContainer.querySelectorAll(`.${this.config.dotClass}`);
        console.log(`🔘 ${this.config.containerId}: ${this.dots.length} dots created`);
    }

    dragStart(e) {
        this.pauseAutoPlay();
        this.startPos = this.getPositionX(e);
        this.isDragging = true;
        this.animationID = requestAnimationFrame(this.animation.bind(this));
        this.carousel.classList.add('grabbing');
    }

    drag(e) {
        if (this.isDragging) {
            const currentPosition = this.getPositionX(e);
            this.currentTranslate = this.prevTranslate + currentPosition - this.startPos;
        }
    }

    dragEnd() {
        if (!this.isDragging) return;

        this.isDragging = false;
        cancelAnimationFrame(this.animationID);
        this.carousel.classList.remove('grabbing');
        this.startAutoPlay();

        const movedBy = this.currentTranslate - this.prevTranslate;
        if (movedBy < -this.config.threshold && this.currentIndex < this.slides.length - 1) {
            this.currentIndex++;
        } else if (movedBy > this.config.threshold && this.currentIndex > 0) {
            this.currentIndex--;
        }
        this.setPositionByIndex();
    }

    getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    animation() {
        this.setSliderPosition();
        if (this.isDragging) requestAnimationFrame(this.animation.bind(this));
    }

    setPositionByIndex() {
        this.currentTranslate = this.currentIndex * -window.innerWidth;
        this.prevTranslate = this.currentTranslate;
        this.setSliderPosition();
        this.updateDots();
    }

    setSliderPosition() {
        this.carousel.style.transform = `translateX(${this.currentTranslate}px)`;
    }

    next() {
        this.currentIndex = this.currentIndex < this.slides.length - 1 ? 
            this.currentIndex + 1 : 0;
        this.setPositionByIndex();
    }

    goTo(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.slides.length - 1));
        this.setPositionByIndex();
    }

    updateDots() {
        Array.from(this.dots).forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    startAutoPlay() {
        this.pauseAutoPlay();
        this.autoPlayInterval = setInterval(() => this.next(), this.config.autoPlayDelay);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    onResize() {
        this.setPositionByIndex();
    }

    destroy() {
        this.pauseAutoPlay();
        window.removeEventListener('resize', this.onResize);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageCarousel({
        containerId: 'kampungCarousel',
        dotsId: 'kampungDots',
        slideClass: 'kampung-slide',
        dotClass: 'kampung-dot',
        autoPlayDelay: 4000
    });

    new ImageCarousel({
        containerId: 'terjunCarousel',
        dotsId: 'terjunDots',
        slideClass: 'terjun-slide',
        dotClass: 'terjun-dot',
        autoPlayDelay: 4000
    });

    new ImageCarousel({
        containerId: 'malenCarousel',
        dotsId: 'malenDots',
        slideClass: 'malen-slide',
        dotClass: 'malen-dot',
        autoPlayDelay: 4000
    });

    new ImageCarousel({
        containerId: 'viharaCarousel',
        dotsId: 'viharaDots',
        slideClass: 'vihara-slide',
        dotClass: 'vihara-dot',
        autoPlayDelay: 4000
    });

    console.log('✅ All ImageCarousels initialized!');
});