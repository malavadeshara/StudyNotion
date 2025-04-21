const Profile = require("../Models/Profile");
const User = require("../Models/User");

exports.updateProfile = async (req, res) => {
    try {
        // get data
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

        // get userId from token
        const id = req.user.id;

        // validation
        if (!contactNumber || !gender || !id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;
        await profileDetails.save();

        // return response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profileDetails,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update profile",
            error: error.message,
        });
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        // get id
        const id = req.user.id;

        // validation
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // delete profile
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        // delete user
        await User.findByIdAndDelete({ _id: id });
        // How to schedule the request for 3 days.

        // return response
        return res.status(200).json({
            success: false,
            message: "User Deleted Successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to delete account",
            error: error.message,
        });
    }
};


exports.getAllUserDetails = async(req, res) => {
    try {
        // get id
        const id = req.user.id;

        // validation
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // find profile
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // return response
        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            data: { ...userDetails._doc, ...profileDetails._doc },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to fetch user details",
            error: error.message,
        });
    }
}