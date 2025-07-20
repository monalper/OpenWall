// backend/src/routes/admin.user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.use(verifyToken, isAdmin); // Tüm bu rotalar admin yetkisi gerektirir

// GET /api/admin/users -> Tüm kullanıcıları listele
router.get('/', userController.listAllUsers);

// PATCH /api/admin/users/:userId/promote -> Kullanıcının admin yetkisini değiştir (toggle)
router.patch('/:userId/promote', userController.toggleUserAdminStatus);

// PATCH /api/admin/users/:userId/verify -> Kullanıcının doğrulama durumunu değiştir (opsiyonel)
// router.patch('/:userId/verify', userController.toggleUserVerificationStatus);

// DELETE /api/admin/users/:userId -> Kullanıcıyı sil (dikkatli kullanılmalı!)
// router.delete('/:userId', userController.deleteUser);

module.exports = router;
