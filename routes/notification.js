const router = require('express').Router();
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/verifyToken'); 

/**
 * @route   GET /api/notifications/getNotifications
 * @desc    Fetches filtered notifications based on user role.
 * @access  Protected (Requires verifyToken middleware)
 */
router.get('/getNotifications', verifyToken, async (req, res) => {
    // 💡 Logging Start: Confirms the request made it past the initial Express router
    console.log(`[BACKEND LOG] /getNotifications received request.`);
    
    const currentUser = req.user; 
    
    // --- 1. Authentication Check ---
    if (!currentUser || !currentUser._id || !currentUser.role) {
        // If the token was invalid, verifyToken should have already sent 401/403.
        // This case handles if the token was valid but the payload was missing essential data (unlikely).
        console.error(`[BACKEND ERROR] AUTH: Token passed but user data is incomplete or missing. User payload: ${JSON.stringify(currentUser)}`);
        return res.status(401).json({ message: 'Unauthorized: Incomplete token data.' });
    }
    
    // 💡 Logging Authentication Success
    console.log(`[BACKEND LOG] AUTH: Token verified for User ID: ${currentUser._id}, Role: ${currentUser.role}`);

    let query = {};
    const role = currentUser.role;
    const userId = currentUser._id;

    try {
        // --- 2. Filtering Logic ---
        if (role === 'Admin') {
            query = { targetRole: 'Admin' };
            console.log(`[BACKEND LOG] QUERY: Filtering for ALL Admin notifications.`);
        } else {
            // Normal User
            query = { targetUserId: userId, targetRole: 'User' };
            console.log(`[BACKEND LOG] QUERY: Filtering for specific User ID: ${userId}.`);
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 });
            
        // 💡 Logging Query Success
        console.log(`[BACKEND SUCCESS] Retrieved ${notifications.length} notifications. Sending data to mobile.`);

        res.status(200).json(notifications);
        
    } catch (error) {
        // --- 3. Database Failure ---
        console.error(`[BACKEND ERROR] DB_FETCH: Failed to query MongoDB. Error: ${error.message}`);
        res.status(500).json({ message: 'Server error during notification retrieval.' });
    }
});

module.exports = router;