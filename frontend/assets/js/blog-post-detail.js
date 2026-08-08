(function () {
  'use strict';

  const BLOG_API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:4000'
    : '';

  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');

  const titleEl = document.getElementById('article-title');
  const metaEl = document.getElementById('article-meta');
  const heroImageEl = document.getElementById('article-hero-image');
  const excerptEl = document.getElementById('article-excerpt');
  const contentEl = document.getElementById('article-content');
  const loadingEl = document.getElementById('article-loading');
  const errorEl = document.getElementById('article-error');
  const wrapperEl = document.getElementById('article-content-wrapper');
  const backLinkEl = document.getElementById('back-to-blog');

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(dateString) {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  function renderContent(content) {
    const paragraphs = (content || '').split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
    if (!paragraphs.length) {
      return '<p class="text-body-lg text-on-surface-variant">No content available yet.</p>';
    }

    return paragraphs.map((paragraph) => `<p class="text-body-lg text-on-surface-variant leading-8">${escapeHtml(paragraph)}</p>`).join('');
  }

  function showLoading() {
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (errorEl) errorEl.classList.add('hidden');
    if (wrapperEl) wrapperEl.classList.add('hidden');
  }

  function showError(message) {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (wrapperEl) wrapperEl.classList.add('hidden');
    if (errorEl) {
      errorEl.classList.remove('hidden');
      errorEl.innerHTML = `
        <div class="rounded-3xl border border-dashed border-outline-variant/40 bg-white p-10 text-center">
          <h2 class="font-headline-md text-headline-md text-primary mb-3">Article unavailable</h2>
          <p class="text-body-lg text-on-surface-variant">${escapeHtml(message)}</p>
        </div>
      `;
    }
  }

  async function loadArticle() {
    if (!postId) {
      showError('This article could not be opened because no article ID was provided.');
      return;
    }

    showLoading();

    try {
      const response = await fetch(`${BLOG_API_BASE}/api/blog/${postId}`);
      if (!response.ok) {
        throw new Error('The article could not be loaded right now.');
      }

      const post = await response.json();
      if (!post) {
        throw new Error('The requested article was not found.');
      }

      document.title = `${post.title} | Flame Logistics`;

      if (titleEl) titleEl.textContent = post.title;
      if (metaEl) {
        metaEl.innerHTML = `
          <span class="rounded-full bg-secondary/10 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-secondary">${escapeHtml(post.category || 'Insights')}</span>
          <span class="text-sm text-on-surface-variant">${escapeHtml(formatDate(post.date))}</span>
          <span class="text-sm text-on-surface-variant">•</span>
          <span class="text-sm text-on-surface-variant">${escapeHtml(post.readTime || '5 min read')}</span>
        `;
      }
      if (heroImageEl) {
        heroImageEl.src = post.imageUrl || 'https://via.placeholder.com/1200x700?text=Image+Unavailable';
        heroImageEl.alt = post.title;
      }
      if (excerptEl) excerptEl.textContent = post.excerpt || '';
      if (contentEl) contentEl.innerHTML = renderContent(post.content || post.excerpt || '');
      if (backLinkEl) backLinkEl.href = 'blog.html';
      if (loadingEl) loadingEl.classList.add('hidden');
      if (wrapperEl) wrapperEl.classList.remove('hidden');
    } catch (error) {
      showError(error.message || 'Unable to load this article.');
    }
  }

  loadArticle();
})();
