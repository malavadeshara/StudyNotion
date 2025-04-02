const User = require('./models/user');
const OTP = require("../Models/OTP");
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');


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
        console.log("Generated otp : ", otp);

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
        console.log(otpBody);

        // return response successful
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp,
        });
    } catch (error) {
        console.log(error);
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
        const recentOtp = await OTP.find({ email }).sort({ created: -1 }.limit(1));
        console.log(recentOtp);

        // validate OTP
        if (recentOtp.length === 0) {
            // OTP not found
            return res.status(400).json({
                success: false,
                message: 'OTP Not Found',
            })
        } else if (otp !== recentOtp) {
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
            contactNumber,
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
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error during registration. Please try again',
        })
    }
}


// Login
exports.login = async (req, res) => {
    
}


// Change Password