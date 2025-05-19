// Import the required modules
const express = require("express")
const router = express.Router()

const { capturePayment, verifySignature ,sendPaymentSuccessEmail} = require("../Controllers/Payments")
const { auth, isInstructor, isStudent, isAdmin } = require("../Middlewares/auth")
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifySignature", auth,isStudent,verifySignature);
// router.post("/sendPaymentSuccessEmail",auth,isStudent,sendPaymentSuccessEmail);
module.exports = router