// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// POST /api/auth/register (Sadece sistem yöneticisi tarafından yapılır)
// Yeni kullanıcı (özellikle admin) oluşturma endpoint'i.
// verifyToken: Geçerli bir token olup olmadığını kontrol eder.
// isAdmin: Token sahibi kullanıcının admin yetkisine sahip olup olmadığını kontrol eder.
router.post('/register', verifyToken, isAdmin, authController.register);

// POST /api/auth/login
// Kullanıcı giriş endpoint'i. Başarılı girişte JWT token döner.
router.post('/login', authController.login);

// GET /api/auth/me (JWT ile kimlik doğrulama)
// Mevcut token ile giriş yapmış kullanıcının bilgilerini almak için kullanılır.
// verifyToken: Token'ı doğrular ve req.user objesine kullanıcı bilgilerini ekler.
router.get('/me', verifyToken, authController.getMe);

module.exports = router;