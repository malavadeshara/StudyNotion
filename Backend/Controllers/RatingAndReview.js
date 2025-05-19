const RatingAndReview = require('../Models/RatingAndReview');
const Course = require("../Models/Course");
const User = require("../Models/User");

// create rating
exports.createRating = async (req, res) => {
    try {
        // get user id
        const userId = req.user.id;

        // fetching data from req.body
        const { rating, review, courseId } = req.body;

        // check if student is enrolled or not ?
        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                studentsEnrolled: { $elemMatch: { $eq: userId } }
            }
        );

        if (!courseDetails) {
            return res.status(403).json({
                success: false,
                message: "User is not enrolled in this course.",
            });
        }

        // check if rating is already given or not by this student?
        const alreadyReviewed = await RatingAndReview.findOne(
            {
                courseId: courseId,
                userId: userId
            }
        );

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "You have already given the rating and review for this course.",
            });
        }

        // create rating and review
        const ratingAndReview = await RatingAndReview.create(
            {
                courseId: courseId,
                userId: userId,
                rating: rating,
                review: review
            }
        );

        // update rating and review in course schema
        await Course.findByIdAndUpdate(
            { _id: courseId },
            {
                $push: {
                    ratingAndReview: ratingAndReview,
                }
            },
            {new : true}
        );

        console.log(updatedCourse);

        // return response
        return res.status(200).json({
            success: true,
            message: "Rating and review added successfully.",
            data: ratingAndReview
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while creating the rating",
            error: error.message
        });
    }
}

// get average rating 
exports.getAverageRating = async (req, res) => {
    try {
        // get course id
        const courseId = req.body.courseId;

        // calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                },
            },
        ]);

        // return rating
        if(result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            });
        }

        // if no rating exists
        return res.status(200).json({
            success: true,
            message: "Average Rating is 0, no ratings given till now",
            averageRating: 0,
        });

    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// get all ratings and reviews
exports.getAllRating = async(req, res) => {
    try {
        const allReviews = await RatingAndReview.find({}).sort({rating: "desc"}).populate({ path: "user", select: "firstName lastName email"}).populate({ path: "course", selected: "courseName",}).exec();

        return res.status(200).json({
            success: true,
            message: "All ratings and reviews fetched successfully.",
            data: allReviews,
        })
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success: true,
            message: error.message,
        });
    }
}