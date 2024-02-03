const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    items: [{ type: Schema.Types.ObjectId, ref: "Item", required: true }],
    order_date: { type: Date },
    status: {
        type: String,
        required: true,
        enum: ["Pending", "Shipped", "Delivered"],
        default: "Pending"
    }
});

orderSchema.virtual("url").get(function () {
    return `/inventory/order/${this._id}`;
});

orderSchema.virtual("order_date_format").get(function () {
    return DateTime.fromJSDate(this.order_date).toLocaleString(DateTime.DATE_MED);
});

orderSchema.virtual("total_price").get(function () {
    let total_price = 0;

    if (this.items && Array.isArray(this.items)) {
        // Fetch the items from the database or use a fixed price
        // Assuming this.items is an array of objects with a 'price' property
        this.items.forEach(item => {
            total_price += item.price;
        });
    }

    return total_price;
});

module.exports = mongoose.model("Order", orderSchema);