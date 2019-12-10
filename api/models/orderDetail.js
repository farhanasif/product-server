const mongoose = require('mongoose');

const orderDetailsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('OrderDetails', orderDetailsSchema);