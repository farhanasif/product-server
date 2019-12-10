const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    shippingAddress: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
    payment: { type: Number, default: 1 },
    orderDate: { type: Date, default: Date.now },
    tracking: { type: String },
    status: { type: String, default: 'SUBMITTED' }
});

module.exports = mongoose.model('Order', orderSchema);