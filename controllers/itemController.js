const Item = require("../models/item");
const Category = require("../models/category");
const Supplier = require("../models/supplier");
const { body, validationResult } = require("express-validator");

const asyncHandler = require("express-async-handler");
const Order = require("../models/order");

exports.index = asyncHandler(async (req, res, next) => {
    // Get details for Stock and products counts
    const numberStock = await Item.countDocuments({}).exec();
    // Fetch the last 3 orders with item details
    const orders = await Order.find({}, 'items status order_date')
        .sort({ order_date: -1 })
        .limit(3)
        .populate('items', 'name description price') // Populate the items field with details
        .exec();

    res.render("index", {
        title: "Inventory Management System Home",
        number_of_stock: numberStock,
        last_orders: orders,
    });
});

// GET all items
exports.getAllItems = asyncHandler(async (req, res) => {
    // Fetch items from the database (replace this with actual logic)
    const items = await Item.find({}, "name category price supplier")
        .sort({ name: 1 })
        .populate({
            path: "category",
            select: "name", // You can choose the fields you want to select from the category document
        })
        .populate({
            path: "supplier",
            select: "company_name", // You can choose the fields you want to select from the supplier document
        })
        .exec();

    // Send a statement indicating it's under development
    res.render("item_list", { title: "Products List", item_list: items });
});

// GET a specific item by ID
exports.item_detail = asyncHandler(async (req, res, next) => {
    // Extract item ID from the request parameters
    const itemId = req.params.id;

    // Fetch the specific item from the database (replace this with actual logic)
    const item = await Item.findById(itemId).populate('supplier').populate('category').exec();

    if (item === null) {
        const error = new Error("Product doesn't exist")
        error.status = 404
        return next(error);
    }

    res.render("item_detail", {
        title: item.name,
        item: item
    });
});

exports.createItem_get = asyncHandler(async (req, res, next) => {
    // Get all categories and suppliers, which we can use for adding to our item.
    const [allCategories, allSuppliers] = await Promise.all([
        Category.find().sort({ name: 1 }).exec(),
        Supplier.find().sort({ company_name: 1 }).exec(),
    ]);

    res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        suppliers: allSuppliers
    });
});

// POST a new item
exports.createItem_post = [
    // Validate and sanitize fields
    body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
    body("description", "Description must not be empty.").trim().isLength({ min: 1 }).escape(),
    body("category", "Category must not be empty.").trim().isLength({ min: 1 }).escape(),
    body("price", "Price must not be empty.").trim().isLength({ min: 1 }).escape(),
    body("supplier", "Supplier must not be empty").trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a new Item object with escaped and trimmed data.
        const newItem = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            supplier: req.body.supplier,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized fields values/error messages.

            // Log validation errors for debugging
            console.error('Validation errors:', errors.array());

            // Get all categories and suppliers for form.
            const [allCategories, allSuppliers] = await Promise.all([
                Category.find().sort({ name: 1 }).exec(),
                Supplier.find().sort({ company_name: 1 }).exec(),
            ]);

            res.render("item_form", {
                title: "Create Item",
                categories: allCategories,
                suppliers: allSuppliers,
                item: newItem,
                errors: errors.array(),
            });
        } else {
            // Data from form is valid. Save item.
            await newItem.save();

            // Log success for debugging
            console.log('Item created successfully:', newItem);

            res.redirect(newItem.url);
        }
    })
];


exports.item_update_get = asyncHandler(async (req, res, next) => {
    //Get item, categories, and suppliers for the form.
    const [item, allCategories, allSuppliers] = await Promise.all([
        Item.findById(req.params.id).populate("category").populate("supplier").exec(),
        Category.find().sort({ name: 1 }).exec(),
        Supplier.find().sort({ company_name: 1 }).exec(),
    ]);

    if (item === null) {
        //No results.
        const err = new Error("Items not found");
        err.status = 404;
        return next(err);
    }

    res.render("item_form", {
        title: "Update Item",
        categories: allCategories,
        suppliers: allSuppliers,
        item: item,
    })
})

exports.item_update_post = [
    // Validate and sanitize fields.
    body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
    body("description", "Description must not be empty.").trim().isLength({ min: 1 }).escape(),
    body("category", "Category must not be empty.").trim().isLength({ min: 1 }).escape(),
    body("price", "Price must not be empty.").trim().isLength({ min: 1 }).escape(),
    body("supplier", "Supplier must not be empty.").trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create an Item object with escaped/trimmed data and old id.
        const item = new Item({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            supplier: req.body.supplier,
            _id: req.params.id, // This is required, or a new ID will be assigned!
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all categories and suppliers for form.
            const [allCategories, allSuppliers] = await Promise.all([
                Category.find().sort({ name: 1 }).exec(),
                Supplier.find().sort({ company_name: 1 }).exec(),
            ]);

            res.render("item_form", {
                title: "Update Item",
                categories: allCategories,
                suppliers: allSuppliers,
                item: item,
                errors: errors.array(),
            });
            return;
        } else {
            // Data from form is valid. Update the record.
            const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
            // Redirect to item detail page.
            res.redirect(updatedItem.url);
        }
    }),
]

// Handle item delete on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
    const item = await Item.findById(req.params.id).populate("category").populate("supplier").exec();

    if (item === null) {
        // No results.
        res.redirect("/items");
    }

    res.render("item_delete", {
        title: "Delete Item",
        item: item,
    });
});

exports.item_delete_post = asyncHandler(async (req, res, next) => {
    // Assume the post has a valid id (i.e., no validation/sanitization).
    const item = await Item.findById(req.params.id).populate("category").populate("supplier").exec();

    if (item === null) {
        // No results.
        res.redirect(item.url);
    }

    // Delete object and redirect to the list of items.
    await Item.findByIdAndDelete(req.params.id);
    res.redirect(item.url);
});



