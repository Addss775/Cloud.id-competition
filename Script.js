/**
 * Navbar Interactive Controller
 * Handles burger menu, dropdowns, smooth scroll, dan active states
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
        // Mobile menu toggle
        this.elements.burger?.addEventListener('click', () => this.toggleMobileMenu());
        this.elements.overlay?.addEventListener('click', () => this.closeMobileMenu());

        // Mobile dropdowns
        this.elements.dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            toggle?.addEventListener('click', (e) => this.handleMobileDropdown(e, dropdown));
        });

        // Smooth scroll links
        this.elements.scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleSmoothScroll(e, link));
        });
    }

    /**
     * Toggle mobile menu visibility
     */
    toggleMobileMenu() {
        const { burger, mobileMenu, overlay, body } = this.elements;
        
        burger?.classList.toggle('active');
        mobileMenu?.classList.toggle('active');
        overlay?.classList.toggle('active');
        
        // Prevent body scroll when menu open
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
    }

    /**
     * Handle mobile dropdown toggle
     */
    handleMobileDropdown(event, dropdown) {
        if (window.innerWidth > 768) return;

        event.preventDefault();
        event.stopPropagation();
        dropdown.classList.toggle('active');
    }

    /**
     * Smooth scroll to target section
     */
    handleSmoothScroll(event, link) {
        event.preventDefault();
        event.stopPropagation();

        const targetId = link.getAttribute('data-scroll');
        const targetSection = document.querySelector(targetId);

        if (!targetSection) return;

        // Smooth scroll
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Update active state
        this.setActiveMenu(link);

        // Close mobile menu
        this.closeMobileMenu();
    }

    /**
     * Set active menu item
     */
    setActiveMenu(activeLink) {
        document.querySelectorAll('.menu-link, .submenu a').forEach(item => {
            item.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    /**
     * Intersection Observer untuk auto-active menu
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
     * Update active menu based on current section
     */
    updateActiveMenu(currentId) {
        document.querySelectorAll('.menu-link, .submenu a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-scroll') === `#${currentId}`) {
                link.classList.add('active');
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NavbarController();
});

// Prevent dropdown scroll issues on touch devices
document.addEventListener('touchstart', (e) => {
    const dropdownToggle = e.target.closest('.dropdown-toggle[data-scroll]');
    if (dropdownToggle) {
        e.stopPropagation();
    }
}, { passive: true });