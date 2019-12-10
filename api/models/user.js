const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: Number, min: 1, max: 3, required: true, default: 2 },
    verificationCode: { type: String, required: true },
    verified: { type: Number, min: 1, max: 3, required: true, default: 2 },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);