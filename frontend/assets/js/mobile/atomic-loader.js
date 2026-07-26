/**
 * Flame Logistics - Atomic Component Loader for Mobile
 * 
 * This script handles dynamic loading of atomic components
 * following the Atomic Design methodology.
 * 
 * Usage:
 * - Components are loaded based on data-organism attributes
 * - Each organism placeholder will be populated with its HTML content
 */

(function() {
  'use strict';

  // Component paths configuration
  const COMPONENT_BASE_PATH = '/components/mobile';
  
  const ORGANISMS = {
    'header': 'organisms/header.html',
    'hero': 'organisms/hero-section.html',
    'stats': 'organisms/stats-grid.html',
    'services': 'organisms/services-carousel.html',
    'sectors': 'organisms/sectors-section.html',
    'partners': 'organisms/partners-marquee.html',
    'authority': 'organisms/authority-section.html',
    'gallery': 'organisms/gallery-grid.html',
    'news': 'organisms/news-section.html',
    'footer': 'organisms/footer.html'
  };

  /**
   * Load a component HTML file
   * @param {string} path - Path to the component file
   * @returns {Promise<string>} - HTML content
   */
  async function loadComponent(path) {
    try {
      const response = await fetch(`${COMPONENT_BASE_PATH}/${path}`);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${path}`);
      }
      return await response.text();
    } catch (error) {
      console.error(`Error loading component ${path}:`, error);
      return '';
    }
  }

  /**
   * Initialize all organism placeholders
   */
  async function initOrganisms() {
    const placeholders = document.querySelectorAll('[data-organism]');
    
    for (const placeholder of placeholders) {
      const organismName = placeholder.dataset.organism;
      const componentPath = ORGANISMS[organismName];
      
      if (componentPath) {
        const html = await loadComponent(componentPath);
        if (html) {
          // Extract just the component content (remove HTML comments)
          const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '').trim();
          placeholder.innerHTML = cleanHtml;
        }
      }
    }
    
    // Initialize any interactive components after loading
    initInteractiveComponents();
  }

  /**
   * Initialize interactive components (accordions, etc.)
   */
  function initInteractiveComponents() {
    // Accordion functionality is already defined inline in footer
    // This function can be extended for other interactive components
    
    // Re-initialize any scroll animations
    initScrollAnimations();
  }

  /**
   * Initialize scroll-based animations
   */
  function initScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * Toggle accordion functionality
   * @param {string} id - Accordion content ID
   */
  window.toggleAccordion = function(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    
    if (el && icon) {
      if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
      } else {
        el.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrganisms);
  } else {
    initOrganisms();
  }

  // Export for external use
  window.AtomicLoader = {
    loadComponent,
    initOrganisms,
    ORGANISMS
  };

})();
