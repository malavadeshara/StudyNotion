const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require('../models/user');


// auth
exports.auth = async (req, res, next) => {
    try {
        // extract token
        const token = req.header('Authorization').replace('Bearer ', '')
                        || req.body.token
                        || req.cookies.token;
        
        // if token missing, then return response
        if(!token) {
            return res.status(401).lson({
                success: false,
                message: 'Token is missing, Please authenticate',
            });
        }

        // verify token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        } catch(error) {
            // verification - issue
            return res.status(401).json({
                success: false,
                message: 'Token is invalid',
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while authenticating',
        });
    }
}


// isStudent
exports.isStudent = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Students only."
            });
        }
        next();
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "User role can not be verified, pease try again",
        });
    }
}


// admin
exports.isAdmin = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admins only."
            });
        }
        next();
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "User role can not be verified, pease try again",
        });
    }
}


// instructor
exports.isInstructor = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for instructors only."
            });
        }
        next();
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "User role can not be verified, pease try again",
        });
    }
}