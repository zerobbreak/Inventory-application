const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const supplierSchema = new Schema({
    company_name: { type: String, required: true },
    contact_person: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true, maxLength: 12 },
    address: { type: String, required: true },
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
})

supplierSchema.virtual("url").get(function () {
    return `/inventory/supplier/${this._id}`;
})

function shortenAddress(address) {
    //Split the address into parts 
    const addressParts = address.split(", ");

    //If there are more than 2 parts, shorten the second part (usually city)
    if (addressParts.length > 2) {
        addressParts[1] = addressParts[1].subString(0, 3);
    }

    //Join the modified address parts back together
    const shortenedAddress = addressParts.join(", ");

    return shortenedAddress;
}

supplierSchema.virtual("address_formatted").get(function () {
    return shortenAddress(this.address);
})

module.exports = mongoose.model("Supplier", supplierSchema);