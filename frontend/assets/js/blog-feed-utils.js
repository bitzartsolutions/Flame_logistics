(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.BlogFeedUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function normalizeItems(items) {
    return Array.isArray(items) ? items.filter(Boolean) : [];
  }

  function resolveFeaturedAndFeedPosts(items, featuredOverride = null) {
    const safeItems = normalizeItems(items);
    if (!safeItems.length) {
      return { featured: null, feed: [] };
    }

    const featuredCandidate = featuredOverride || safeItems.find((post) => Boolean(post && post.featured)) || safeItems[0] || null;
    if (!featuredCandidate) {
      return { featured: null, feed: safeItems };
    }

    const featuredId = featuredCandidate.id !== undefined && featuredCandidate.id !== null ? Number(featuredCandidate.id) : null;
    const feed = safeItems.length > 1
      ? safeItems.filter((post) => {
          const postId = post && post.id !== undefined && post.id !== null ? Number(post.id) : null;
          return featuredId === null || postId !== featuredId;
        })
      : [];

    return { featured: featuredCandidate, feed };
  }

  return {
    resolveFeaturedAndFeedPosts
  };
});
