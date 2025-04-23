const Course = require("../Models/Course");
const Category = require("../Models/Category");
const User = require("../Models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// createCourse Handler Function
exports.createCourse = async (req, res) => {
    try {
        // fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, category } = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if (!courseDescription || !courseName || !whatYouWillLearn || !price || !category || !thumbnail) {
            return res.status(400).json({
                success: "false",
                message: "All Fieds are requires"
            });
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details : ", instructorDetails);

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details not found",
            });
        }

        // check given tag is valid or not
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found."
            });
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // Create an entery for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });

        // add the course to the user schema of instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        );

        // update the TAG ka schema
        // TODO: HW

        return res.status(200).json({
            success: true,
            message: "Course created successfully.",
            data: newCourse,
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error while creating the course',
            error: error.message
        });
    }
}

//  get all courses
exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnrolled: true,
        }).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            message: "Data of all courses fetched successfully.",
            data: allCourses
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course data",
            error: error.message,
        })
    }
}

// get course destails
exports.getCourseDetails = async (req, res) => {
    try {
        // get id
        const { courseId } = req.body;

        // find course details
        const courseDetails = await Course.find({ _id: courseId }).populate({ path: "instructor", populate: { path: "additionalDetails" } }).populate("tag").populate("ratingAndReviews").populate({ path: "courseContent", populate: { path: "subSection" } }).exec();

        // validation
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Course details not found.",
            });
        }

        // return response
        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully.",
            data: courseDetails,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot fetch course details",
            error: error.message,
        });
    }
}