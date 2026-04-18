const express = require('express');
const { getChatRooms, getChatHistory, sendMessage } = require('../controllers/chat');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), getChatRooms);
router.post('/send', protect, sendMessage);
router.get('/:userId', protect, getChatHistory);

module.exports = router;
