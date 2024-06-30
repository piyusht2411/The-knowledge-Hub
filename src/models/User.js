const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    image:{
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpireAt: {
        type: Date,
        default: Date.now
    },
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    likedBlogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }],
    dislikedBlogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }],
    likedComments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    dislikedComments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) { return next(); }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    user.otp = await bcrypt.hash(user.otp, salt);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
