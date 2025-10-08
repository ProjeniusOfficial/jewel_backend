const router = require('express').Router();
const Notification = require('../models/Notification');
// 💡 FIX APPLIED: Destructure the verifyToken function from the imported object.
// This resolves the "argument handler must be a function" TypeError.
const { verifyToken } = require('../middleware/verifyToken'); 

/**
 * @route   GET /api/notifications/getNotifications
 * @desc    Fetches filtered notifications based on user role.
 * @access  Protected (Requires verifyToken middleware)
 */
router.get('/getNotifications', verifyToken, async (req, res) => {
    // The verifyToken middleware ensures req.user is available and populated with { _id, role, ... }
    const currentUser = req.user; 
    
    // Safety check: ensure the middleware is functioning and user data is present
    if (!currentUser || !currentUser._id || !currentUser.role) {
        return res.status(401).json({ message: 'Unauthorized: User data not attached by token middleware.' });
    }

    let query = {};
    const role = currentUser.role;

    try {
        if (role === 'Admin') {
            // --- ADMIN LOGIC ---
            // Admins need to see all payment success notifications
            query = { targetRole: 'Admin' }; 
        } else {
            // --- NORMAL USER LOGIC ---
            // Normal users need to see notifications specifically targeted to their ID
            query = { targetUserId: currentUser._id, targetRole: 'User' }; 
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