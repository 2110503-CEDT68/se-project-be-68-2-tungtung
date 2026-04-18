const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  senderRole: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content cannot be empty'],
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['sent', 'read'],
    default: 'sent',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', MessageSchema);
