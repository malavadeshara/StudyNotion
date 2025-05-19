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
        });
    }
}

// Get all tags ka handler function
exports.showAllCategories = async (req, res) => {
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
        });
    }
}

// category page details
exports.categoryPageDetails = async (req, res) => {
    try {
        // get category id
        const { categoryId } = req.body;

        // get courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId).populate({
            path: "courses",
            match: { status: "Published" },
            populate: "ratingAndReviews",
        }).exec()
        console.log("Selected Category:", selectedCategory);
        console.log("Selected Category Negation:", !selectedCategory);

        // Handle the case when the category is not found
        if (!selectedCategory) {
            console.log("Category not found.")
            return res
                .status(404)
                .json({ success: false, message: "Category not found" })
        }
        // Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        // Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        })
        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id
        ).populate({
            path: "courses",
            match: { status: "Published" },
        }).exec();
        //console.log("Different COURSE", differentCategory)
        // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: {
                    path: "instructor",
                },
            })
            .exec()
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)
        // console.log("mostSellingCourses COURSE", mostSellingCourses)
        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching category page details",
            error: error.message
        });
    }
}