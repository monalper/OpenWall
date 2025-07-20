// backend/src/routes/admin.article.routes.js (Admin Rotaları)
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Bu dosyadaki tüm rotalar için admin yetkisi ve token gerekir
router.use(verifyToken);
router.use(isAdmin);

// GET /api/admin/articles -> Tüm makaleleri listele (taslaklar dahil)
router.get('/', articleController.listAllArticlesForAdmin);

// POST /api/admin/articles/create -> Yeni makale oluştur (Sadece isAdmin: true kullanıcılar)
router.post('/create', articleController.createArticle);

// GET /api/admin/articles/:slug/details -> Admin için makale detayları (taslaklar dahil)
router.get('/:slug/details', articleController.getArticleBySlugForAdmin);

// PUT /api/admin/articles/:slug/edit -> Makale düzenle
router.put('/:slug/edit', articleController.updateArticle);

// DELETE /api/admin/articles/:slug/delete -> Makale sil
router.delete('/:slug/delete', articleController.deleteArticle);

// PUT /api/admin/articles/:slug/highlight -> Makale öne çıkarma durumunu değiştir
router.put('/:slug/highlight', articleController.toggleArticleHighlight);

module.exports = router;