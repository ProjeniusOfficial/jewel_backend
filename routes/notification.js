const router = require('express').Router();
const Notification = require('../models/Notification');
const verifyToken = require('../middleware/verifyToken'); // Assuming your middleware is here

/**
 * @route   GET /api/notifications/getNotifications
 * @desc    Fetches filtered notifications based on user role.
 * @access  Protected (Requires verifyToken middleware)
 */
router.get('/getNotifications', verifyToken, async (req, res) => {
    // 💡 The verifyToken middleware ensures req.user is available and populated with { _id, role, ... }
    const currentUser = req.user; 
    
    if (!currentUser) {
        // This should theoretically not happen if verifyToken succeeds
        return res.status(401).json({ message: 'Unauthorized: User data not found.' });
    }

    let query = {};
    const role = currentUser.role;

    try {
        if (role === 'Admin') {
            // --- ADMIN LOGIC ---
            // Admins need to see all payment success notifications
            query = { targetRole: 'Admin' }; 
            console.log(`Admin ${currentUser._id} fetching all Admin notifications.`);
        } else {
            // --- NORMAL USER LOGIC ---
            // Normal users need to see notifications specifically targeted to their ID
            query = { targetUserId: currentUser._id, targetRole: 'User' }; 
            console.log(`User ${currentUser._id} fetching user-specific notifications.`);
        }

        // Fetch notifications based on the filtered query, newest first
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 });

        res.status(200).json(notifications);
        
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error during notification retrieval.' });
    }
});

module.exports = router;
