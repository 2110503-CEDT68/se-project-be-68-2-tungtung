jest.mock('../models/Message', () => ({
  aggregate: jest.fn(),
  find: jest.fn(),
  updateMany: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../models/Review', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('../models/Provider', () => ({
  findById: jest.fn(),
}));

jest.mock('../models/Booking', () => ({
  exists: jest.fn(),
}));

jest.mock('../utils/socketInstance', () => ({
  getIO: jest.fn(),
}));

const mongoose = require('mongoose');
const Message = require('../models/Message');
const Review = require('../models/Review');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const { getIO } = require('../utils/socketInstance');

const chatController = require('../controllers/chat');
const reviewsController = require('../controllers/reviews');

const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

const makeReviewQuery = (result, shouldReject = false) => {
  const base = shouldReject ? Promise.reject(result) : Promise.resolve(result);
  base.populate = jest.fn(() => base);
  base.sort = jest.fn(() => base);
  return base;
};

describe('Chat and Reviews Logic Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('chat controller', () => {
    test('getChatRooms success and failure', async () => {
      const req = {};
      const res = createRes();
      Message.aggregate.mockResolvedValueOnce([{ _id: 'room1' }]);

      await chatController.getChatRooms(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 1, data: [{ _id: 'room1' }] });

      Message.aggregate.mockRejectedValueOnce(new Error('db'));
      await chatController.getChatRooms(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getChatHistory unauthorized, success, and failure', async () => {
      const res = createRes();

      await chatController.getChatHistory(
        { params: { userId: 'u1' }, user: { role: 'user', id: 'u2' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(403);

      const query = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ _id: 'm1' }]),
      };
      Message.find.mockReturnValueOnce(query);
      await chatController.getChatHistory(
        { params: { userId: 'u1' }, user: { role: 'admin', id: 'a1' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(200);

      Message.find.mockImplementationOnce(() => {
        throw new Error('db');
      });
      await chatController.getChatHistory(
        { params: { userId: 'u1' }, user: { role: 'admin', id: 'a1' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('markRoomRead unauthorized, success, and failure', async () => {
      const res = createRes();

      await chatController.markRoomRead(
        { params: { roomId: 'u1' }, user: { role: 'user', id: 'u2' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(403);

      Message.updateMany.mockResolvedValueOnce({ modifiedCount: 1 });
      await chatController.markRoomRead(
        { params: { roomId: 'u1' }, user: { role: 'admin', id: 'a1' } },
        res
      );
      expect(Message.updateMany).toHaveBeenCalledWith(
        { room: 'u1', status: 'sent' },
        { status: 'read' }
      );
      expect(res.status).toHaveBeenCalledWith(200);

      Message.updateMany.mockRejectedValueOnce(new Error('db'));
      await chatController.markRoomRead(
        { params: { roomId: 'u1' }, user: { role: 'admin', id: 'a1' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('sendMessage validation and success branches', async () => {
      const res = createRes();

      await chatController.sendMessage(
        { body: { content: '   ' }, user: { role: 'user', id: 'u1' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);

      await chatController.sendMessage(
        { body: { content: 'a'.repeat(1001) }, user: { role: 'user', id: 'u1' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);

      await chatController.sendMessage(
        {
          body: { content: 'ok', room: '' },
          user: { role: 'admin', id: 'a1', _id: 'a1', name: 'Admin' },
        },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);

      const io = { to: jest.fn(() => ({ emit: jest.fn() })) };
      getIO.mockReturnValueOnce(io);
      Message.create.mockResolvedValueOnce({
        _id: 'm1',
        content: 'hi',
        status: 'sent',
        timestamp: new Date().toISOString(),
      });
      await chatController.sendMessage(
        {
          body: { content: '  hi  ' },
          user: { role: 'user', id: 'u1', _id: 'u1', name: 'Alice' },
        },
        res
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(io.to).toHaveBeenCalledWith('room:u1');

      getIO.mockReturnValueOnce(null);
      Message.create.mockResolvedValueOnce({ _id: 'm2', content: 'x', status: 'sent' });
      await chatController.sendMessage(
        {
          body: { content: 'x', room: 'u2' },
          user: { role: 'admin', id: 'a1', _id: 'a1', name: 'Admin' },
        },
        res
      );
      expect(res.status).toHaveBeenCalledWith(201);

      Message.create.mockRejectedValueOnce(new Error('db'));
      await chatController.sendMessage(
        {
          body: { content: 'x', room: 'u2' },
          user: { role: 'admin', id: 'a1', _id: 'a1', name: 'Admin' },
        },
        res
      );
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('reviews controller', () => {
    test('getReviews with and without providerId, and error', async () => {
      const res = createRes();
      Review.find.mockReturnValueOnce(makeReviewQuery([{ _id: 'r1' }]));
      await reviewsController.getReviews({ params: { providerId: 'p1' } }, res);
      expect(Review.find).toHaveBeenCalledWith({ provider: 'p1' });
      expect(res.status).toHaveBeenCalledWith(200);

      Review.find.mockReturnValueOnce(makeReviewQuery([{ _id: 'r2' }]));
      await reviewsController.getReviews({ params: {} }, res);
      expect(Review.find).toHaveBeenCalledWith();

      Review.find.mockReturnValueOnce(makeReviewQuery(new Error('db'), true));
      await reviewsController.getReviews({ params: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('getReview not found and error branches', async () => {
      const res = createRes();
      Review.findById.mockReturnValueOnce(makeReviewQuery(null));
      await reviewsController.getReview({ params: { id: 'r1' } }, res);
      expect(res.status).toHaveBeenCalledWith(404);

      Review.findById.mockReturnValueOnce(makeReviewQuery(new Error('db'), true));
      await reviewsController.getReview({ params: { id: 'r1' } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('createReview validation branches and success', async () => {
      const res = createRes();
      const baseReq = { params: { providerId: 'p1' }, user: { id: 'u1' }, body: {} };
      const objectIdSpy = jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);

      await reviewsController.createReview({ ...baseReq, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);

      objectIdSpy.mockReturnValueOnce(false);
      await reviewsController.createReview(
        { ...baseReq, body: { rating: 5, comment: 'ok' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(404);

      objectIdSpy.mockReturnValue(true);
      await reviewsController.createReview(
        { ...baseReq, body: { rating: 5.5, comment: 'ok' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);

      await reviewsController.createReview(
        { ...baseReq, body: { rating: 5, comment: '   ' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);

      await reviewsController.createReview(
        { ...baseReq, body: { rating: 5, comment: 'a'.repeat(1001) } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);

      Provider.findById.mockResolvedValueOnce(null);
      await reviewsController.createReview(
        { ...baseReq, body: { rating: 5, comment: 'ok' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(404);

      Provider.findById.mockResolvedValueOnce({ _id: 'p1' });
      Booking.exists.mockResolvedValueOnce(false);
      await reviewsController.createReview(
        { ...baseReq, body: { rating: 5, comment: 'ok' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(403);

      Provider.findById.mockResolvedValueOnce({ _id: 'p1' });
      Booking.exists.mockResolvedValueOnce(true);
      Review.findOne.mockResolvedValueOnce({ _id: 'r-existing' });
      await reviewsController.createReview(
        { ...baseReq, body: { rating: 5, comment: 'ok' } },
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);

      Provider.findById.mockResolvedValueOnce({ _id: 'p1' });
      Booking.exists.mockResolvedValueOnce(true);
      Review.findOne.mockResolvedValueOnce(null);
      Review.create.mockResolvedValueOnce({ _id: 'r1', rating: 5, comment: 'ok' });
      const req = { ...baseReq, body: { rating: 5, comment: 'ok' } };
      await reviewsController.createReview(req, res);
      expect(req.body.provider).toBe('p1');
      expect(req.body.user).toBe('u1');
      expect(res.status).toHaveBeenCalledWith(201);

      objectIdSpy.mockRestore();
    });

    test('createReview catch branches: duplicate, validation, generic', async () => {
      const res = createRes();
      const objectIdSpy = jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
      const req = {
        params: { providerId: 'p1' },
        user: { id: 'u1' },
        body: { rating: 5, comment: 'ok' },
      };

      Provider.findById.mockResolvedValue({ _id: 'p1' });
      Booking.exists.mockResolvedValue(true);
      Review.findOne.mockResolvedValue(null);
      Review.create.mockRejectedValueOnce({ code: 11000 });
      await reviewsController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      Review.create.mockRejectedValueOnce({
        name: 'ValidationError',
        errors: { rating: { message: 'bad rating' } },
      });
      await reviewsController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'bad rating' });

      Review.create.mockRejectedValueOnce(new Error('db')); 
      await reviewsController.createReview(req, res);
      expect(res.status).toHaveBeenCalledWith(500);

      objectIdSpy.mockRestore();
    });

    test('updateReview branches and catch handling', async () => {
      const res = createRes();
      const baseReq = { params: { id: 'r1' }, user: { id: 'u1' }, body: {} };

      Review.findById.mockResolvedValueOnce(null);
      await reviewsController.updateReview(baseReq, res);
      expect(res.status).toHaveBeenCalledWith(404);

      Review.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
      await reviewsController.updateReview(baseReq, res);
      expect(res.status).toHaveBeenCalledWith(403);

      Review.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
      await reviewsController.updateReview({ ...baseReq, body: { rating: 9 } }, res);
      expect(res.status).toHaveBeenCalledWith(400);

      Review.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
      await reviewsController.updateReview({ ...baseReq, body: { comment: '  ' } }, res);
      expect(res.status).toHaveBeenCalledWith(400);

      Review.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
      await reviewsController.updateReview({ ...baseReq, body: { comment: 'a'.repeat(1001) } }, res);
      expect(res.status).toHaveBeenCalledWith(400);

      const review = {
        user: { toString: () => 'u1' },
        save: jest.fn().mockResolvedValue({ _id: 'r1', rating: 4, comment: 'ok' }),
      };
      Review.findById.mockResolvedValueOnce(review);
      await reviewsController.updateReview(
        { ...baseReq, body: { rating: 4, comment: 'ok' } },
        res
      );
      expect(review.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);

      Review.findById.mockRejectedValueOnce({
        name: 'ValidationError',
        errors: { comment: { message: 'bad comment' } },
      });
      await reviewsController.updateReview(baseReq, res);
      expect(res.status).toHaveBeenCalledWith(400);

      Review.findById.mockRejectedValueOnce(new Error('db'));
      await reviewsController.updateReview(baseReq, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('deleteReview not found, unauthorized, success, and error', async () => {
      const res = createRes();
      const req = { params: { id: 'r1' }, user: { id: 'u1' } };

      Review.findById.mockResolvedValueOnce(null);
      await reviewsController.deleteReview(req, res);
      expect(res.status).toHaveBeenCalledWith(404);

      Review.findById.mockResolvedValueOnce({ user: { toString: () => 'u2' } });
      await reviewsController.deleteReview(req, res);
      expect(res.status).toHaveBeenCalledWith(403);

      Review.findById.mockResolvedValueOnce({ user: { toString: () => 'u1' } });
      Review.findByIdAndDelete.mockResolvedValueOnce({});
      await reviewsController.deleteReview(req, res);
      expect(Review.findByIdAndDelete).toHaveBeenCalledWith('r1');
      expect(res.status).toHaveBeenCalledWith(200);

      Review.findById.mockRejectedValueOnce(new Error('db'));
      await reviewsController.deleteReview(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
