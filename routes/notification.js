// JEWEL_BACKEND/routes/notification.js (FINAL FIX)

const router = require('express').Router();
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/verifyToken'); 

/**
 * @route   GET /api/notifications/getNotifications
 * @desc    Fetches filtered notifications based on user role.
 * @access  Protected (Requires verifyToken middleware)
 */
router.get('/getNotifications', verifyToken, async (req, res) => {
    
    const currentUser = req.user; 
    const userId = currentUser.id; // 💡 FIX: Use .id instead of ._id
    const role = currentUser.role;

    // --- 1. Authentication Check & Logging ---
    if (!userId || !role) {
        console.error(`[BACKEND ERROR] AUTH: User data is incomplete. ID: ${userId}, Role: ${role}`);
        return res.status(401).json({ message: 'Unauthorized: Missing User ID or Role.' });
    }
    
    console.log(`[BACKEND LOG] AUTH: Token verified for User ID: ${userId}, Role: ${role}`);

    let query = {};

    try {
        // --- 2. Filtering Logic ---
        if (role === 'Admin') {
            query = { targetRole: 'Admin' };
            console.log(`[BACKEND LOG] QUERY: Filtering for ALL Admin notifications.`);
        } else {
            // Normal User
            query = { targetUserId: userId, targetRole: 'User' }; // 💡 FIX: targetUserId now uses the correct userId
            console.log(`[BACKEND LOG] QUERY: Filtering for specific User ID: ${userId}.`);
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 });
            
        // Logging Query Success
        console.log(`[BACKEND SUCCESS] Retrieved ${notifications.length} notifications. Sending data to mobile.`);

        res.status(200).json(notifications);
        
    } catch (error) {
        // Database Failure
        console.error(`[BACKEND ERROR] DB_FETCH: Failed to query MongoDB. Error: ${error.message}`);
        res.status(500).json({ message: 'Server error during notification retrieval.' });
    }
});

module.exports = router;