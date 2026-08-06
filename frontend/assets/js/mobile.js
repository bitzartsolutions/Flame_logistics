/**
 * Flame Logistics - Mobile Common JavaScript
 * Handles mobile-specific functionality including navigation drawer,
 * component loading, and footer accordion
 */

// Load mobile header component
async function loadMobileHeader() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (!headerPlaceholder) return;
  
  try {
    // Determine the correct path based on page location
    let basePath = '';
    const pathname = window.location.pathname;
    
    // If we're in pages/mobile/, we need to go up two levels
    if (pathname.includes('/pages/mobile/')) {
      basePath = '../../components/';
    } else if (pathname.includes('/pages/')) {
      basePath = '../components/';
    } else {
      basePath = '/components/';
    }
    
    const response = await fetch(basePath + 'header-mobile.html');
    if (response.ok) {
      const html = await response.text();
      headerPlaceholder.innerHTML = html;
      
      // Execute any scripts in the loaded HTML
      const scripts = headerPlaceholder.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
      });
    }
  } catch (error) {
    console.error('Error loading mobile header:', error);
  }
}

// Load mobile footer component
async function loadMobileFooter() {
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (!footerPlaceholder) return;
  
  try {
    // Determine the correct path based on page location
    let basePath = '';
    const pathname = window.location.pathname;
    
    // If we're in pages/mobile/, we need to go up two levels
    if (pathname.includes('/pages/mobile/')) {
      basePath = '../../components/';
    } else if (pathname.includes('/pages/')) {
      basePath = '../components/';
    } else {
      basePath = '/components/';
    }
    
    const response = await fetch(basePath + 'footer-mobile.html');
    if (response.ok) {
      const html = await response.text();
      footerPlaceholder.innerHTML = html;
    }
  } catch (error) {
    console.error('Error loading mobile footer:', error);
  }
}

// Load mobile bottom navigation component
async function loadMobileBottomNav() {
  const bottomNavPlaceholder = document.getElementById('bottom-nav-placeholder');
  if (!bottomNavPlaceholder) return;
  
  try {
    // Determine the correct path based on page location
    let basePath = '';
    const pathname = window.location.pathname;
    
    // If we're in pages/mobile/, we need to go up two levels
    if (pathname.includes('/pages/mobile/')) {
      basePath = '../../components/';
    } else if (pathname.includes('/pages/')) {
      basePath = '../components/';
    } else {
      basePath = '/components/';
    }
    
    const response = await fetch(basePath + 'bottom-nav-mobile.html');
    if (response.ok) {
      const html = await response.text();
      bottomNavPlaceholder.innerHTML = html;
      
      // Highlight active page in bottom nav
      highlightActiveNavItem();
    }
  } catch (error) {
    console.error('Error loading mobile bottom navigation:', error);
  }
}

// Highlight active page in bottom navigation
function highlightActiveNavItem() {
  const pathname = window.location.pathname;
  const filename = pathname.split('/').pop().replace('.html', '');
  
  // Find all nav links
  const navLinks = document.querySelectorAll('#bottom-nav-placeholder a');
  
  navLinks.forEach(link => {
    const page = link.getAttribute('data-page');
    const icon = link.querySelector('.material-symbols-outlined');
    const text = link.querySelector('span:last-child');
    
    if (page === filename) {
      // Active page styling
      link.classList.remove('text-white');
      link.classList.add('text-flame-red');
      if (icon) {
        icon.style.fontVariationSettings = "'FILL' 1";
      }
    } else {
      // Inactive page styling
      link.classList.remove('text-flame-red');
      link.classList.add('text-white');
      if (icon && page !== 'services') {
        icon.style.fontVariationSettings = "'FILL' 0";
      }
    }
  });
}

// Footer accordion toggle function
function toggleFooterAccordion(id) {
  const el = document.getElementById(id);
  const icon = document.getElementById('icon-' + id);
  
  if (el && icon) {
    if (el.classList.contains('hidden')) {
      el.classList.remove('hidden');
      el.classList.add('flex');
      icon.style.transform = 'rotate(180deg)';
    } else {
      el.classList.add('hidden');
      el.classList.remove('flex');
      icon.style.transform = 'rotate(0deg)';
    }
  }
}

// Make toggleFooterAccordion available globally
window.toggleFooterAccordion = toggleFooterAccordion;

function getMobileApiBase() {
  return window.location.port === '3000' ? 'http://localhost:4000' : window.location.origin;
}

async function handleMobileQuoteFormSubmit(event) {
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

    const response = await fetch(`${getMobileApiBase()}/api/contact`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || 'Unable to send your inquiry.');
    }

    if (submitButton) {
      submitButton.innerHTML = 'Request Received';
      submitButton.classList.remove('bg-flame-red');
      submitButton.classList.add('bg-green-600');
    }

    form.reset();
  } catch (error) {
    console.error('Mobile quote form submission failed:', error);
    if (submitButton) {
      submitButton.innerHTML = 'Try again';
    }
  } finally {
    if (submitButton) {
      window.setTimeout(() => {
        submitButton.innerHTML = originalLabel;
        submitButton.disabled = false;
        submitButton.classList.remove('bg-green-600');
        submitButton.classList.add('bg-flame-red');
      }, 2000);
    }
  }
}

function bindMobileQuoteForms() {
  document.querySelectorAll('form.contact-form').forEach((form) => {
    form.removeEventListener('submit', handleMobileQuoteFormSubmit);
    form.addEventListener('submit', handleMobileQuoteFormSubmit);
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  loadMobileHeader();
  loadMobileFooter();
  loadMobileBottomNav();
  bindMobileQuoteForms();
});
