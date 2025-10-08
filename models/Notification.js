// jewel-backend-bi4f/models/Notification.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    targetRole: {
        type: String,
        enum: ['Admin', 'User'], // Restrict to only these two roles
        required: true
    },
    targetUserId: { // This will be null for general Admin notifications
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: false 
    },
    amountPaid: { // Stored separately for Admin's tabular view
        type: Number,
        required: true
    },
    userMobile: { // Stored separately for Admin's tabular view
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);