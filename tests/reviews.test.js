const request = require('supertest');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');
const Provider = require('../models/Provider');

// Mock server for testing
const express = require('express');
const app = express();
app.use(express.json());

// Mock middleware and routes
const { protect, authorize } = require('../middleware/auth');
const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews');

// Setup test routes
app.get('/api/v1/reviews', getReviews);
app.get('/api/v1/reviews/:id', getReview);
app.post('/api/v1/providers/:providerId/reviews', protect, authorize('user'), createReview);
app.put('/api/v1/reviews/:id', protect, authorize('user'), updateReview);
app.delete('/api/v1/reviews/:id', protect, authorize('user'), deleteReview);

describe('Review API Tests', () => {
    let userId, providerId, reviewId, token;

    beforeAll(async () => {
        // Connect to test database
        if (!mongoose.connection.readyState) {
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/reviews-test');
        }

        // Create test user
        const user = await User.create({
            name: 'Test User',
            email: 'test@test.com',
            telephone: '123-456-7890',
            password: 'password123'
        });
        userId = user._id;
        token = user.getSignedJwtToken();

        // Create test provider
        const provider = await Provider.create({
            name: 'Test Provider',
            address: '123 Test St',
            tel: '098-765-4321'
        });
        providerId = provider._id;
    });

    afterAll(async () => {
        await Review.deleteMany({});
        await User.deleteMany({});
        await Provider.deleteMany({});
        if (mongoose.connection.readyState) {
            await mongoose.connection.close();
        }
    });

    // ============ CREATE REVIEW TESTS ============
    describe('POST /api/v1/providers/:providerId/reviews - Create Review', () => {
        test('Should create a review with valid data', async () => {
            const res = await request(app)
                .post(`/api/v1/providers/${providerId}/reviews`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 5,
                    comment: 'Great service!'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data.rating).toBe(5);
            expect(res.body.data.comment).toBe('Great service!');

            reviewId = res.body.data._id;
        });

        test('Should fail with missing rating', async () => {
            const res = await request(app)
                .post(`/api/v1/providers/${providerId}/reviews`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    comment: 'Great service!'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('rating');
        });

        test('Should fail with missing comment', async () => {
            const res = await request(app)
                .post(`/api/v1/providers/${providerId}/reviews`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 5
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('comment');
        });

        test('Should fail with rating less than 1', async () => {
            const res = await request(app)
                .post(`/api/v1/providers/${providerId}/reviews`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 0,
                    comment: 'Bad service'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('between 1 and 5');
        });

        test('Should fail with rating greater than 5', async () => {
            const res = await request(app)
                .post(`/api/v1/providers/${providerId}/reviews`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 6,
                    comment: 'Excellent!'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('between 1 and 5');
        });

        test('Should fail with comment exceeding max length (1000 chars)', async () => {
            const longComment = 'a'.repeat(1001);
            const res = await request(app)
                .post(`/api/v1/providers/${providerId}/reviews`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 4,
                    comment: longComment
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('1000');
        });

        test('Should fail with empty comment', async () => {
            const res = await request(app)
                .post(`/api/v1/providers/${providerId}/reviews`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 3,
                    comment: '   '
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('non-empty');
        });

        test('Should fail with invalid provider ID', async () => {
            const res = await request(app)
                .post(`/api/v1/providers/invalidId/reviews`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 5,
                    comment: 'Great!'
                });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        test('Should fail if user already has a review for this provider', async () => {
            // First review is already created in earlier test
            const res = await request(app)
                .post(`/api/v1/providers/${providerId}/reviews`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 4,
                    comment: 'Another review'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('already reviewed');
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .post(`/api/v1/providers/${providerId}/reviews`)
                .send({
                    rating: 5,
                    comment: 'Great!'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    // ============ GET REVIEWS TESTS ============
    describe('GET /api/v1/reviews - Get All Reviews', () => {
        test('Should retrieve all reviews', async () => {
            const res = await request(app)
                .get('/api/v1/reviews');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBeGreaterThan(0);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    // ============ GET SINGLE REVIEW TESTS ============
    describe('GET /api/v1/reviews/:id - Get Single Review', () => {
        test('Should retrieve a single review by ID', async () => {
            const res = await request(app)
                .get(`/api/v1/reviews/${reviewId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(reviewId.toString());
        });

        test('Should fail with invalid review ID', async () => {
            const res = await request(app)
                .get('/api/v1/reviews/invalidId');

            expect(res.status).toBe(500);
        });

        test('Should fail with non-existent review ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/v1/reviews/${fakeId}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    // ============ UPDATE REVIEW TESTS ============
    describe('PUT /api/v1/reviews/:id - Update Review', () => {
        test('Should update review with valid data', async () => {
            const res = await request(app)
                .put(`/api/v1/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 4,
                    comment: 'Updated comment'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.rating).toBe(4);
            expect(res.body.data.comment).toBe('Updated comment');
        });

        test('Should update only rating', async () => {
            const res = await request(app)
                .put(`/api/v1/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 3
                });

            expect(res.status).toBe(200);
            expect(res.body.data.rating).toBe(3);
        });

        test('Should update only comment', async () => {
            const res = await request(app)
                .put(`/api/v1/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    comment: 'New comment'
                });

            expect(res.status).toBe(200);
            expect(res.body.data.comment).toBe('New comment');
        });

        test('Should fail with invalid rating', async () => {
            const res = await request(app)
                .put(`/api/v1/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 10
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('Should fail with empty comment', async () => {
            const res = await request(app)
                .put(`/api/v1/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    comment: ''
                });

            expect(res.status).toBe(400);
        });

        test('Should fail without authorization token', async () => {
            const res = await request(app)
                .put(`/api/v1/reviews/${reviewId}`)
                .send({
                    rating: 5
                });

            expect(res.status).toBe(401);
        });

        test('Should fail if not review owner', async () => {
            // Create another user
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@test.com',
                telephone: '321-654-9870',
                password: 'password123'
            });
            const otherToken = otherUser.getSignedJwtToken();

            const res = await request(app)
                .put(`/api/v1/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                    rating: 5
                });

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Not authorized');

            await User.deleteOne({ _id: otherUser._id });
        });

        test('Should fail with non-existent review ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/v1/reviews/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    rating: 5
                });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    // ============ DELETE REVIEW TESTS ============
    describe('DELETE /api/v1/reviews/:id - Delete Review', () => {
        let reviewToDelete;

        beforeEach(async () => {
            // Create a review to delete
            const newProvider = await Provider.create({
                name: 'Provider for Delete Test',
                address: '456 Test Ave',
                tel: '098-123-4567'
            });

            const newReview = await Review.create({
                user: userId,
                provider: newProvider._id,
                rating: 5,
                comment: 'To be deleted'
            });
            reviewToDelete = newReview._id;
        });

        test('Should delete review if owner', async () => {
            const res = await request(app)
                .delete(`/api/v1/reviews/${reviewToDelete}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify deletion
            const deleted = await Review.findById(reviewToDelete);
            expect(deleted).toBeNull();
        });

        test('Should fail if not review owner', async () => {
            const otherUser = await User.create({
                name: 'Delete Test User',
                email: 'delete@test.com',
                telephone: '555-666-7777',
                password: 'password123'
            });
            const otherToken = otherUser.getSignedJwtToken();

            const res = await request(app)
                .delete(`/api/v1/reviews/${reviewToDelete}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);

            await User.deleteOne({ _id: otherUser._id });
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .delete(`/api/v1/reviews/${reviewToDelete}`);

            expect(res.status).toBe(401);
        });

        test('Should fail with non-existent review ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/v1/reviews/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
});
