const Supplier = require('../models/supplier');
const Item = require("../models/item");
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");

// GET all suppliers
exports.getAllSuppliers = asyncHandler(async (req, res, next) => {
    // Fetch suppliers from the database (replace this with actual logic)
    const suppliers = await Supplier.find({}).exec();
    res.render("supplier_list", {
        title: "Suppliers",
        suppliers: suppliers,
    })
});

exports.getSupplierById = asyncHandler(async (req, res, next) => {
    const supplier = await Supplier.findById(req.params.id)
        .populate("items")
        .exec();

    if (supplier === null) {
        //No results.
        const err = new Error("Supplier not found");
        err.status = 404;
        return next(err);
    }

    // Fetch the items associated with the supplier
    const items = await Item.find({ supplier: req.params.id });

    res.render("supplier_detail", {
        title: "Supplier",
        supplier: supplier,
        items: items,
    })
});

// Get a new supplier
exports.createSupplier_get = asyncHandler(async (req, res, next) => {
    // Fetch all items from the database
    const allItems = await Item.find({}, "name category, price").exec();
    res.render("supplier_form", {
        title: "Create Supplier",
        items: allItems,
    })
});

// Handle supplier create on POST
exports.createSupplier_post = [
    // Validation and sanitization middleware
    body('items', 'Items are required').isArray().notEmpty().escape(),
    body('company_name', 'Company Name is required').trim().isLength({ min: 1 }).escape(),
    body('contact_person', 'Contact Person is required').trim().isLength({ min: 1 }).escape(),
    body('email', 'Invalid email').trim().isEmail().escape(),
    body('phone', 'Invalid phone number').trim().isMobilePhone().escape(),
    body('address', 'Address is required').trim().isLength({ min: 1 }).escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const newSupplier = new Supplier({
            items: req.body.items,
            company_name: req.body.company_name,
            contact_person: req.body.contact_person,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
        });

        if (!errors.isEmpty()) {
            // There are errors.
            // Render form again with sanitized values and error messages.
            const items = await Item.find({}).exec();

            res.render('supplier_form', {
                title: 'Create Supplier',
                items: items,
                errors: errors.array(),
                supplier: newSupplier,
            });
            return;
        } else {
            // Data from form is valid
            await newSupplier.save();
            res.redirect(newSupplier.url);
        }
    }),
];

// Display form to update supplier
exports.updateSupplier_get = asyncHandler(async (req, res, next) => {
    try {
        const supplier = await Supplier.findById(req.params.id).populate('items').exec();

        if (!supplier) {
            const error = new Error('Supplier not found');
            error.status = 404;
            throw error;
        }

        const allItems = await Item.find().exec();

        // Extract item IDs from the supplier's items
        const selectedItems = supplier.items.map(item => item._id.toString());

        res.render('supplier_form', { title: 'Update Supplier', supplier, allItems, selectedItems });
    } catch (error) {
        next(error);
    }
});

// Handle supplier update on POST.
exports.updateSupplier_post = [
    // Validate and sanitize fields.
    body('company_name', 'Company name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('contact_person', 'Contact person must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('email', 'Email must be a valid email address.').isEmail().normalizeEmail(),
    body('phone', 'Phone number must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('items.*').escape(), // Sanitize items array

    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const updatedSupplier = new Supplier({
            _id: req.params.id,
            company_name: req.body.company_name,
            contact_person: req.body.contact_person,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            items: req.body.items, // items array from the form
        });

        if (!errors.isEmpty()) {
            // There are errors.
            const items = await Item.find().exec(); // Fetch all available items
            res.render('supplier_form', { title: 'Update Supplier', supplier: updatedSupplier, items, errors: errors.array() });
            return;
        }

        try {
            // Data from form is valid. Update the supplier.
            await Supplier.findByIdAndUpdate(req.params.id, updatedSupplier, {});

            // Redirect to the updated supplier's detail page.
            res.redirect(updatedSupplier.url);
        } catch (error) {
            next(error);
        }
    }),
];


// Display form to delete supplier
exports.deleteSupplier_get = asyncHandler(async (req, res, next) => {
    try {
        const supplier = await Supplier.findById(req.params.id).exec();
        
        if (!supplier) {
            const error = new Error('Supplier not found');
            error.status = 404;
            throw error;
        }

        res.render('supplier_delete', { title: 'Delete Supplier', supplier });
    } catch (error) {
        next(error);
    }
});

// Handle delete supplier on POST
exports.deleteSupplier_post = asyncHandler(async (req, res, next) => {
    try {
        await Supplier.findByIdAndDelete(req.params.id).exec();
        res.redirect('/inventory/suppliers');  // Redirect to the list of suppliers
    } catch (error) {
        next(error);
    }
});
