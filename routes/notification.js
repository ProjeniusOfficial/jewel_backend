// JEWEL_BACKEND/routes/notification.js (FINAL CORRECTED VERSION)

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
    
    // 💡 FIX: Use currentUser.id, which comes from the JWT payload
    const userId = currentUser.id; 
    const role = currentUser.role;
    
    // --- 1. Authentication Check ---
    if (!userId || !role) {
        // This log should now only trigger if the token is completely missing or malformed
        console.error(`[BACKEND ERROR] AUTH: Token passed but ID/Role is missing. User payload: ${JSON.stringify(currentUser)}`);
        return res.status(401).json({ message: 'Unauthorized: Missing User ID or Role.' });
    }
    
    // 💡 Logging Authentication Success
    console.log(`[BACKEND LOG] AUTH: Token verified for User ID: ${userId}, Role: ${role}`);

    let query = {};

    try {
        // --- 2. Filtering Logic ---
        if (role === 'Admin') {
            query = { targetRole: 'Admin' };
            console.log(`[BACKEND LOG] QUERY: Filtering for ALL Admin notifications.`);
        } else {
            // Normal User
            // 💡 FIX: targetUserId now uses the corrected userId variable (which is currentUser.id)
            query = { targetUserId: userId, targetRole: 'User' };
            console.log(`[BACKEND LOG] QUERY: Filtering for specific User ID: ${userId}.`);
        }

        // The query runs here
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