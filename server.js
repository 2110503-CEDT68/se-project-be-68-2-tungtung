const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const providers = require('./routes/providers');
const bookings = require('./routes/bookings');
const auth = require('./routes/auth');

const app = express();
app.set('query parser', 'extended');

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/providers', providers);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/auth', auth);

// ← ลบ app.listen() ออก แล้ว export แทน
module.exports = app;