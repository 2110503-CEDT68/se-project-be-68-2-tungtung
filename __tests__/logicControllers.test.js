process.env.JWT_SECRET = process.env.JWT_SECRET || 'unit-test-secret';
process.env.JWT_COOKIE_EXPIRE = process.env.JWT_COOKIE_EXPIRE || '1';

jest.mock('../models/Booking', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../models/Provider', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  countDocuments: jest.fn(),
  deleteOne: jest.fn(),
}));

jest.mock('../models/User', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const bookingsController = require('../controllers/bookings');
const providersController = require('../controllers/providers');
const authController = require('../controllers/auth');
const { protect, authorize } = require('../middleware/auth');

const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  cookie: jest.fn().mockReturnThis(),
});

const makeQuery = (result, shouldReject = false) => {
  const base = shouldReject ? Promise.reject(result) : Promise.resolve(result);
  base.populate = jest.fn(() => base);
  base.select = jest.fn(() => base);
  base.sort = jest.fn(() => base);
  base.skip = jest.fn(() => base);
  base.limit = jest.fn(() => base);
  return base;
};

describe('Backend Logic Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  describe('bookings controller', () => {
    test('getBookings: non-admin only gets own bookings', async () => {
      const req = { user: { id: 'u1', role: 'user' }, params: {} };
      const res = createRes();
      const data = [{ _id: 'b1' }];
      const query = makeQuery(data);
      Booking.find.mockReturnValue(query);

      await bookingsController.getBookings(req, res);

      expect(Booking.find).toHaveBeenCalledWith({ user: 'u1' });
      expect(query.populate).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 1, data });
    });

    test('getBookings: admin can filter by providerId', async () => {
      const req = { user: { id: 'admin', role: 'admin' }, params: { providerId: 'p1' } };
      const res = createRes();
      const data = [{ _id: 'b1' }];
      const query = makeQuery(data);
      Booking.find.mockReturnValue(query);

      await bookingsController.getBookings(req, res);

      expect(Booking.find).toHaveBeenCalledWith({ provider: 'p1' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('getBookings: admin without providerId gets all bookings', async () => {
      const req = { user: { id: 'admin', role: 'admin' }, params: {} };
      const res = createRes();
      const data = [{ _id: 'b1' }, { _id: 'b2' }];
      const query = makeQuery(data);
      Booking.find.mockReturnValue(query);

      await bookingsController.getBookings(req, res);

      expect(Booking.find).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data });
    });

    test('getBookings: query failure returns 500', async () => {
      const req = { user: { id: 'u1', role: 'user' }, params: {} };
      const res = createRes();
      Booking.find.mockReturnValue(makeQuery(new Error('db'), true));

      await bookingsController.getBookings(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cannot find Booking' });
    });

    test('getBooking: success', async () => {
      const req = { params: { id: 'b1' } };
      const res = createRes();
      const booking = { _id: 'b1' };
      Booking.findById.mockReturnValue(makeQuery(booking));

      await bookingsController.getBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: booking });
    });

    test('getBooking: not found returns 404', async () => {
      const req = { params: { id: 'missing' } };
      const res = createRes();
      Booking.findById.mockReturnValue(makeQuery(null));

      await bookingsController.getBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('getBooking: error returns 500', async () => {
      const req = { params: { id: 'b1' } };
      const res = createRes();
      Booking.findById.mockReturnValue(makeQuery(new Error('db'), true));

      await bookingsController.getBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cannot find Booking' });
    });

    test('addBooking: provider not found', async () => {
      const req = { params: { providerId: 'p1' }, user: { id: 'u1', name: 'Alice' }, body: {} };
      const res = createRes();
      Provider.findById.mockResolvedValue(null);

      await bookingsController.addBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('addBooking: user already has 3 bookings', async () => {
      const req = { params: { providerId: 'p1' }, user: { id: 'u1', name: 'Alice' }, body: {} };
      const res = createRes();
      Provider.findById.mockResolvedValue({ _id: 'p1' });
      Booking.find.mockResolvedValue([{}, {}, {}]);

      await bookingsController.addBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'The user Alice has already booked 3 cars',
      });
    });

    test('addBooking: success creates booking', async () => {
      const req = {
        params: { providerId: 'p1' },
        user: { id: 'u1', name: 'Alice' },
        body: { rentalDate: '2026-04-20' },
      };
      const res = createRes();
      Provider.findById.mockResolvedValue({ _id: 'p1' });
      Booking.find.mockResolvedValue([{}]);
      Booking.create.mockResolvedValue({ _id: 'b1' });

      await bookingsController.addBooking(req, res);

      expect(Booking.create).toHaveBeenCalledWith({
        rentalDate: '2026-04-20',
        provider: 'p1',
        user: 'u1',
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('addBooking: create failure returns 500', async () => {
      const req = { params: { providerId: 'p1' }, user: { id: 'u1', name: 'Alice' }, body: {} };
      const res = createRes();
      Provider.findById.mockResolvedValue({ _id: 'p1' });
      Booking.find.mockResolvedValue([]);
      Booking.create.mockRejectedValue(new Error('write fail'));

      await bookingsController.addBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cannot create Booking' });
    });

    test('updateBooking: missing booking returns 404', async () => {
      const req = { params: { id: 'b1' }, user: { id: 'u1', role: 'user' }, body: {} };
      const res = createRes();
      Booking.findById.mockResolvedValue(null);

      await bookingsController.updateBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('updateBooking: unauthorized user returns 401', async () => {
      const req = { params: { id: 'b1' }, user: { id: 'u2', role: 'user' }, body: {} };
      const res = createRes();
      Booking.findById.mockResolvedValue({ user: { toString: () => 'u1' } });

      await bookingsController.updateBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('updateBooking: admin can update', async () => {
      const req = { params: { id: 'b1' }, user: { id: 'admin', role: 'admin' }, body: { x: 1 } };
      const res = createRes();
      Booking.findById.mockResolvedValue({ user: { toString: () => 'u1' } });
      Booking.findByIdAndUpdate.mockResolvedValue({ _id: 'b1', x: 1 });

      await bookingsController.updateBooking(req, res);

      expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith('b1', { x: 1 }, {
        new: true,
        runValidators: true,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('updateBooking: query failure returns 500', async () => {
      const req = { params: { id: 'b1' }, user: { id: 'u1', role: 'user' }, body: {} };
      const res = createRes();
      Booking.findById.mockRejectedValue(new Error('db fail'));

      await bookingsController.updateBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cannot update Booking' });
    });

    test('deleteBooking: missing booking returns 404', async () => {
      const req = { params: { id: 'b1' }, user: { id: 'u1', role: 'user' } };
      const res = createRes();
      Booking.findById.mockResolvedValue(null);

      await bookingsController.deleteBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('deleteBooking: unauthorized user returns 401', async () => {
      const req = { params: { id: 'b1' }, user: { id: 'u2', role: 'user' } };
      const res = createRes();
      Booking.findById.mockResolvedValue({ user: { toString: () => 'u1' } });

      await bookingsController.deleteBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('deleteBooking: owner can delete', async () => {
      const req = { params: { id: 'b1' }, user: { id: 'u1', role: 'user' } };
      const res = createRes();
      const deleteOne = jest.fn().mockResolvedValue({});
      Booking.findById.mockResolvedValue({ user: { toString: () => 'u1' }, deleteOne });

      await bookingsController.deleteBooking(req, res);

      expect(deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
    });

    test('deleteBooking: failure returns 500', async () => {
      const req = { params: { id: 'b1' }, user: { id: 'u1', role: 'user' } };
      const res = createRes();
      Booking.findById.mockRejectedValue(new Error('db fail'));

      await bookingsController.deleteBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Cannot delete Booking' });
    });
  });

  describe('providers controller', () => {
    test('getProviders: supports filters/select/sort/pagination', async () => {
      const req = {
        query: {
          select: 'name,address',
          sort: 'name,-createdAt',
          page: '2',
          limit: '1',
          price: { gte: '5' },
          tel: '0123',
        },
      };
      const res = createRes();
      const providers = [{ _id: 'p2' }];
      const query = makeQuery(providers);
      Provider.find.mockReturnValue(query);
      Provider.countDocuments.mockResolvedValue(3);

      await providersController.getProviders(req, res);

      expect(query.select).toHaveBeenCalledWith('name address');
      expect(query.sort).toHaveBeenCalledWith('name -createdAt');
      expect(query.skip).toHaveBeenCalledWith(1);
      expect(query.limit).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: { next: { page: 3, limit: 1 }, prev: { page: 1, limit: 1 } },
        data: providers,
      });
    });

    test('getProviders: default sort branch and no next/prev', async () => {
      const req = { query: {} };
      const res = createRes();
      const providers = [{ _id: 'p1' }];
      const query = makeQuery(providers);
      Provider.find.mockReturnValue(query);
      Provider.countDocuments.mockResolvedValue(1);

      await providersController.getProviders(req, res);

      expect(query.sort).toHaveBeenCalledWith('-createdAt');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: {},
        data: providers,
      });
    });

    test('getProviders: returns 400 on error', async () => {
      const req = { query: {} };
      const res = createRes();
      const query = makeQuery([], true);
      Provider.find.mockReturnValue(query);
      Provider.countDocuments.mockResolvedValue(1);

      await providersController.getProviders(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false });
    });

    test('getProvider: success', async () => {
      const req = { params: { id: 'p1' } };
      const res = createRes();
      Provider.findById.mockResolvedValue({ _id: 'p1' });

      await providersController.getProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'p1' } });
    });

    test('getProvider: not found and catch branch', async () => {
      const req = { params: { id: 'p1' } };
      const res = createRes();
      Provider.findById.mockResolvedValue(null);

      await providersController.getProvider(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      Provider.findById.mockRejectedValue(new Error('db'));
      await providersController.getProvider(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('createProvider: success', async () => {
      const req = { body: { name: 'P' } };
      const res = createRes();
      Provider.create.mockResolvedValue({ _id: 'p1' });

      await providersController.createProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'p1' } });
    });

    test('updateProvider: success, not found, and catch', async () => {
      const req = { params: { id: 'p1' }, body: { name: 'New' } };
      const res = createRes();

      Provider.findByIdAndUpdate.mockResolvedValueOnce({ _id: 'p1', name: 'New' });
      await providersController.updateProvider(req, res);
      expect(res.status).toHaveBeenCalledWith(200);

      Provider.findByIdAndUpdate.mockResolvedValueOnce(null);
      await providersController.updateProvider(req, res);
      expect(res.status).toHaveBeenCalledWith(400);

      Provider.findByIdAndUpdate.mockRejectedValueOnce(new Error('db'));
      await providersController.updateProvider(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('deleteProvider: not found, success, and catch', async () => {
      const req = { params: { id: 'p1' } };
      const res = createRes();

      Provider.findById.mockResolvedValueOnce(null);
      await providersController.deleteProvider(req, res);
      expect(res.status).toHaveBeenCalledWith(404);

      Provider.findById.mockResolvedValueOnce({ _id: 'p1' });
      Booking.deleteMany = jest.fn().mockResolvedValue({});
      Provider.deleteOne.mockResolvedValue({});
      await providersController.deleteProvider(req, res);
      expect(Booking.deleteMany).toHaveBeenCalledWith({ provider: 'p1' });
      expect(Provider.deleteOne).toHaveBeenCalledWith({ _id: 'p1' });
      expect(res.status).toHaveBeenCalledWith(200);

      Provider.findById.mockRejectedValueOnce(new Error('db'));
      await providersController.deleteProvider(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('auth controller', () => {
    test('register success sets token response', async () => {
      const req = {
        body: {
          name: 'A',
          email: 'a@test.com',
          telephone: '012',
          password: 'pw',
          role: 'user',
        },
      };
      const res = createRes();
      const user = { getSignedJwtToken: jest.fn(() => 'jwt-1') };
      User.create.mockResolvedValue(user);

      await authController.register(req, res);

      expect(User.create).toHaveBeenCalled();
      expect(user.getSignedJwtToken).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, token: 'jwt-1' });
    });

    test('register failure returns 400', async () => {
      const req = { body: { email: 'x' } };
      const res = createRes();
      User.create.mockRejectedValue(new Error('duplicate key'));

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'duplicate key' });
    });

    test('login requires email and password', async () => {
      const req = { body: { email: '', password: '' } };
      const res = createRes();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('login invalid when user missing', async () => {
      const req = { body: { email: 'a@test.com', password: 'pw' } };
      const res = createRes();
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, msg: 'Invalid credentials' });
    });

    test('login invalid password returns 401', async () => {
      const req = { body: { email: 'a@test.com', password: 'bad' } };
      const res = createRes();
      const user = {
        matchPassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, msg: 'Invalid credentials' });
    });

    test('login success in production sets secure cookie option', async () => {
      process.env.NODE_ENV = 'production';
      const req = { body: { email: 'a@test.com', password: 'pw' } };
      const res = createRes();
      const user = {
        matchPassword: jest.fn().mockResolvedValue(true),
        getSignedJwtToken: jest.fn(() => 'jwt-2'),
      };
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'jwt-2',
        expect.objectContaining({ httpOnly: true, secure: true })
      );
      expect(res.json).toHaveBeenCalledWith({ success: true, token: 'jwt-2' });
    });

    test('getMe returns current user', async () => {
      const req = { user: { id: 'u1' } };
      const res = createRes();
      User.findById.mockResolvedValue({ _id: 'u1' });

      await authController.getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { _id: 'u1' } });
    });

    test('logout clears cookie', async () => {
      const req = {};
      const res = createRes();

      await authController.logout(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'none',
        expect.objectContaining({ httpOnly: true })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
    });
  });

  describe('auth middleware', () => {
    test('protect denies request without token', async () => {
      const req = { headers: {} };
      const res = createRes();
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('protect accepts valid token and loads user', async () => {
      const req = { headers: { authorization: 'Bearer token-1' } };
      const res = createRes();
      const next = jest.fn();
      jwt.verify.mockReturnValue({ id: 'u1' });
      User.findById.mockResolvedValue({ _id: 'u1', role: 'user' });

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('token-1', process.env.JWT_SECRET);
      expect(req.user).toEqual({ _id: 'u1', role: 'user' });
      expect(next).toHaveBeenCalled();
    });

    test('protect returns 401 on verify failure', async () => {
      const req = { headers: { authorization: 'Bearer bad' } };
      const res = createRes();
      const next = jest.fn();
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('authorize blocks disallowed roles', () => {
      const req = { user: { role: 'user' } };
      const res = createRes();
      const next = jest.fn();

      authorize('admin')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('authorize allows allowed roles', () => {
      const req = { user: { role: 'admin' } };
      const res = createRes();
      const next = jest.fn();

      authorize('admin', 'user')(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
