const express = require('express');
const router = express.Router();
const { processChat } = require('../controllers/chatController');

// @route   POST /api/chat
// @desc    Chat with AI Bot
// @access  Public (or Private)
router.post('/', processChat);

module.exports = router;
