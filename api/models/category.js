const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    description: { type: String, required: true },
    gender: { type: String, required: true },
    categoryImage: { type: String, required: true },
});

module.exports = mongoose.model('Category', categorySchema);