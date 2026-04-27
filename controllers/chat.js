const Message = require('../models/Message');
const { getIO } = require('../utils/socketInstance');

//@desc Get all chat rooms with latest message (admin only)
//@route GET /api/v1/chat
//@access Private (admin)
exports.getChatRooms = async (req, res) => {
  try {
    const rooms = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$room',
          lastMessage: { $first: '$content' },
          lastTimestamp: { $first: '$timestamp' },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] },
          },
          allRoles: { $push: '$senderRole' },
          allNames: { $push: '$senderName' },
        },
      },
      {
        $addFields: {
          userNameIndex: { $indexOfArray: ['$allRoles', 'user'] },
        },
      },
      {
        $addFields: {
          userName: {
            $cond: [
              { $gte: ['$userNameIndex', 0] },
              { $arrayElemAt: ['$allNames', '$userNameIndex'] },
              'Unknown',
            ],
          },
        },
      },
      {
        $project: {
          lastMessage: 1,
          lastTimestamp: 1,
          unreadCount: 1,
          userName: 1,
        },
      },
      { $sort: { lastTimestamp: -1 } },
    ]);

    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to fetch chat rooms' });
  }
};

//@desc Get chat history for a room
//@route GET /api/v1/chat/:userId
//@access Private
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ success: false, msg: 'Not authorized' });
    }

    const messages = await Message.find({ 
      room: userId,
      isDeleted: { $ne: true } // 👈 important
      })
      .sort({ timestamp: 1 })
      .limit(100);

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to fetch chat history' });
  }
};

//@desc Mark all messages in a room as read (REST fallback for markRead)
//@route PUT /api/v1/chat/:roomId/read
//@access Private
exports.markRoomRead = async (req, res) => {
  try {
    const { roomId } = req.params;

    // user can only mark their own room; admin can mark any room
    if (req.user.role !== 'admin' && req.user.id !== roomId) {
      return res.status(403).json({ success: false, msg: 'Not authorized' });
    }

    await Message.updateMany({ room: roomId, status: 'sent' }, { status: 'read' });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to mark messages as read' });
  }
};

//@desc Send message via REST (fallback when WebSocket unavailable)
//@route POST /api/v1/chat/send
//@access Private
exports.sendMessage = async (req, res) => {
  try {
    const { content, room } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, msg: 'Message content cannot be empty' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ success: false, msg: 'Message cannot exceed 1000 characters' });
    }

    const roomId = req.user.role === 'user' ? req.user.id : room;
    if (!roomId) {
      return res.status(400).json({ success: false, msg: 'Room is required' });
    }

    const message = await Message.create({
      room: roomId,
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      content: content.trim(),
      status: 'sent',
    });

    const io = getIO();
    if (io) {
      io.to(`room:${roomId}`).emit('receive_message', {
        _id: message._id,
        room: roomId,
        sender: req.user._id,
        senderName: req.user.name,
        senderRole: req.user.role,
        content: message.content,
        status: message.status,
        timestamp: message.timestamp,
      });
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to send message' });
  }
};

//@desc Update a message
//@route PUT /api/v1/chat/:messageId
//@access Private
exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, msg: 'Content cannot be empty' });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, msg: 'Message not found' });
    }

    // Only sender can edit
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, msg: 'Not authorized' });
    }

    message.content = content.trim();
    await message.save();

    // emit update via socket
    const io = getIO();
    if (io) {
      io.to(`room:${message.room}`).emit('message_updated', message);
    }

    res.status(200).json({ success: true, data: message });

  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to update message' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, msg: 'Message not found' });
    }

    // Only sender OR admin can delete
    if (
      message.sender.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, msg: 'Not authorized' });
    }

    message.isDeleted = true;
    message.content = '[deleted]';
    await message.save();

    const io = getIO();
    if (io) {
      io.to(`room:${message.room}`).emit('message_deleted', {
        _id: message._id,
      });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, msg: 'Failed to delete message' });
  }
};