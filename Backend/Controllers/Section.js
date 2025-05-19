const Section = require("../Models/Section");
const Course = require("../Models/Course");

exports.createSection = async (req, res) => {
    try {
        // data fetch
        const { sectionName, courseId } = req.body;
        // data validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // create section
        const newSection = await Section.create({ sectionName });

        // update course with section objectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            { $push: { courseContent: newSection._id } },
            { new: true }
        );

        // HW: use populate to replace sections and sub-sections both in the updated courseDetails.

        // return response
        return res.status(200).json({
            success: true,
            message: "Section Created Successfully",
            updatedCourseDetails,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to crerate section",
            error: error.message,
        })
    }
}


exports.updateSection = async (req, res) => {
    try {
        // data input
        const { sectionId, sectionName } = req.body;

        // data validation
        if (!sectionId || !sectionName) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // update section
        const section = await Section.findByIdAndUpdate(
            sectionId,
            { sectionName },
            { new: true }
        );

        // return response
        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
            section,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update section",
            error: error.message,
        });
    }
}

exports.deleteSection = async (req, res) => {
    try {
        // data input
        const { sectionId } = req.body;

        // data validation
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: "Section ID is required",
            });
        }

        // delete section
        const deletedSection = await Section.findByIdAndDelete(sectionId);

        // do we need to delete the entry from the course schema ?

        // return response
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            deletedSection,
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to delete section",
            error: error.message,
        });
    }
}