const Order = require('../models/order');
const Item = require("../models/item");
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");
function calculateTotalPrice(items) {
    return items.reduce((total, item) => total + item.price, 0);
}

// GET all orders
exports.getAllOrders = asyncHandler(async (req, res, next) => {
    // Fetch orders from the database (replace this with actual logic)
    const allOrders = await Order.find({})
        .sort({ order_date: 1 })
        .populate('items')
        .exec();

    res.render('order_list', {
        title: 'Orders',
        orders: allOrders,
        calculateTotalPrice: calculateTotalPrice, // Pass the function to the view
    });
});

// GET a specific order by ID
exports.getOrderById = asyncHandler(async (req, res, next) => {
    // Extract order ID from the request parameters
    const orderId = req.params.id;

    // Fetch the specific order from the database (replace this with actual logic)
    const order = await Order.findById(orderId).populate("items").exec();

    if (order === null) {
        const error = new Error("Item doesn't exist");
        error.status = 404;
        return next(error);
    }

    // Calculate total price
    const total_price = calculateTotalPrice(order.items);

    res.render("order_detail", {
        title: "Order",
        order: order,
        total_price: total_price, // Add total_price as a parameter
    })
});

exports.createOrder_get = asyncHandler(async (req, res, next) => {
    try {
        const allItems = await Item.find({}, "name category price").exec();

        res.render("order_form", {
            title: "Create an Order",
            submitButton: 'Order now',
            items: allItems,
        });
    } catch (error) {
        next(error);
    }
});

exports.createOrder_post = [
    body('items', 'Items are required').isArray().notEmpty().escape(),
    body('order_date', 'Invalid order date')
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),
    body('status', 'Invalid order status').isIn(['Pending', 'Shipped', 'Delivered']).escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const newOrder = new Order({
            items: req.body.items,
            order_date: req.body.order_date,
            status: req.body.status,
        });

        try {
            const savedOrder = await newOrder.save();
            res.redirect(savedOrder.url);
        } catch (error) {
            console.error('Error saving order:', error);

            if (error.name === 'ValidationError') {
                // Log validation errors for a clearer understanding
                console.error('Validation errors:', error.errors);
            }

            next(error);
        }
    }),
];

// GET request to display the update form
exports.updateOrder_get = asyncHandler(async (req, res, next) => {
    const orderId = req.params.id;

    // Fetch the order from the database
    const order = await Order.findById(orderId).populate('items').exec();

    if (!order) {
        const error = new Error('Order not found');
        error.status = 404;
        return next(error);
    }

    // Fetch all items from the database
    const allItems = await Item.find({}).exec();

    res.render('order_form', {
        title: 'Update Order',
        submitButton: 'Update Order',
        order: order,
        items: allItems,
    });
});

// POST request to handle the form submission and update the order
exports.updateOrder_post = [
    // Similar validation and sanitization as in the createOrder_post

    asyncHandler(async (req, res, next) => {
        const orderId = req.params.id;
        const errors = validationResult(req);

        const updatedOrder = new Order({
            items: req.body.items,
            order_date: req.body.order_date,
            status: req.body.status,
            _id: orderId, // Include the order ID for updating
        });

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            const allItems = await Item.find({}, 'name').sort({ name: 1 }).exec();

            res.render('order_form', {
                title: 'Update Order',
                submitButton: 'Update Order',
                errors: errors.array(),
                order: updatedOrder,
                items: allItems,
            });
        } else {
            // Data from the form is valid. Update the order.
            await Order.findByIdAndUpdate(orderId, updatedOrder);

            // Redirect to the order details page or any other appropriate response
            res.redirect(updatedOrder.url);
        }
    }),
];


// Delete GET route
exports.deleteOrder_get = asyncHandler(async (req, res, next) => {
    const orderId = req.params.id;

    // Fetch the order details from the database
    const order = await Order.findById(orderId).populate('items').exec();

    if (!order) {
        const error = new Error('Order not found');
        error.status = 404;
        return next(error);
    }

    res.render('order_delete', {
        title: 'Delete Order',
        order: order,
    });
});

// Delete POST route
exports.deleteOrder_post = asyncHandler(async (req, res, next) => {
    const orderId = req.params.id;

    try {
        // Delete the order from the database
        await Order.findByIdAndDelete(orderId);

        // Redirect to the order list or any other appropriate response
        res.redirect('/inventory/orders');
    } catch (error) {
        // Handle database delete errors
        next(error);
    }
});
