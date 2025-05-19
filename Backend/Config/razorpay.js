const Razorpay = require("razorpay");
require("dotenv").config(); // ✅ Load env variables

exports.instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
