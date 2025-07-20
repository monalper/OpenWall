// backend/src/routes/user.routes.js
const express = require('express'); // Sadece bir kere, genellikle en üstte
const router = express.Router();
const userController = require('../controllers/user.controller'); // Bu dosyanın da var olması ve doğru exportları yapması gerekir

// GET /api/users/:username -> Kullanıcı profili (username ile)
router.get('/:username', userController.getUserProfileByUsername);

module.exports = router;