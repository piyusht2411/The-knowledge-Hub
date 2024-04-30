const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
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
    color:{
        type:String,
        required:true,
    }
}, {
    timestamps: true
}
);

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) { return next(); }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();

})

const User = mongoose.model('User', userSchema);
module.exports = User;