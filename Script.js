/**
 * Navbar Controller - Simple & Reliable
 * Burger Menu | Mobile Dropdown | Smooth Scroll
 */
class NavbarController {
    constructor() {
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.initScrollObserver();
    }

    cacheElements() {
        this.elements = {
            burger: document.querySelector('.burger'),
            mobileMenu: document.querySelector('.mobile-menu'),
            overlay: document.querySelector('.menu-overlay'),
            dropdowns: document.querySelectorAll('.dropdown'),
            scrollLinks: document.querySelectorAll('a[data-scroll]'),
            body: document.body
        };
    }

    bindEvents() {
        // Burger toggle ☰ ↔ ❌
        this.elements.burger?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        // Overlay close
        this.elements.overlay?.addEventListener('click', () => this.closeMobileMenu());

        // Mobile dropdowns
        this.elements.dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            toggle?.addEventListener('click', (e) => this.toggleDropdown(e, dropdown));
        });

        // Smooth scroll links
        this.elements.scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => this.smoothScroll(e, link));
        });
    }

    /**
     * Toggle burger menu ☰ ↔ ❌
     */
    toggleMobileMenu() {
        const { burger, mobileMenu, overlay, body } = this.elements;
        
        burger?.classList.toggle('active');
        mobileMenu?.classList.toggle('active');
        overlay?.classList.toggle('active');
        
        // Body scroll lock
        body.style.overflow = mobileMenu?.classList.contains('active') ? 'hidden' : '';
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const { burger, mobileMenu, overlay, body } = this.elements;
        
        burger?.classList.remove('active');
        mobileMenu?.classList.remove('active');
        overlay?.classList.remove('active');
        body.style.overflow = '';
        
        // Close all dropdowns
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
    }

    /**
     * Mobile dropdown toggle
     */
    toggleDropdown(e, dropdown) {
        if (window.innerWidth > 768) return;
        
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('active');
    }

    /**
     * Smooth scroll + close menu
     */
    smoothScroll(e, link) {
        e.preventDefault();
        e.stopPropagation();

        const targetId = link.getAttribute('data-scroll');
        const target = document.querySelector(targetId);

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Active state
            this.setActiveLink(link);
            
            // Close mobile menu
            this.closeMobileMenu();
        }
    }

    /**
     * Set active link
     */
    setActiveLink(activeLink) {
        document.querySelectorAll('a[data-scroll]').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    /**
     * Auto active on scroll
     */
    initScrollObserver() {
        const sections = document.querySelectorAll('section[id]');
        if (!sections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    document.querySelectorAll('a[data-scroll]').forEach(link => {
                        link.classList.toggle('active', link.getAttribute('data-scroll') === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-20% 0px -75% 0px' });

        sections.forEach(section => observer.observe(section));
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => new NavbarController());