const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookSchema = new Schema({
    name: { type: String },
    price: { type: Number },
    discount: { type: Number },
    image: { type: String },
    image_public_id: { type: String },
});

module.exports = mongoose.model("Book", BookSchema);
