// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        mobileNumber: {
            type: String,
            required: true,
            unique: true,
        },
        location: {
            type: String,
            required: true,
        },
        mpin: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['User', 'Admin'], // Role can only be one of these two values
            default: 'User',        // New users are automatically assigned the 'User' role
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);