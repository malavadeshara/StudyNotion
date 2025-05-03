const User = require("../Models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// reset password token
exports.resetPasswordToken = async (req, res) => {
    try {

        // get email from req body
        const email = req.body.email;

        // check user for this email, email validation
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: "Email address is not registered",
            });
        }

        // generate token
        const token = crypto.randomUUID();

        // update user by adding token and expiration time
        const updateDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000,
            },
            { new: true }
        );

        // create url
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail that contains url
        await mailSender(email, "Password Reset Link", `password reset link : ${url}`);

        // return response 
        return res.json({
            success: true,
            message: "Email sent successfully, please check you email and change password",
        });

    } catch (error) {

        console.log(error);
        return res.json({
            success: false,
            message: "Error occurred while sending email, please try again",
        });

    }
}


// reset password
exports.resetPassword = async(req, res, next) => {
    try {
        // data fetch
        const {password, confirmPassword, token} = req.body;

        // validation
        if(password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password and confirm password does not match",
            });
        }

        // get userdetails from db using token
        const userdetails = await User.findOne({token: token});

        // if no entry - invalid token
        if(!userdetails) {
            return res.json({
                success: false,
                message: "Invalid token",
            });
        }

        // token time check
        if(userdetails.resetPasswordExpires > Date.now()) {
            return res.json({
                success: false,
                message: "Token is expired, please request for new token",
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password
        await User.findOneAndUpdate(
            {token: token},
            {password: hashedPassword},
            {new: true}
        );

        // return response
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });

    } catch(error) {

        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error during updating password, try again",
        });

    }
    
    next();
}