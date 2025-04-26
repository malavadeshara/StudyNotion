const mongoose = require("mongoose");

const CourseProgressSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    completedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subsection",
        }
    ],
});

module.exports = mongoose.model('CourseProgress', CourseProgressSchema);