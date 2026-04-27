const express = require('express');
const { getReviews, getReview, createReview, updateReview, deleteReview } = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

// Get all reviews for a provider (public)
router.route('/').get(getReviews);

// Get single review (public)
router.route('/:id').get(getReview);

// Create review for a provider (private - user only)
router.route('/').post(protect, authorize('user'), createReview);

// Update review (private - owner or admin)
router.route('/:id').put(protect, authorize('user', 'admin'), updateReview);

// Delete review (private - owner or admin)
router.route('/:id').delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
