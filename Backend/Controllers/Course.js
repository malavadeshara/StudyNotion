const Course = require("../Models/Course");
const Category = require("../Models/Category");
const User = require("../Models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Section = require("../Models/Section");
const SubSection = require("../Models/SubSection");
const CourseProgress = require("../Models/CourseProgress");
const { convertSecondsToDuration } = require("../utils/secToDuration");

// createCourse Handler Function
exports.createCourse = async (req, res) => {
    try {

        // get userId from request object
        const userId = req.user.id;

        // fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, category, tag, status, instructions } = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if (!courseDescription || !courseName || !whatYouWillLearn || !price || !category || !thumbnail) {
            return res.status(400).json({
                success: "false",
                message: "All Fieds are requires"
            });
        }

        if (!status || status === undefined) {
            status = "Draft";
        }

        // check for instructor
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
        });

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

        // Add the new course to the Categories
        await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );

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

exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body;

        // find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled;
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId,
                {
                    $pull: { courses: courseId },
                }
            );
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent;
        for (const sectionId of courseSections) {
            // delete all sub-sections of the section
            const section = await Section.findById(sectionId);
            if (section) {
                const subSection = section.subSection;
                for (const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId);
                }
            }

            // delete the section
            await Section.findByIdAndDelete(sectionId);
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        // return response
        return res.status(200).json({
            success: true,
            message: "Course deleted successfully.",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while deleting the course",
            error: error.message,
        });
    }
}

exports.editCourse = async (req, res) => {
    try {
        const courseId = req.body.courseId;
        console.log("CourseId: ", courseId);
        const updates = req.body;

        console.log("Updates: ", updates);

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // if thumbnailImage is found update it
        if (req.files.thumbnailImage) {
            const thumbnail = req.files.thumbnailImage;
            const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
            course.thumbnail = thumbnailImage.secure_url;
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key]);
                } else {
                    course[key] = updates[key];
                }
            }
        }

        await course.save();

        const updatedCourse = await Course.findOne({
            _id: courseId,
        }).populate({
            path: "instructor",
            populate: {
                path: "additionalDetails",
            },
        }).populate("category").populate("ratingAndReviews").populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        }).exec();

        res.json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error while updating the course",
            error: error.message,
        });
    }
}

// Get Course List
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find(
            { status: "Published" },
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }
        ).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            data: allCourses,
        });

    } catch (error) {
        console.log(error)
        return res.status(404).json({
            success: false,
            message: `Can't Fetch Course Data`,
            error: error.message,
        })
    }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id

        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({
            instructor: instructorId,
        }).sort({ createdAt: -1 })

        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}

exports.getFullCourseDetails = async (req, res) => {
    try {

        const { courseId } = req.query;
        console.log("COURSE ID ON BACKEND:\n", courseId);
        const userId = req.user.id
        console.log("user id", req.user.id)
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                    ? courseProgressCount?.completedVideos
                    : [],
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}