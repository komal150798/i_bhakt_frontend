/**
 * Theme Toggle Functionality
 * Handles dark/light theme switching with localStorage persistence
 */

(function() {
    'use strict';

    // Get theme toggle button and icon
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElement = document.documentElement;

    // Get saved theme from localStorage or default to 'light'
    const getSavedTheme = () => {
        const saved = localStorage.getItem('theme');
        return saved || 'light';
    };

    // Apply theme to HTML element
    const applyTheme = (theme) => {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    };

    // Update theme icon based on current theme
    const updateThemeIcon = (theme) => {
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.classList.remove('bi-moon-fill');
                themeIcon.classList.add('bi-sun-fill');
            } else {
                themeIcon.classList.remove('bi-sun-fill');
                themeIcon.classList.add('bi-moon-fill');
            }
        }
    };

    // Toggle theme
    const toggleTheme = () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    };

    // Initialize theme on page load
    const initTheme = () => {
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);
    };

    // Add event listener to theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Initialize theme immediately to prevent flicker
    // This should run before the page renders
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

    // Navbar scroll effect
    const navbar = document.getElementById('mainNavbar');
    if (navbar) {
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            lastScroll = currentScroll;
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 76; // Account for fixed navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Form submission handler for Kundli form
    const kundliForm = document.querySelector('.kundli-form');
    if (kundliForm) {
        kundliForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Get form values
            const formData = {
                fullName: document.getElementById('fullName').value,
                dateOfBirth: document.getElementById('dateOfBirth').value,
                timeOfBirth: document.getElementById('timeOfBirth').value,
                placeOfBirth: document.getElementById('placeOfBirth').value
            };
            
            // Log to console (replace with actual API call)
            console.log('Kundli Form Submitted:', formData);
            
            // Show success message (you can replace this with a toast notification)
            alert('Kundli generation request submitted! (This is a demo - connect to your backend API)');
            
            // Optionally reset form
            // this.reset();
        });
    }

})();

