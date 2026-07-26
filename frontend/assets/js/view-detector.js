/**
 * Mobile/Desktop View Detector
 * Detects viewport width and redirects to appropriate version
 * Works with Chrome DevTools mobile simulation
 */
(function() {
  'use strict';
  
  const MOBILE_BREAKPOINT = 768; // pixels
  const MOBILE_PATH = '/pages/mobile/';
  const DESKTOP_PATH = '/pages/desktop/';
  
  // Get current page name from URL
  function getCurrentPage() {
    const path = window.location.pathname;
    
    // Handle root path
    if (path === '/' || path === '') {
      return 'home.html';
    }
    
    // Extract page name from path
    let pageName = path.split('/').pop();
    
    // Add .html if not present
    if (!pageName.endsWith('.html')) {
      pageName += '.html';
    }
    
    return pageName;
  }
  
  // Check if we're already on the correct version
  function isOnCorrectVersion(isMobile) {
    const path = window.location.pathname;
    if (isMobile) {
      return path.includes('/mobile/');
    } else {
      return path.includes('/desktop/');
    }
  }
  
  // Check if current path is a direct page path (not in mobile/desktop folder)
  function isDirectPath() {
    const path = window.location.pathname;
    return !path.includes('/pages/mobile/') && !path.includes('/pages/desktop/');
  }
  
  // Detect if viewport is mobile size
  function isMobileViewport() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }
  
  // Redirect to appropriate version
  function redirectToCorrectVersion() {
    const isMobile = isMobileViewport();
    const pageName = getCurrentPage();
    
    // Skip if already on correct version
    if (!isDirectPath() && isOnCorrectVersion(isMobile)) {
      return;
    }
    
    // Build new URL
    const basePath = isMobile ? MOBILE_PATH : DESKTOP_PATH;
    const newUrl = basePath + pageName + window.location.search + window.location.hash;
    
    // Only redirect if URL is different
    if (window.location.pathname !== newUrl.split('?')[0].split('#')[0]) {
      console.log(`[ViewDetector] Redirecting to ${isMobile ? 'mobile' : 'desktop'} version: ${newUrl}`);
      window.location.href = newUrl;
    }
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', redirectToCorrectVersion);
  } else {
    redirectToCorrectVersion();
  }
  
  // Optional: Handle resize events (uncomment if you want live switching)
  // let resizeTimeout;
  // window.addEventListener('resize', function() {
  //   clearTimeout(resizeTimeout);
  //   resizeTimeout = setTimeout(redirectToCorrectVersion, 250);
  // });
})();
