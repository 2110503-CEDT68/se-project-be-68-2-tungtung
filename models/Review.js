const mongoose = require('mongoose');
const Provider = require('./Provider');

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: [true, 'Please add a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be a whole number'
        }
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment'],
        trim: true,
        minlength: [1, 'Comment cannot be empty'],
        maxlength: [1000, 'Comment cannot be more than 1000 characters']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: mongoose.Schema.ObjectId,
        ref: 'Provider',
        required: true
    }
}, {
    timestamps: true
});

// Enforce one review per user per provider at database level.
ReviewSchema.index({ user: 1, provider: 1 }, { unique: true });

// Fast sorting/filtering for provider review lists.
ReviewSchema.index({ provider: 1, createdAt: -1 });

ReviewSchema.statics.recalculateProviderRating = async function(providerId) {
    const stats = await this.aggregate([
        { $match: { provider: providerId } },
        {
            $group: {
                _id: '$provider',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        const averageRating = Number(stats[0].averageRating.toFixed(1));
        await Provider.findByIdAndUpdate(providerId, {
            averageRating,
            reviewCount: stats[0].reviewCount
        });
        return;
    }

    await Provider.findByIdAndUpdate(providerId, {
        averageRating: 0,
        reviewCount: 0
    });
};

ReviewSchema.post('save', async function() {
    await this.constructor.recalculateProviderRating(this.provider);
});

ReviewSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await doc.constructor.recalculateProviderRating(doc.provider);
    }
});

module.exports = mongoose.model('Review', ReviewSchema);
