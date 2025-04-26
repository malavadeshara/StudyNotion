const User = require('../Models/User');
const OTP = require("../Models/OTP");
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const Profile = require("../Models/Profile");
const mailSender = require("../utils/mailSender");
const jwt = require("jsonwebtoken");
require("dotenv").config();


// Send OTP
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from request body
        const { email } = req.body;

        // check if user already exist ?
        const checkUserPresent = await User.findOne({ email });

        // if user already exist , then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User already registered',
            });
        }

        // generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        // console.log("Generated otp : ", otp);

        // check unique otp or not?
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await otp.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        // create an entry in DB for otp
        const otpBody = await OTP.create(otpPayload);
        // console.log(otpBody);

        // // send otp to user email
        // try {
        //     const emailResponse = await mailSender(
        //         email,
        //         `OTP Verification for Signup`,
        //         otpTemplate(otp)
        //     );
        //     console.log("Email sent successfully:", emailResponse.response);
        // } catch (error) {
        //     console.error("Error occurred while sending otp verification email:", error);
        //     return res.status(500).json({
        //         success: false,
        //         message: "Error occurred while sending email",
        //         error: error.message,
        //     });
        // }

        // return response successful
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp,
        });

    } catch (error) {
        // console.log("Error in sending OTP : ", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


// Signup
exports.signUp = async (req, res) => {
    try {
        // data fetch from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // validate
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: 'Please fill all the fields, All fields are required!',
            });
        }

        // 2 password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and Confirm Password do not match',
            });
        }

        // check user already exist or not ?
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User is already registered',
            });
        }

        // find most recent OTP stored for the user
        const recentOtp = await OTP.find({ email }).sort({ created: -1 }).limit(1);

        // validate OTP
        if (recentOtp.length === 0) {
            // OTP not found
            return res.status(400).json({
                success: false,
                message: 'OTP Not Found',
            })
        } else if (otp !== recentOtp[0].otp) {
            // Invelid otp
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Entry in DB
        const ProfileDetails = await Profile.create({
            gender: null,
            dateOdBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: ProfileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // return res
        return res.status(200).json({
            success: true,
            message: 'User is registered successfully',
            user,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error during registration. Please try again',
            error: error.message,
        })
    }
}


// Login
exports.login = async (req, res) => {
    try {
        // get data from request body
        const { email, password } = req.body;

        // validation data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: 'Please enter both email and password',
            });
        }

        // user check exist or not
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signUp first!",
            });
        }

        // generate JWT, after password matching
        if (await bcrypt.compare(password, user.password)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "User Logged in successfully",
            });

        } else {

            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });

        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "login faliure, please try again",
        });
    }
}


// Change Password
exports.changePassword = async (req, res) => {
    // get data fron req body
    // get old pssword, new password, confirm new password
    const { email, oldPassword, newPassword, confirmNewPassword } = req.body;

    // validation
    if (!email || !oldPassword || !newPassword || !confirmNewPassword) {
        return res.status(403).json({
            success: false,
            message: 'Please fill all the fields, All fields are required!',
        });
    }

    // check if new password and confirm new password are same or not
    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
            success: false,
            message: 'New Password and Confirm New Password do not match',
        });
    }

    // check if user exist or not
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'User not found',
        });
    }

    // check if old password is correct or not
    const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatched) {
        return res.status(401).json({
            success: false,
            message: 'Old Password is incorrect',
        });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("Hashed Password : ", hashedPassword);
    user.password = hashedPassword;
    await user.save(); // save the user in DB
    console.log("User after password update : ", user);

    // update password in DB

    // send mail - password updated
    try {
        const emailResponse = await mailSender(
            user.email,
            passwordUpdated(
                user.email,
                `Password updated successfully for ${user.firstName} ${user.lastName}`
            )
        );
        console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
        console.error("Error occurred while sending email:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while sending email",
            error: error.message,
        });
    }

    // return response
    return res.status(200).json({
        success: true,
        message: 'Password updated successfully',
    });
}