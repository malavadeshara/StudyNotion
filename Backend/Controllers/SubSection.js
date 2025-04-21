const SubSection = require("../Models/SubSection");
const Section = require("../Models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create SubSection
exports.createSubSection = async (req, res) => {
    try {
        // fetch data from req body
        const { sectionId, title, timeDuration, description } = req.body;

        // extract file/ video
        const video = req.files.videoFile;

        // validation
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // create a sub-section
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        });

        // update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            { $push: { subSection: SubSectionDetails._id } },
            { new: true }
        ).populate("subSection");
        // HW: log updated section here, after adding populate query to replace sub-section objectId with sub-section details.

        // return response
        return res.status(200).json({
            success: true,
            message: "Sub-section created successfully",
            updatedSection,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Unable to create sub-section",
            error: error.message,
        });

    }
}

// HW : updateSubSection

// 