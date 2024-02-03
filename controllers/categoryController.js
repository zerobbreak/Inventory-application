const Category = require('../models/category');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");
// GET all categories
exports.listCategories = async (req, res, next) => {
    try {
        const categories = await Category.find(); // Fetch all categories from the database

        // Render the categories list view (replace 'categories_list' with your actual view name)
        res.render('categories_list', { title: 'Categories List', categories: categories });
    } catch (error) {
        // Handle any errors that occur during the process
        next(error);
    }
};

exports.getCategoryById = async (req, res, next) => {
    try {
        const categoryId = req.params.id; // Extract category ID from request parameters
        const category = await Category.findById(categoryId); // Fetch the category from the database

        if (!category) {
            // Handle case where category is not found
            res.status(404).send('Category not found');
            return;
        }

        // Render the category view (replace 'category_detail' with your actual view name)
        res.render('category_detail', { title: 'Category Detail', category: category });
    } catch (error) {
        // Handle any errors that occur during the process
        next(error);
    }
};

// Display create category form on GET
exports.createCategory_get = (req, res) => {
    res.render('category_form', { title: 'Create Category' });
};

// Handle create category on POST
exports.createCategory_post = [
    // Validate and sanitize fields
    body('name', 'Category name is required').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description is required').trim().isLength({ min: 1 }).escape(),

    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            res.render('category_form', {
                title: 'Create Category',
                name: req.body.name,
                description: req.body.description,
                errors: errors.array(),
            });
            return;
        }

        // Data from form is valid
        try {
            const newCategory = new Category({
                name: req.body.name,
                description: req.body.description,
            });
            await newCategory.save();
            res.redirect(newCategory.url);  // Redirect to the list of categories
        } catch (error) {
            next(error);
        }
    },
];

// Display update category form on GET
exports.updateCategory_get = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id).exec();

        if (!category) {
            const notFoundError = new Error('Category not found');
            notFoundError.status = 404;
            throw notFoundError;
        }

        res.render('category_form', {
            title: 'Update Category',
            name: category.name,
            description: category.description,
            _id: category._id,
        });
    } catch (error) {
        next(error);
    }
};

// Handle update category on POST
exports.updateCategory_post = [
    // Validate and sanitize fields
    body('name', 'Category name is required').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description is required').trim().isLength({ min: 1 }).escape(),

    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            res.render('category_form', {
                title: 'Update Category',
                name: req.body.name,
                description: req.body.description,
                _id: req.params.id,
                errors: errors.array(),
            });
            return;
        }

        // Data from form is valid
        try {
            const updatedCategory = {
                name: req.body.name,
                description: req.body.description,
                _id: req.params.id,
            };

            await Category.findByIdAndUpdate(req.params.id, updatedCategory).exec();
            res.redirect('/inventory/categories');  // Redirect to the list of categories
        } catch (error) {
            next(error);
        }
    },
];

// Display form to delete category
exports.deleteCategory_get = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id)
        .exec();

    if (category === null) {
        res.redirect("/inventory/categories");
    }

    res.render('category_delete', {
        title: 'Delete Category',
        category: category
    });
});

// Handle delete category on POST
exports.deleteCategory_post = asyncHandler(async (req, res, next) => {
    await Category.findByIdAndDelete(req.body.id);
    res.redirect('/inventory/categories');  // Redirect to the list of categories
});
