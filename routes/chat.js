const express = require('express');
const { getChatRooms, getChatHistory, sendMessage, markRoomRead } = require('../controllers/chat');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), getChatRooms);
router.post('/send', protect, sendMessage);
router.put('/:roomId/read', protect, markRoomRead);
router.get('/:userId', protect, getChatHistory);

module.exports = router;
