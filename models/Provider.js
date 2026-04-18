const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    tel: {
        type: String,
    },
    averageRating: {
        type: Number,
        min: [0, 'Average rating cannot be lower than 0'],
        max: [5, 'Average rating cannot be higher than 5'],
        default: 0
    },
    reviewCount: {
        type: Number,
        min: [0, 'Review count cannot be negative'],
        default: 0
    }
});

module.exports = mongoose.model('Provider', ProviderSchema);