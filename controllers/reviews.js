const Review = require('../models/Review');
const Provider = require('../models/Provider');

//@desc Get all reviews
//@route GET /api/v1/reviews
//@access Public
exports.getReviews = async (req, res, next) => {
    let query;
    
    // Filter by provider if providerId is passed
    if (req.params.providerId) {
        query = Review.find({ provider: req.params.providerId })
            .populate({ path: 'provider', select: 'name' })
            .populate({ path: 'user', select: 'name' });
    } else {
        query = Review.find()
            .populate({ path: 'provider', select: 'name' })
            .populate({ path: 'user', select: 'name' });
    }

    try {
        const reviews = await query.sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Cannot find reviews' });
    }
};

//@desc Get single review
//@route GET /api/v1/reviews/:id
//@access Public
exports.getReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate({ path: 'provider', select: 'name' })
            .populate({ path: 'user', select: 'name email' });

        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'No review with the id of ' + req.params.id 
            });
        }

        res.status(200).json({ success: true, data: review });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Cannot find review' });
    }
};

//@desc Create review
//@route POST /api/v1/providers/:providerId/reviews
//@access Private
exports.createReview = async (req, res, next) => {
    try {
        // Validate request body
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide rating and comment' 
            });
        }

        if (isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rating must be a number between 1 and 5' 
            });
        }

        if (typeof comment !== 'string' || comment.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Comment must be a non-empty string' 
            });
        }

        if (comment.length > 1000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Comment cannot exceed 1000 characters' 
            });
        }

        // Check if provider exists
        const provider = await Provider.findById(req.params.providerId);
        if (!provider) {
            return res.status(404).json({ 
                success: false, 
                message: 'No provider with the id of ' + req.params.providerId 
            });
        }

        // Check if user already has a review for this provider
        const existingReview = await Review.findOne({
            user: req.user.id,
            provider: req.params.providerId
        });

        if (existingReview) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already reviewed this provider' 
            });
        }

        // Create review
        req.body.provider = req.params.providerId;
        req.body.user = req.user.id;

        const review = await Review.create(req.body);
        
        res.status(201).json({
            success: true,
            data: review
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(500).json({ success: false, message: 'Error creating review' });
    }
};

//@desc Update review
//@route PUT /api/v1/reviews/:id
//@access Private
exports.updateReview = async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'No review with the id of ' + req.params.id 
            });
        }

        // Check authorization - only owner can update
        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to update this review' 
            });
        }

        // Validate update data if provided
        if (req.body.rating !== undefined) {
            if (isNaN(req.body.rating) || req.body.rating < 1 || req.body.rating > 5) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Rating must be a number between 1 and 5' 
                });
            }
        }

        if (req.body.comment !== undefined) {
            if (typeof req.body.comment !== 'string' || req.body.comment.trim().length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Comment must be a non-empty string' 
                });
            }

            if (req.body.comment.length > 1000) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Comment cannot exceed 1000 characters' 
                });
            }
        }

        // Update the review
        if (req.body.rating !== undefined) review.rating = req.body.rating;
        if (req.body.comment !== undefined) review.comment = req.body.comment;
        review.updatedAt = Date.now();

        const updatedReview = await review.save();

        res.status(200).json({
            success: true,
            data: updatedReview
        });
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }
        res.status(500).json({ success: false, message: 'Error updating review' });
    }
};

//@desc Delete review
//@route DELETE /api/v1/reviews/:id
//@access Private
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ 
                success: false, 
                message: 'No review with the id of ' + req.params.id 
            });
        }

        // Check authorization - only owner can delete
        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to delete this review' 
            });
        }

        await Review.findByIdAndRemove(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error deleting review' });
    }
};
