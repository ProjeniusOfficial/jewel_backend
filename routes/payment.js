const router = require('express').Router();
const Razorpay = require('razorpay');
const crypto = require('crypto'); // This is a built-in Node.js module for security

// Initialize a new instance of Razorpay
// It automatically reads your KEY_ID and KEY_SECRET from the .env file
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @route   POST /api/payment/create-order
 * @desc    Creates a new Razorpay order
 * @access  Public (or could be protected)
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
 * @route   POST /api/payment/verify
 * @desc    Verifies a successful payment
 * @access  Public
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
            // If signatures match, the payment is successful and verified
            // IMPORTANT: This is where you would save the transaction to your database
            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

module.exports = router;
