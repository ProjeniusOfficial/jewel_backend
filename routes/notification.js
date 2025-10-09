// JEWEL_BACKEND/routes/notification.js (FINAL FIX FOR FILTERING AND LIMIT)

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
    
    // FIX: We rely on currentUser.id (from JWT payload)
    const userId = currentUser.id; 
    const role = currentUser.role;
    
    // --- 1. Authentication Check ---
    if (!userId || !role) {
        console.error(`[BACKEND ERROR] AUTH: ID/Role is missing. Payload: ${JSON.stringify(currentUser)}`);
        return res.status(401).json({ message: 'Unauthorized: Missing User ID or Role.' });
    }
    
    // Logging Authentication Success
    console.log(`[BACKEND LOG] AUTH: Token verified for User ID: ${userId}, Role: ${role}`);

    let query = {};

    try {
        // --- 2. Filtering Logic (Fixing Issue 2) ---
        if (role === 'Admin') {
            // ADMIN VIEW: See ALL payment notifications (which are marked targetRole: 'Admin')
            query = { targetRole: 'Admin' };
            console.log(`[BACKEND LOG] QUERY: Filtering for ALL Admin notifications.`);
        } else {
            // NORMAL USER VIEW: See only their own specific notifications
            // FIX: We must filter by BOTH the user's ID AND ensure the type is 'User'
            query = { 
                targetUserId: userId, 
                targetRole: 'User' // Ensures Karthi doesn't see Hari's Admin-type alerts
            };
            console.log(`[BACKEND LOG] QUERY: Filtering for specific User ID: ${userId} (User role).`);
        }

        // --- 3. Execute Query (Fixing Issue 1: Limit) ---
        // By using only .find(query) and .sort(), we ensure no hard limit is applied.
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 }); // Sort newest first
            
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