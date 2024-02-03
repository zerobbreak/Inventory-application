const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Schema.Types.Number, required: true },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
});

itemSchema.virtual("url").get(function () {
    return `/inventory/item/${this._id}`;
})

module.exports = mongoose.model("Item", itemSchema);
