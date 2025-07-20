// backend/src/routes/article.routes.js (Herkese Açık Rotalar)
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const { verifyToken } = require('../middlewares/auth.middleware'); // Opsiyonel, bazı article endpointleri için gerekebilir

// GET /api/articles -> Tüm yayınlanmış makaleleri listele (status = published)
router.get('/', articleController.listPublishedArticles);

// GET /api/articles/highlights -> Öne çıkan makaleleri getir
router.get('/highlights', articleController.getHighlightedArticles);

// GET /api/articles/:slug -> Belirli bir makaleyi oku
router.get('/:slug', articleController.getArticleBySlug);

module.exports = router;