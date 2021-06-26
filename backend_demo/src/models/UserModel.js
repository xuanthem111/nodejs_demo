const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    fcmToken: String,
    createdAt: {
        type: Number,
        default: Date.now
    }
});

UserSchema.pre('save', async function(next) {
    // const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

module.exports = mongoose.model('User', UserSchema);
