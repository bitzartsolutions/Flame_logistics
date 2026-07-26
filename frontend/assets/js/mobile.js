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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  loadMobileHeader();
  loadMobileFooter();
  loadMobileBottomNav();
});
