const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const uploadController = require('../controllers/upload.controller');

// POST /api/upload/cover -> Makale kapağı için presigned URL al
// Sadece adminler makale kapağı yükleyebilmeli
router.post('/cover', verifyToken, isAdmin, uploadController.getPresignedUrlForCover);

// POST /api/upload/avatar -> Profil fotoğrafı için presigned URL al
// Tüm giriş yapmış kullanıcılar avatar yükleyebilmeli (kendileri için)
router.post('/avatar', verifyToken, uploadController.getPresignedUrlForAvatar);

// POST /api/upload/content-image -> Makale içeriği için presigned URL al
// Sadece adminler makale içeriği görseli yükleyebilmeli
router.post('/content-image', verifyToken, isAdmin, uploadController.getPresignedUrlForContentImage);

module.exports = router;