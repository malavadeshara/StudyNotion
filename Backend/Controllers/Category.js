const Category = require("../Models/Category");

// Create Tag ka handler function 
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        // create entry in DB
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });
        console.log(categoryDetails);

        // return res
        return res.status(200).json({
            success: true,
            message: "Category created successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating category",
            error: error.message
        })
    }
}

// Get all tags ka handler function
exports.getAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, { name: true, description: true });
        return res.status(200).json({
            success: true,
            categories: allCategories,
            message: "Categories fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching categories",
            error: error.message
        })
    }
}

exports.categoryPageDetails = async (req, res) => {
    try {
        // get category id
        const { categoryId } = req.body;

        // get courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();

        // validation
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // get courses for different categories
        const differenrCategories = await Category.find({ _id: { $ne: categoryId } }).populate("courses").exec();

        // get top seslling ciurses - TODO ?? hOMEWORK

        // return response
        return res.status(200).json({
            success: true,
            message: "Category page details fetched successfully",
            data: {
                selectedCategory,
                differenrCategories,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching category page details",
            error: error.message
        });
    }
}