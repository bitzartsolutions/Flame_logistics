const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveFeaturedAndFeedPosts } = require('./blog-feed-utils');

test('shows the only published post once as the featured item', () => {
  const post = { id: 1, title: 'Only post', featured: true };
  const result = resolveFeaturedAndFeedPosts([post], null);

  assert.equal(result.featured.id, 1);
  assert.deepEqual(result.feed, []);
});
