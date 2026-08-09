const express = require('express');
const router = express.Router();
const { getContent, createContent, deleteContent } = require('../src/contentStore');
const { normalizeImageUrl, getPublicBaseUrl } = require('../src/imageUrls');

// GET /api/gallery
router.get('/', async (req, res) => {
  try {
    const category = (req.query.category || 'all').toString().toLowerCase();
    const q = (req.query.q || '').toString().toLowerCase().trim();
    const limit = Number(req.query.limit || 0);

    const [photoItems, videoItems] = await Promise.all([
      getContent('gallery', []),
      getContent('galleryVideo', [])
    ]);

    let results = [...(photoItems || []), ...(videoItems || [])].sort((a, b) => {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    results = (results || []).map((item) => {
      const hasYoutube = Boolean((item.youtubeUrl || '').toString().trim());
      const normalizedMediaType = (item.mediaType || '').toString().trim().toLowerCase();
      const resolvedMediaType = normalizedMediaType || (hasYoutube ? 'video' : 'image');
      return {
        ...item,
        mediaType: resolvedMediaType,
        youtubeUrl: (item.youtubeUrl || '').toString().trim(),
        thumbnailUrl: item.thumbnailUrl || item.imageUrl || ''
      };
    });

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
router.post('/', async (req, res) => {
  try {
    const { title, subtitle, category, description, imageUrl, youtubeUrl, mobileAspect, desktopLayout, mediaType } = req.body;

    const resolvedImageUrl = (imageUrl || '').toString().trim();
    const resolvedYoutubeUrl = (youtubeUrl || '').toString().trim();
    const resolvedMediaType = resolvedYoutubeUrl ? 'video' : ((mediaType || '').toString().trim().toLowerCase() || 'image');

    if (!title || (!resolvedImageUrl && !resolvedYoutubeUrl)) {
      return res.status(400).json({ error: 'Title and either an image URL or a YouTube link are required' });
    }

    const [photoItems, videoItems] = await Promise.all([
      getContent('gallery', []),
      getContent('galleryVideo', [])
    ]);
    const allIds = [...photoItems, ...videoItems].map((i) => Number(i.id) || 0);
    const newId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;

    const isVideo = resolvedMediaType === 'video';

    const thumbnailUrl = resolvedYoutubeUrl
      ? `https://img.youtube.com/vi/${extractYouTubeVideoId(resolvedYoutubeUrl)}/hqdefault.jpg`
      : normalizeImageUrl(resolvedImageUrl, getPublicBaseUrl(req, 'http://localhost:4000')).trim();

    let savedItem;

    if (isVideo) {
      const newVideoItem = {
        id: newId,
        category: (category || 'transportation').toLowerCase().trim(),
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : 'Showcase',
        description: description ? description.trim() : '',
        youtubeUrl: resolvedYoutubeUrl,
        thumbnailUrl,
        created_at: new Date().toISOString()
      };

      savedItem = await createContent('galleryVideo', newVideoItem);
    } else {
      const newPhotoItem = {
        id: newId,
        category: (category || 'transportation').toLowerCase().trim(),
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : 'Showcase',
        description: description ? description.trim() : '',
        imageUrl: normalizeImageUrl(resolvedImageUrl, getPublicBaseUrl(req, 'http://localhost:4000')).trim(),
        mobileAspect: mobileAspect || '',
        desktopLayout: desktopLayout || '',
        created_at: new Date().toISOString()
      };

      savedItem = await createContent('gallery', newPhotoItem);
    }

    if (!savedItem) {
      return res.status(500).json({ error: 'Failed to save gallery item' });
    }

    res.status(201).json({
      message: isVideo ? 'Gallery video added successfully' : 'Gallery image added successfully',
      item: savedItem
    });
  } catch (error) {
    console.error('Error adding gallery image:', error);
    res.status(500).json({ error: 'Failed to add gallery image' });
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const deleted = (await deleteContent('gallery', itemId)) || (await deleteContent('galleryVideo', itemId));

    if (!deleted) {
      return res.status(404).json({ error: 'Gallery item not found', id: req.params.id });
    }

    res.json({ message: 'Gallery item deleted successfully', id: itemId });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Failed to delete gallery item', detail: error.message });
  }
});

function extractYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v') || '';
    }
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace(/^\//, '');
    }
  } catch (error) {
    return '';
  }
  return '';
}

module.exports = router;
