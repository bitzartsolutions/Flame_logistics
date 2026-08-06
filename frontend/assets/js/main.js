/**
 * Flame Logistics - Main JavaScript
 * Common functionality for all pages
 */

// ===== Reveal Animation on Scroll =====
function reveal() {
  const reveals = document.querySelectorAll(".reveal");
  for (let i = 0; i < reveals.length; i++) {
    const windowHeight = window.innerHeight;
    const elementTop = reveals[i].getBoundingClientRect().top;
    const elementVisible = 150;
    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    }
  }
}

// ===== Navigation Scroll Effect =====
function handleNavScroll() {
  const header = document.querySelector('header');
  if (!header) return;
  
  if (window.scrollY > 50) {
    header.classList.add('nav-scrolled');
  } else {
    header.classList.remove('nav-scrolled');
  }
}

// ===== Set Active Navigation Link =====
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop().replace('.html', '') || 'home';
  
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('data-page');
    link.classList.remove('active');
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });
}

// ===== Load Header Component =====
async function loadHeader() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (!headerPlaceholder) return;
  
  try {
    const response = await fetch('/components/header.html');
    if (response.ok) {
      const html = await response.text();
      headerPlaceholder.innerHTML = html;
      setActiveNavLink();
    }
  } catch (error) {
    console.error('Error loading header:', error);
  }
}

// ===== Load Footer Component =====
async function loadFooter() {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (!footerPlaceholder) return;
  
  try {
    const response = await fetch('/components/footer.html');
    if (response.ok) {
      const html = await response.text();
      footerPlaceholder.innerHTML = html;
    }
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}

// ===== Initialize Components =====
async function initComponents() {
  await loadHeader();
  await loadFooter();
  
  // Re-run reveal after components are loaded
  reveal();
}

// ===== Event Listeners =====
window.addEventListener("scroll", () => {
  reveal();
  handleNavScroll();
});

function getApiBase() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }
  return 'https://flame-logistics-backend.vercel.app';
}

async function handleQuoteFormSubmit(event) {
  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton ? submitButton.innerHTML : '';

  event.preventDefault();

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = 'Sending...';
  }

  try {
    const formData = new FormData(form);
    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput && fileInput.files && fileInput.files.length) {
      Array.from(fileInput.files).forEach((file) => {
        formData.append('attachments', file, file.name);
      });
    }

    const payload = Object.fromEntries(formData.entries());
    payload.formType = form.getAttribute('data-form-type') || 'quote';
    payload.page = window.location.pathname;

    const response = await fetch(`${getApiBase()}/api/contact`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || 'Unable to send your inquiry.');
    }

    if (submitButton) {
      submitButton.innerHTML = 'Request Received';
      submitButton.classList.remove('bg-primary', 'bg-secondary');
      submitButton.classList.add('bg-green-600');
    }

    form.reset();
  } catch (error) {
    console.error('Quote form submission failed:', error);
    if (submitButton) {
      submitButton.innerHTML = 'Try again';
    }
  } finally {
    if (submitButton) {
      window.setTimeout(() => {
        submitButton.innerHTML = originalLabel;
        submitButton.disabled = false;
        submitButton.classList.remove('bg-green-600');
      }, 2000);
    }
  }
}

function bindQuoteForms() {
  document.querySelectorAll('form.contact-form').forEach((form) => {
    form.removeEventListener('submit', handleQuoteFormSubmit);
    form.addEventListener('submit', handleQuoteFormSubmit);
  });
}

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize components
  initComponents();
  
  // Initial reveal check
  reveal();
  
  // Initial nav scroll check
  handleNavScroll();

  bindQuoteForms();
});

// ===== Utility Functions =====

/**
 * Smooth scroll to element
 * @param {string} selector - CSS selector for target element
 */
function scrollToElement(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export functions for use in other scripts
window.FlameLogistics = {
  reveal,
  scrollToElement,
  formatNumber,
  debounce,
  throttle,
  setActiveNavLink,
  bindQuoteForms,
  handleQuoteFormSubmit
};
