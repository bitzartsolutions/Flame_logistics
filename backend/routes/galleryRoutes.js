const express = require('express');
const router = express.Router();
const { getGallery, saveGallery } = require('../src/storage');
const { normalizeImageUrl, getPublicBaseUrl } = require('../src/imageUrls');

// GET /api/gallery
router.get('/', (req, res) => {
  try {
    const category = (req.query.category || 'all').toString().toLowerCase();
    const q = (req.query.q || '').toString().toLowerCase().trim();
    const limit = Number(req.query.limit || 0);

    let results = getGallery();

    if (category !== 'all') {
      results = results.filter((item) => (item.category || '').toLowerCase() === category);
    }

    if (q) {
      results = results.filter(
        (item) =>
          (item.title || '').toLowerCase().includes(q) ||
          (item.subtitle || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q)
      );
    }

    if (limit > 0) {
      results = results.slice(0, limit);
    }

    res.json({ items: results, total: results.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

// POST /api/gallery
router.post('/', (req, res) => {
  try {
    const { title, subtitle, category, description, imageUrl, mobileAspect, desktopLayout } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and imageUrl are required' });
    }

    const items = getGallery();
    const newId = items.length > 0 ? Math.max(...items.map((i) => Number(i.id) || 0)) + 1 : 1;

    const newItem = {
      id: newId,
      category: (category || 'transportation').toLowerCase().trim(),
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : 'Showcase',
      description: description ? description.trim() : '',
      imageUrl: normalizeImageUrl(imageUrl, getPublicBaseUrl(req, 'http://localhost:4000')).trim(),
      mobileAspect: mobileAspect || 'aspect-square',
      desktopLayout: desktopLayout || 'default',
      createdAt: new Date().toISOString()
    };

    items.unshift(newItem); // Add new item to the beginning
    saveGallery(items);

    res.status(201).json({ message: 'Gallery image added successfully', item: newItem });
  } catch (error) {
    console.error('Error adding gallery image:', error);
    res.status(500).json({ error: 'Failed to add gallery image' });
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', (req, res) => {
  try {
    const itemId = Number(req.params.id);
    let items = getGallery();

    const exists = items.some((i) => Number(i.id) === itemId);
    if (!exists) {
      return res.status(404).json({ error: 'Gallery item not found', id: req.params.id });
    }

    items = items.filter((i) => Number(i.id) !== itemId);
    saveGallery(items);

    res.json({ message: 'Gallery item deleted successfully', id: itemId });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Failed to delete gallery item', detail: error.message });
  }
});

module.exports = router;
