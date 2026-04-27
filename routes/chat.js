const express = require('express');
const { getChatRooms, getChatHistory, sendMessage, markRoomRead, updateMessage, deleteMessage } = require('../controllers/chat');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), getChatRooms);
router.post('/send', protect, sendMessage);
router.put('/:roomId/read', protect, markRoomRead);
router.get('/:userId', protect, getChatHistory);

router.put('/:messageId', protect, updateMessage);
router.delete('/:messageId', protect, deleteMessage);

module.exports = router;
