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
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:4000'
      : 'https://flame-logistics-backend.vercel.app';
  }
  return 'https://flame-logistics-backend.vercel.app';
}

// ===== Global Success Modal =====
function showSuccessModal(message) {
  let modal = document.getElementById('global-success-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'global-success-modal';
    modal.className = 'fixed inset-0 z-[100] hidden items-end justify-center bg-black/60';
    modal.innerHTML = `
      <div class="relative w-full rounded-t-3xl bg-white p-8 pb-10 text-center shadow-2xl">
        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-flame-red/10 text-flame-red">
          <span class="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h3 class="font-headline-sm text-headline-sm text-trust-navy mb-3">Successfully Submitted!</h3>
        <p id="global-success-modal-message" class="text-on-surface-variant text-sm mb-8"></p>
        <button type="button" id="global-success-modal-ok" class="w-full rounded-xl bg-flame-red px-6 py-4 font-bold text-white active:scale-[0.98] transition-transform">OK</button>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };
    modal.querySelector('#global-success-modal-ok').addEventListener('click', close);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });
  }

  modal.querySelector('#global-success-modal-message').textContent = message || 'Your request has been submitted successfully.';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// ===== CV / Resume Upload Feedback =====
const CV_MAX_BYTES = 10 * 1024 * 1024;

function handleCvFileSelect(input) {
  const label = document.getElementById('cv-file-name');
  if (!label) return;

  const file = input.files && input.files[0];
  if (!file) {
    label.textContent = 'No file selected';
    label.className = 'mt-2 text-xs text-on-surface-variant';
    return;
  }

  if (file.size > CV_MAX_BYTES) {
    label.textContent = `"${file.name}" is too large (max 10MB). Please choose a smaller file.`;
    label.className = 'mt-2 text-xs font-semibold text-red-600';
    input.value = '';
    return;
  }

  label.textContent = `✓ "${file.name}" uploaded successfully`;
  label.className = 'mt-2 text-xs font-semibold text-green-600';
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
    showSuccessModal(result.message || 'Your inquiry was submitted successfully. Our team will get back to you shortly.');
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
  bindMobileQuoteForms();
});
