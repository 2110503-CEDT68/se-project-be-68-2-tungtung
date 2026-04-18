const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    rentalDate:{
        type: Date,
        required: [true, 'Please add a rental date']
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    provider:{
        type: mongoose.Schema.ObjectId,
        ref: 'Provider',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
