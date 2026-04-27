const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const User = require('./models/User');
const Message = require('./models/Message');
const { setIO } = require('./utils/socketInstance');
const swaggerSpec = require('./docs/swaggerSpec');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const providers = require('./routes/providers');
const bookings = require('./routes/bookings');
const auth = require('./routes/auth');
const chat = require('./routes/chat');
const reviews = require('./routes/reviews');

const app = express();
app.set('query parser', 'extended');

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());

app.get('/api-docs.json', (req, res) => {
  res.status(200).json(swaggerSpec);
});

app.use(
  '/api/v1/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Rental Car Booking System API Docs',
  })
);

app.use('/api/v1/providers', providers);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/auth', auth);
app.use('/api/v1/chat', chat);
app.use('/api/v1/reviews', reviews);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setIO(io);

// Authenticate Socket.IO connections via JWT
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const user = socket.user;

  // Users auto-join their own room; admins join on request
  if (user.role === 'user') {
    socket.join(`room:${user._id}`);
  }

  socket.on('join_room', (roomId) => {
    if (user.role === 'admin') {
      socket.join(`room:${roomId}`);
    }
  });

  socket.on('send_message', async ({ content, room }) => {
    if (!content || content.trim().length === 0) return;
    if (content.trim().length > 1000) return;

    const roomId = user.role === 'user' ? user._id.toString() : room;
    if (!roomId) return;

    try {
      const message = await Message.create({
        room: roomId,
        sender: user._id,
        senderName: user.name,
        senderRole: user.role,
        content: content.trim(),
        status: 'sent',
      });

      io.to(`room:${roomId}`).emit('receive_message', {
        _id: message._id,
        room: roomId,
        sender: user._id,
        senderName: user.name,
        senderRole: user.role,
        content: message.content,
        status: message.status,
        timestamp: message.timestamp,
      });
    } catch (err) {
      socket.emit('message_error', { msg: 'Failed to send message' });
    }
  });

  socket.on('mark_read', async (roomId) => {
    // admin marks any room; user marks only their own room
    const allowedRoom = user.role === 'admin' ? roomId : user._id.toString();
    if (!allowedRoom || (user.role === 'user' && roomId !== allowedRoom)) return;
    try {
      await Message.updateMany({ room: allowedRoom, status: 'sent' }, { status: 'read' });
      io.to(`room:${allowedRoom}`).emit('messages_read', { room: allowedRoom });
    } catch (err) {
      // silently ignore mark_read errors
    }
  });
});

// Vercel uses `require('./server')` → ต้องการ app โดยตรง
// app.js ใช้ `.httpServer` สำหรับ local listen()
module.exports = app;
module.exports.httpServer = httpServer;
