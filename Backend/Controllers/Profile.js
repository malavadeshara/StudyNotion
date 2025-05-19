const Profile = require("../Models/Profile");
const User = require("../Models/User");
const CourseProgress = require("../Models/CourseProgress");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const Course = require("../Models/Course");
const path = require("path");

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        // get data
        const { dateOfBirth = "", about = "", contactNumber = "", gender = ""} = req.body;

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


exports.getAllUserDetails = async (req, res) => {
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

exports.updateDisplayPicture = async (req, res) => {
    try {

        // get data from request body
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;

        console.log(displayPicture.tempFilePath);
        const fixedPath = path.resolve(displayPicture.tempFilePath); // ✅ Converts \ to \\ on Windows
        console.log("fixed path: ", fixedPath);

        const image = await uploadImageToCloudinary(
            fixedPath,
            process.env.FOLDER_NAME,
            1000,
            1000
        );

        console.log("updating image in database");
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        );
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id
        const userDetails = await User.findOne({ _id: userId }).populate({
            path: "courses",
            populate: {
                path: "courseContent",
                populate: {
                    path: "subSection"
                }
            }
        }).exec();

        const userDetailsNew = userDetails.toObject()
        var SubsectionLength = 0
        for (var i = 0; i < userDetailsNew.courses.length; i++) {
            let totalDurationInSeconds = 0
            SubsectionLength = 0
            for (var j = 0; j < userDetailsNew.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetailsNew.courses[i].courseContent[
                    j
                ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                userDetailsNew.courses[i].totalDuration = convertSecondsToDuration(
                    totalDurationInSeconds
                )
                SubsectionLength +=
                    userDetailsNew.courses[i].courseContent[j].subSection.length
            }
            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId,
            })
            courseProgressCount = courseProgressCount?.completedVideos.length
            if (SubsectionLength === 0) {
                userDetailsNew.courses[i].progressPercentage = 100
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2)
                userDetailsNew.courses[i].progressPercentage =
                    Math.round(
                        (courseProgressCount / SubsectionLength) * 100 * multiplier
                    ) / multiplier
            }
        }


        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }
        return res.status(200).json({
            success: true,
            data: userDetailsNew.courses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

exports.instructorDashboard = async (req, res) => {
    try {
        const courseDetails = await Course.find({
            instructor: req.user.id
        })
        const courseData = courseDetails?.map((course, index) => {
            const totalStudentsEnrolled = course?.studentsEnrolled?.length;
            const totalAmountGenerated = totalStudentsEnrolled * course?.price;


            //create a new object with the additional fields
            const courseDataWithStats = {
                _id: course?._id,
                courseName: course?.courseName,
                courseDescription: course?.courseDescription,
                totalStudentsEnrolled,
                totalAmountGenerated,

            }

            return courseDataWithStats;
        })

        return res.status(200).json({
            success: true,
            courses: courseData
        })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server error"
        })
    }
}