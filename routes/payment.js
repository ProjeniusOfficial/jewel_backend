const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto'); // This is a built-in Node.js module for security
const Notification = require('../models/Notification'); // 💡 NEW: Import Notification model
const Payment = require('../models/Payment'); // 💡 NEW: Import Payment model

// Initialize a new instance of Razorpay
// It automatically reads your KEY_ID and KEY_SECRET from the .env file
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @route   POST /api/payment/create-order
 * @desc    Creates a new Razorpay order
 * @access  Public (or could be protected)
 */
router.post("/create-order", async (req, res) => {
    // The amount should be passed from your frontend (e.g., from the selected plan)
    const { amount } = req.body;

    // Razorpay requires the amount in the smallest currency unit (e.g., paise for INR)
    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${crypto.randomBytes(6).toString('hex')}`, // Creates a unique receipt ID
    };

    try {
        const order = await instance.orders.create(options);
        // Send the order details back to the frontend
        res.status(200).json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: "Something went wrong while creating the order." });
    }
});

/**
 * @route   POST /api/payment/verify
 * @desc    Verifies a successful payment
 * @access  Public
 * NOTE: In a robust setup, the saving logic would be here, but we're keeping 
 * it in '/recordSuccess' to match your mobile app's flow.
 */
router.post("/verify", async (req, res) => {
    try {
        // These details are sent back by the Razorpay checkout on the frontend
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // This is Razorpay's recommended verification logic
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        // Compare the signature from Razorpay with the one we generated
        if (razorpay_signature === expectedSign) {
            // Payment verified successfully
            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

/**
 * @route   POST /api/payment/recordSuccess
 * @desc    Records the payment and creates targeted notifications (Admin + User).
 * @access  Protected (Should ideally require a token, but we use data provided by front end)
 * 💡 NEW ROUTE FOR SCALABLE NOTIFICATIONS
 */
router.post('/recordSuccess', async (req, res) => {
    try {
        // Data sent from the mobile frontend after Razorpay success
        const { userId, amount, paymentId, userMobile, schemeName } = req.body; 

        if (!userId || !amount || !paymentId || !userMobile) {
            return res.status(400).json({ message: 'Missing required payment details (userId, amount, paymentId, userMobile).' });
        }
        
        // --- DATABASE ACTION 1: Record the permanent Payment Transaction ---
        const newPayment = new Payment({
            userId: userId,
            amountPaid: amount,
            razorpayPaymentId: paymentId,
            schemeName: schemeName || "General Deposit"
        });
        await newPayment.save();

        // Get current time for consistent display
        const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

        // --- DATABASE ACTION 2: Create Notification for ALL Admins ---
        // This relies on the targetRole: 'Admin' filter.
        const adminNotification = new Notification({
            // Message format tailored for Admin's requested tabular view (Number, Amount, Time)
            message: `${userMobile} paid ₹${amount}.`,
            targetRole: 'Admin',
            amountPaid: amount,
            userMobile: userMobile,
            targetUserId: userId // Still useful for Admin to see who paid
        });
        await adminNotification.save();


        // --- DATABASE ACTION 3: Create Notification for the specific Payer (User) ---
        const userNotification = new Notification({
            message: `Your deposit of ₹${amount} for '${schemeName || "Gold Scheme"}' is successful.`,
            targetRole: 'User',
            targetUserId: userId, // CRUCIAL: Links the notification ONLY to this user
            amountPaid: amount,
            userMobile: userMobile
        });
        await userNotification.save();

        // Send a success response back to the mobile app
        res.status(200).json({ 
            message: 'Payment and all notifications recorded successfully.',
            payment: newPayment 
        });

    } catch (error) {
        console.error('Error recording payment and notifications:', error);
        
        // Handle MongoDB duplicate key error (if razorpayPaymentId already exists)
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Payment ID already recorded.' });
        }
        
        res.status(500).json({ message: 'Server error during payment processing.' });
    }
});

module.exports = router;
