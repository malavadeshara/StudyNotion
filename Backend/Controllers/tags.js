const Tag = require("../Models/Tags");

// Create Tag ka handler function 
exports.createTag = async (req, res) => {
    try {
        const {name, description} = req.body;

        if(!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        // create entry in DB
        const tagDetails = await Tag.create({
            name: name,
            description: description,
        });
        console.log(tagDetails);

        // return res
        return res.status(200).json({
            success: true,
            message: "Tag created successfully",
        });
        
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "Error creating tag",
            error: error.message
        })
    }
}

// Get all tags ka handler function
exports.getAllTags = async (req, res) => {
    try {
        const allTags = await Tag.find({}, {name: true, description: true});
        return res.status(200).json({
            success: true,
            tags: allTags,
            message: "Tags fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching tags",
            error: error.message
        })
    }
}   