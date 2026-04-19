// Set env vars BEFORE requiring app so connectDB uses in-memory MongoDB
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

let mongo;
let app;
let User;
let Message;

let userToken;
let userId;
let adminToken;
let otherUserToken;
let otherUserId;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.JWT_SECRET = 'test-secret-for-integration';
  process.env.JWT_EXPIRE = '1d';
  process.env.JWT_COOKIE_EXPIRE = '1';
  process.env.NODE_ENV = 'test';

  // require AFTER env vars are set
  app = require('../server');
  User = require('../models/User');
  Message = require('../models/Message');

  // wait for mongoose connection
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  }

  // --- register users ---
  const aliceRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Alice',
    email: 'alice@test.com',
    telephone: '099-111-1111',
    password: 'pass1234',
  });
  userToken = aliceRes.body.token;
  const alice = await User.findOne({ email: 'alice@test.com' });
  userId = alice._id.toString();

  const bobRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Bob',
    email: 'bob@test.com',
    telephone: '099-222-2222',
    password: 'pass1234',
  });
  otherUserToken = bobRes.body.token;
  const bob = await User.findOne({ email: 'bob@test.com' });
  otherUserId = bob._id.toString();

  const adminRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Admin',
    email: 'admin@test.com',
    telephone: '099-999-9999',
    password: 'pass1234',
    role: 'admin',
  });
  adminToken = adminRes.body.token;
});

afterEach(async () => {
  await Message.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
  // close Socket.IO http server so jest can exit cleanly
  if (app.httpServer && app.httpServer.listening) app.httpServer.close();
});

// -----------------------------------------------------------------------------

describe('POST /api/v1/chat/send', () => {
  it('user saves a message to their own room (201)', async () => {
    const res = await request(app)
      .post('/api/v1/chat/send')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'hello admin' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const msgs = await Message.find({ room: userId });
    expect(msgs).toHaveLength(1);
    expect(msgs[0].content).toBe('hello admin');
    expect(msgs[0].senderRole).toBe('user');
    expect(msgs[0].status).toBe('sent');
  });

  it('trims whitespace from content', async () => {
    await request(app)
      .post('/api/v1/chat/send')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: '   hi   ' });

    const msgs = await Message.find({ room: userId });
    expect(msgs[0].content).toBe('hi');
  });

  it('rejects empty content with 400', async () => {
    const res = await request(app)
      .post('/api/v1/chat/send')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: '   ' });

    expect(res.status).toBe(400);
    expect(await Message.countDocuments({})).toBe(0);
  });

  it('rejects content over 1000 chars with 400', async () => {
    const res = await request(app)
      .post('/api/v1/chat/send')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'a'.repeat(1001) });

    expect(res.status).toBe(400);
    expect(await Message.countDocuments({})).toBe(0);
  });

  it('rejects request without token with 401', async () => {
    const res = await request(app).post('/api/v1/chat/send').send({ content: 'hi' });
    expect(res.status).toBe(401);
  });

  it('admin can send to a specific user room', async () => {
    const res = await request(app)
      .post('/api/v1/chat/send')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'how can I help?', room: userId });

    expect(res.status).toBe(201);
    const msgs = await Message.find({ room: userId });
    expect(msgs).toHaveLength(1);
    expect(msgs[0].senderRole).toBe('admin');
  });
});

// -----------------------------------------------------------------------------

describe('GET /api/v1/chat/:userId', () => {
  beforeEach(async () => {
    await Message.create([
      {
        room: userId,
        sender: userId,
        senderName: 'Alice',
        senderRole: 'user',
        content: 'msg 1',
        timestamp: new Date('2025-01-01T10:00:00Z'),
      },
      {
        room: userId,
        sender: userId,
        senderName: 'Alice',
        senderRole: 'user',
        content: 'msg 2',
        timestamp: new Date('2025-01-01T10:00:01Z'),
      },
    ]);
  });

  it('user can fetch their own chat history', async () => {
    const res = await request(app)
      .get(`/api/v1/chat/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.data[0].content).toBe('msg 1');
  });

  it('admin can fetch any user chat history', async () => {
    const res = await request(app)
      .get(`/api/v1/chat/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });

  it('user CANNOT access another user room (403)', async () => {
    const res = await request(app)
      .get(`/api/v1/chat/${userId}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
  });

  it('no token returns 401', async () => {
    const res = await request(app).get(`/api/v1/chat/${userId}`);
    expect(res.status).toBe(401);
  });
});

// -----------------------------------------------------------------------------

describe('PUT /api/v1/chat/:roomId/read', () => {
  beforeEach(async () => {
    await Message.create({
      room: userId,
      sender: userId,
      senderName: 'Admin',
      senderRole: 'admin',
      content: 'hi from admin',
      status: 'sent',
    });
  });

  it('user marks their own room as read', async () => {
    const res = await request(app)
      .put(`/api/v1/chat/${userId}/read`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    const msgs = await Message.find({ room: userId });
    expect(msgs.every((m) => m.status === 'read')).toBe(true);
  });

  it('admin marks any room as read', async () => {
    const res = await request(app)
      .put(`/api/v1/chat/${userId}/read`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('other user CANNOT mark someone else room (403)', async () => {
    const res = await request(app)
      .put(`/api/v1/chat/${userId}/read`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(403);
    const msgs = await Message.find({ room: userId });
    expect(msgs[0].status).toBe('sent');
  });
});

// -----------------------------------------------------------------------------

describe('GET /api/v1/chat (admin only)', () => {
  beforeEach(async () => {
    await Message.create([
      { room: userId, sender: userId, senderName: 'Alice', senderRole: 'user', content: 'hi' },
      { room: otherUserId, sender: otherUserId, senderName: 'Bob', senderRole: 'user', content: 'hello' },
    ]);
  });

  it('admin can list all rooms', async () => {
    const res = await request(app)
      .get('/api/v1/chat')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    const names = res.body.data.map((r) => r.userName).sort();
    expect(names).toEqual(['Alice', 'Bob']);
  });

  it('regular user gets 403', async () => {
    const res = await request(app)
      .get('/api/v1/chat')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('no token returns 401', async () => {
    const res = await request(app).get('/api/v1/chat');
    expect(res.status).toBe(401);
  });
});
