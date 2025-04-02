const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60,
    }
});


// a function -> to send email
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "verification Email from studynotion", otp);
        console.log("Email sent Successfully : ", mailResponse);
    } catch(error) {
        console.log("error occurd while sending mail : ", error);
        throw error;
    }
}

otpSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP", otpSchema);