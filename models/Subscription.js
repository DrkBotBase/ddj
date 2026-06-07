const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    endpoint: { type: String, unique: true, required: true },
    keys: {
        p256dh: String,
        auth: String
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuSubscription', subscriptionSchema);
